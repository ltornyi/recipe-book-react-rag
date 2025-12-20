## Create database user and grant permissions

### Create login and DB user

This requires Azure Data Studio.

    USE master;
    CREATE LOGIN <api-user> WITH PASSWORD = '<password>';

    USE <your database>
    CREATE USER <api-user> FOR LOGIN <api-user>;

## Create schema

    CREATE SCHEMA recipe_book;

### Grant permissions

    GRANT SELECT, INSERT, UPDATE, DELETE
    ON SCHEMA::recipe_book
    TO <api-user>;

### Check user setup

    SELECT
        name,
        type_desc,
        authentication_type_desc
    FROM sys.database_principals
    WHERE name = '<api-user>';

    SELECT
        dp.name       AS principal_name,
        dp.type_desc AS principal_type,
        perm.permission_name,
        perm.state_desc,
        s.name        AS schema_name
    FROM sys.database_permissions perm
    JOIN sys.database_principals dp
        ON perm.grantee_principal_id = dp.principal_id
    JOIN sys.schemas s
        ON perm.major_id = s.schema_id
    WHERE dp.name = '<api-user>'
    AND perm.class_desc = 'SCHEMA';

    EXECUTE AS USER = '<api-user>';
    SELECT
        permission_name
    FROM fn_my_permissions(NULL, 'DATABASE');
    REVERT;

    EXECUTE AS USER = '<api-user>';
    SELECT permission_name
    FROM fn_my_permissions('recipe_book', 'SCHEMA');
    REVERT;

## Create objects

Run the scripts in the `tables` folder:

    users.sql
    recipes.sql
    user_favourite_recipes.sql