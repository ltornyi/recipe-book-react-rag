
-- Add a template for /recipes/:id
BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'recipe_api',
        p_pattern     => 'recipes/:id'
    );
END;
/

-- Add the GET handler for /recipes/:id
-- example: GET /ords/recipe_book/recipes/42
BEGIN
    ORDS.DEFINE_HANDLER(
        p_module_name => 'recipe_api',
        p_pattern     => 'recipes/:id',
        p_method      => 'GET',
        p_source_type => ords.source_type_collection_item,
        p_source      => q'[
            SELECT
                r.*,
                u.email AS created_by_user_email
            FROM recipe_book.recipes r
            LEFT JOIN recipe_book.users u
                ON r.created_by_user_id = u.user_id
            WHERE r.recipe_id = :id
        ]'
    );
END;
/

-- Add the PUT handler for /recipes/:id
-- example: PUT /ords/recipe_book/recipes/42
-- Content-Type: application/json
-- {
--   "title": "Updated Carbonara",
--   "is_public": 0
-- }
--curl -i -H "Content-Type: application/json" -X PUT -d "{ \"title\" : \"Updated Carbonara\", \"is_public\" : 0 }" https://yourendpoint.oraclecloudapps.com/ords/recipe_book/api/recipes/40
BEGIN
    ORDS.DEFINE_HANDLER(
        p_module_name => 'recipe_api',
        p_pattern     => 'recipes/:id',
        p_method      => 'PUT',
        p_source_type => ORDS.SOURCE_TYPE_PLSQL,
        p_source      => q'[
            BEGIN
                UPDATE recipe_book.recipes
                SET
                    title       = NVL(:title, title),
                    description = NVL(:description, description),
                    ingredients = NVL(:ingredients, ingredients),
                    steps       = NVL(:steps, steps),
                    cuisine     = NVL(:cuisine, cuisine),
                    is_public   = NVL(:is_public, is_public),
                    updated_at  = SYSTIMESTAMP
                WHERE recipe_id = :id;

                if sql%rowcount = 0 then
                    :status_code := 404;
                    return;
                end if;

                :status_code := 200;
            END;
        ]',
        p_mimes_allowed => 'application/json'
    );
END;
/

-- Add the DELETE handler for /recipes/{id}
-- example: DELETE /ords/recipe_book/recipes/42?userid=7
-- curl -i -X DELETE https://yourendpoint.oraclecloudapps.com/ords/recipe_book/api/recipes/400
BEGIN
    ORDS.DEFINE_HANDLER(
        p_module_name => 'recipe_api',
        p_pattern     => 'recipes/:id',
        p_method      => 'DELETE',
        p_source_type => ORDS.SOURCE_TYPE_PLSQL,
        p_source      => q'[
            DECLARE
                v_creator_id recipe_book.recipes.created_by_user_id%TYPE;
            BEGIN
                -- Retrieve the recipe creator
                SELECT created_by_user_id
                INTO v_creator_id
                FROM recipe_book.recipes
                WHERE recipe_id = :id;

                -- Compare with caller's userid
                IF v_creator_id != nvl(:userid,'xxx') THEN
                    :status_code := 403;
                    RETURN;
                END IF;

                -- Authorized → delete
                DELETE FROM recipe_book.recipes
                WHERE recipe_id = :id;

                :status_code := 204;
            EXCEPTION
                WHEN NO_DATA_FOUND THEN
                    :status_code := 404;
            END;
        ]'
    );
END;
/

