import sql from "mssql";
import { sanitizeSortColumn, sanitizeSortDir, buildFilterClauses } from "./sqlHelpers";
import { InvocationContext } from "@azure/functions";

interface ListOptions {
    page: number;
    pageSize: number;
    sortBy?: string;
    sortDir?: string;
    search?: string | null;
    filters?: Record<string, any>;
}

export async function getList(pool: sql.ConnectionPool, opts: ListOptions, user: any, context: InvocationContext) {
    const page = Math.max(1, opts.page || 1);
    const pageSize = Math.min(100, opts.pageSize || 20);
    const offset = (page - 1) * pageSize;

    // Determine ORDER BY: use client-specified sort when provided, otherwise use a deterministic fallback
    let orderByClause = "";
    if (opts.sortBy) {
        const sortCol = sanitizeSortColumn(opts.sortBy);
        const sortDir = sanitizeSortDir(opts.sortDir);
        orderByClause = `ORDER BY ${sortCol} ${sortDir}`;
    } else {
        // fallback deterministic ordering to allow OFFSET/FETCH and stable pagination
        orderByClause = `ORDER BY r.created_at DESC, r.recipe_id DESC`;
    }

    // Build filters
    const filterResult = buildFilterClauses(opts.filters || {}, pool);

    const whereParts: string[] = ["1=1"];
    for (const c of filterResult.clauses) whereParts.push(c);

    const params: { name: string; value: any; type?: any }[] = [...filterResult.params];

    // Visibility: show all public recipes + user's private recipes
    // (is_public = 1) OR (is_public = 0 AND created_by_user_id = @userId)
    params.push({ name: "userId", value: user.userId });
    whereParts.push("(r.is_public = 1 OR (r.is_public = 0 AND r.created_by_user_id = @userId))");

    // search across text columns
    if (opts.search) {
        params.push({ name: `s`, value: `%${opts.search}%` });
        whereParts.push("(r.title LIKE @s OR r.description LIKE @s OR r.ingredients LIKE @s OR r.steps LIKE @s OR r.cuisine LIKE @s)");
    }

    const whereClause = whereParts.length ? "WHERE " + whereParts.join(" AND ") : "";

    const sqlText = `SELECT COUNT(*) OVER() AS total_count,
        r.recipe_id, r.title, r.description, r.cuisine, r.created_by_user_id, u.email AS created_by_user_email, r.is_public, r.created_at, r.updated_at
    FROM recipe_book.recipes r
    LEFT JOIN recipe_book.users u ON r.created_by_user_id = u.user_id
    ${whereClause}
    ${orderByClause}
    OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`;

    const request = pool.request();
    request.input("offset", sql.Int, offset);
    request.input("pageSize", sql.Int, pageSize);

    for (const p of params) {
        // best-effort type inference
        if (typeof p.value === "number") request.input(p.name, sql.Int, p.value);
        else if (typeof p.value === "boolean") request.input(p.name, sql.Bit, p.value);
        else request.input(p.name, sql.NVarChar(sql.MAX), p.value);
    }

    context.log('Executing getList SQL:', sqlText, 'with params:', params);
    const result = await request.query(sqlText);
    const total = result.recordset.length ? result.recordset[0].total_count : 0;
    // strip total_count from items
    const items = result.recordset.map((r: any) => {
        const { total_count, ...rest } = r;
        return rest;
    });

    return { total, page, pageSize, items };
}

export async function getById(pool: sql.ConnectionPool, id: number, user: any) {
    const request = pool.request();
    request.input("id", sql.Int, id);
    const result = await request.query(`SELECT r.*, u.email AS created_by_user_email FROM recipe_book.recipes r LEFT JOIN recipe_book.users u ON r.created_by_user_id = u.user_id WHERE r.recipe_id = @id`);
    if (!result.recordset.length) return null;
    const row = result.recordset[0];
    // Visibility: public recipes visible to all; private only to creator
    if (!row.is_public && row.created_by_user_id !== user.userId) return null;
    return row;
}

export async function createRecipe(pool: sql.ConnectionPool, body: any, user: any) {
    const request = pool.request();
    request.input("title", sql.NVarChar(200), body.title);
    request.input("description", sql.NVarChar(sql.MAX), body.description || null);
    request.input("ingredients", sql.NVarChar(sql.MAX), body.ingredients);
    request.input("steps", sql.NVarChar(sql.MAX), body.steps);
    request.input("cuisine", sql.NVarChar(100), body.cuisine || null);
    request.input("is_public", sql.Bit, body.is_public === undefined ? 1 : (body.is_public ? 1 : 0));
    request.input("created_by_user_id", sql.NVarChar(128), user.userId);

    const insert = `INSERT INTO recipe_book.recipes (title, description, ingredients, steps, cuisine, is_public, created_by_user_id)
    OUTPUT INSERTED.recipe_id
    VALUES (@title, @description, @ingredients, @steps, @cuisine, @is_public, @created_by_user_id)`;

    const result = await request.query(insert);
    return result.recordset[0].recipe_id;
}

export async function updateRecipe(pool: sql.ConnectionPool, id: number, body: any, user: any) {
    // ensure owner
    const exist = await getById(pool, id, user);
    if (!exist) return false;
    if (exist.created_by_user_id !== user.userId) return false;

    const setParts: string[] = [];
    const request = pool.request();
    request.input("id", sql.Int, id);

    if (body.title !== undefined) { setParts.push("title = @title"); request.input("title", sql.NVarChar(200), body.title); }
    if (body.description !== undefined) { setParts.push("description = @description"); request.input("description", sql.NVarChar(sql.MAX), body.description); }
    if (body.ingredients !== undefined) { setParts.push("ingredients = @ingredients"); request.input("ingredients", sql.NVarChar(sql.MAX), body.ingredients); }
    if (body.steps !== undefined) { setParts.push("steps = @steps"); request.input("steps", sql.NVarChar(sql.MAX), body.steps); }
    if (body.cuisine !== undefined) { setParts.push("cuisine = @cuisine"); request.input("cuisine", sql.NVarChar(100), body.cuisine); }
    if (body.is_public !== undefined) { setParts.push("is_public = @is_public"); request.input("is_public", sql.Bit, body.is_public ? 1 : 0); }

    if (!setParts.length) return true; // nothing to change

    setParts.push("updated_at = SYSUTCDATETIME()");

    const updateSql = `UPDATE recipe_book.recipes SET ${setParts.join(", ")} WHERE recipe_id = @id`;
    await request.query(updateSql);
    return true;
}

export async function deleteRecipe(pool: sql.ConnectionPool, id: number, user: any) {
    // ensure owner
    const exist = await getById(pool, id, user);
    if (!exist) return false;
    if (exist.created_by_user_id !== user.userId) return false;

    const request = pool.request();
    request.input("id", sql.Int, id);
    await request.query(`DELETE FROM recipe_book.recipes WHERE recipe_id = @id`);
    return true;
}
