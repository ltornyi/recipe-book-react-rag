## Create database user and grant permissions

### Create Oracle DBuser to own objects

    create user recipe_book identified by "<password>" default tablespace data quota unlimited on data;
    GRANT resource, connect TO recipe_book;

### Enable ORDS for recipe_book

run `ords\01schema.sql` as ADMIN

### Create objects

Run the scripts in the `tables` folder as RECIPE_BOOK:

    users.sql
    recipes.sql
    user_favourite_recipes.sql

## Set up APIs

### Configure ORDS

Log into the Database actions portal as RECIPE_BOOK and continue ORDS setup. Run the following scripts:

    02module.sql
    03recipe_template_handlers.sql
    04recipe_id_template_handlers.sql

### Test using curl

    curl -X GET "https://<your-adb-hostname>/ords/recipe_book/api/recipes?q=%25&userid=7"

See more examples in the scripts.

## Secure endpoints

Run the following script as RECIPE_BOOK:

    05role_privilege.sql

Try the curl commands; now all should return 401 Unauthorized

## Set up client

Run the script `ords\06oauth.sql` as RECIPE_BOOK. Verify the client setup:

    select client_id,client_secret from user_ords_clients where name = 'S2S Recipe Client';
    select * from user_ords_client_roles where client_name = 'S2S Recipe Client';

Try getting an access token:

    curl -i --user clientId:clientSecret --data "grant_type=client_credentials" https://<your-adb-hostname>/ords/recipe_book/oauth/token

The response should be HTTP 200 and the response JSON will contain the access token.

Try accessing a protected endpoint again; this time it should succeed:

    curl -i -H "Authorization: Bearer accessToken" https://<your-adb-hostname>/ords/recipe_book/api/recipes/
