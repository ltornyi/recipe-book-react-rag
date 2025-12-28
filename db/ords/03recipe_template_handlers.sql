-- add a template for /recipes
BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'recipe_api',
        p_pattern => 'recipes/'
    );   
END;
/

-- DEFINE GET handler
-- example: GET /ords/recipe_book/recipes?q=chicken&userid=7
BEGIN
    ORDS.DEFINE_HANDLER(
        p_module_name => 'recipe_api',
        p_pattern => 'recipes/',
        p_method => 'GET',
        p_source_type => ords.source_type_collection_feed,
        p_source => q'[
            select r.recipe_id,
                r.title,
                r.description,
                r.cuisine,
                r.created_by_user_id,
                u.email AS created_by_user_email,
                r.is_public,
                r.created_at,
                r.updated_at
            FROM recipe_book.recipes r
            LEFT JOIN recipe_book.users u
                ON r.created_by_user_id = u.user_id
            WHERE
                (r.is_public = 1
                 OR (r.is_public = 0 AND r.created_by_user_id = :userid))
                AND (
                    nvl(:qry,'%') = '%'
                    OR (
                        LOWER(r.title)       LIKE LOWER(:qry)
                        OR LOWER(r.description) LIKE LOWER(:qry)
                        OR LOWER(r.ingredients) LIKE LOWER(:qry)
                        OR LOWER(r.steps)       LIKE LOWER(:qry)
                        OR LOWER(r.cuisine)     LIKE LOWER(:qry)
                    )
                )
        ]'
    );   
END;
/

-- Define the POST handler for /recipes
-- example: POST /ords/recipe_book/recipes
-- Content-Type: application/json
-- {
--   "title": "Pasta Carbonara",
--   "description": "Classic Italian dish",
--   "ingredients": "Pasta, eggs, pancetta",
--   "steps": "Boil pasta...",
--   "cuisine": "Italian",
--   "is_public": true,
--   "userId": 7
-- }
--curl -i -H "Content-Type: application/json" -X POST -d "{ \"title\" : \"New Recipe\", \"description\" : \"A delicious recipe\", \"ingredients\" : \"ing\", \"steps\" : \"steps\", \"cuisine\" : \"Italian\", \"is_public\" : 1, \"userid\" : \"userid\" }" https://yourendpoint.oraclecloudapps.com/ords/recipe_book/api/recipes/
BEGIN
    ORDS.DEFINE_HANDLER(
        p_module_name => 'recipe_api',
        p_pattern     => 'recipes/',
        p_method      => 'POST',
        p_source_type => ORDS.SOURCE_TYPE_PLSQL,
        p_source      => q'[
            DECLARE
                l_id NUMBER;
            BEGIN
                INSERT INTO recipe_book.recipes (
                    title,
                    description,
                    ingredients,
                    steps,
                    cuisine,
                    is_public,
                    created_by_user_id
                )
                VALUES (
                    :title,
                    :description,
                    :ingredients,
                    :steps,
                    :cuisine,
                    :is_public,
                    :userid
                )
                RETURNING recipe_id INTO l_id;

                :recipe_id := l_id;
            END;
        ]',
        p_mimes_allowed => 'application/json'
    );
END;
/

-- define out parameter
-- example response: { "recipe_id": 42 }
BEGIN
    ORDS.DEFINE_PARAMETER(
        p_module_name => 'recipe_api',
        p_pattern => 'recipes/',
        p_method => 'POST',
        p_name => 'recipe_id',
        p_bind_variable_name => 'recipe_id',
        p_source_type => 'RESPONSE',
        p_access_method => 'OUT',
        p_param_type => 'INT'
    );
END;
/

