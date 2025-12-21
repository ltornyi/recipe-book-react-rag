# APIs

## Create the api using the SWA extension command

`Azure Static Web Apps: Create HTTP Function....`

## Set up EntraID identity for the API

This involves creating an application registration, a client secret and creating an externally identified user in the database. Ultimately it didn't work - for some reason, the connection was immediately dropped.

## Set up SQL authentication for the API

### Create database user and grant permissions

See under `db`. The Azure SQL Server hostname and the database name go into the environment variables named `AZURE_SQL_SERVER` and `AZURE_SQL_DATABASE`. The database username and password go into the environment variables `AZURE_SQL_USER` and `AZURE_SQL_PASSWORD`.

### Test database connectivity

Create a .env file with the following values:

    AZURE_SQL_SERVER=myserver.database.windows.net
    AZURE_SQL_DATABASE=RecipeDB
    AZURE_SQL_USER=username
    AZURE_SQL_PASSWORD=password

Run

    node ./test_db_connection.js

## Local development

Add environment variables to local.settings.json, example:

    {
        "Values": {
            "AZURE_SQL_SERVER": "myserver.database.windows.net",
            "AZURE_SQL_DATABASE": "RecipeDB",
            "AZURE_SQL_USER": "username",
            "AZURE_SQL_PASSWORD": "password",
            "ALLOWED_EMAIL_DOMAIN": "@mycompanydomain.com"
        }
    }

Start the function app locally

    cd api
    npm start

Endpoints are available under `http://localhost:7071/api` but because of the SWA authentication checks, you should leverage the
SWA emulator, see details under `ui`. Function endpints will be available under `http://localhost:4280/api`.    

## Deploy to Azure

Deployment is automatic with Github actions when changes are pushed or merged into the main branch. After the initial deployment,
set up the five environment variables for the static app in Azure portal under Settings -> Environment variables.

## Documentation: Recipe APIs

These are HTTP endpoints added under the Azure Functions app in `api/src/functions/recipes.ts`.

**Base path**: `/api` (Azure Functions default)

**Authentication**: The app uses SWA headers (`x-ms-client-principal`) and enforces `ALLOWED_EMAIL_DOMAIN`.

**Common headers**:
- `Content-Type: application/json` for POST/PUT
- `x-ms-client-principal`: base64 JSON identity header (provided by Azure Static Web Apps / Functions auth)

**Endpoints**

- **List recipes**
  - Method: `GET`
  - Route: `/api/recipes`
  - Query params:
    - `page` (int, default 1)
    - `pageSize` (int, default 20, max 100)
    - `sortBy` (string) — allowed: `recipe_id`, `title`, `cuisine`, `created_at`, `updated_at`, `is_public`, `created_by_user_email`
    - `sortDir` (`asc`|`desc`, default `asc`)
    - `q` (string) — cross-column text search across `title`, `description`, `ingredients`, `steps`, `cuisine`
    - `filter_<column>=<value>` — simple equality filters for allowed columns (e.g. `filter_cuisine=Italian`, `filter_is_public=1`).
  - Response: `{ total, page, pageSize, items: [ { recipe_id, title, description, cuisine, created_by_user_email, created_by_user_id, is_public, created_at, updated_at } ] }`
  - Notes: private recipes (`is_public = 0`) require ownership.

- **Get single recipe**
  - Method: `GET`
  - Route: `/api/recipes/{id}`
  - Response: full recipe row including `ingredients` and `steps` (NVARCHAR(MAX) fields)
  - Notes: private recipes (`is_public = 0`) require ownership.

- **Create recipe**
  - Method: `POST`
  - Route: `/api/recipes`
  - Body (JSON): `{ title, description?, ingredients, steps, cuisine?, is_public? }`
  - Response: `201` with `{ recipe_id, message }`
  - Validation: `title` (required, <=200), `ingredients` (required), `steps` (required), `cuisine` (<=100)
  - Security: `created_by_user_id` set from identity.

- **Update recipe**
  - Method: `PUT`
  - Route: `/api/recipes/{id}`
  - Body (JSON): any subset of `{ title, description, ingredients, steps, cuisine, is_public }`
  - Response: `200` on success `{ recipe_id, message }` or `404` if not found/not permitted
  - Security: Requires ownership (only owner may update).

- **Delete recipe**
  - Method: `DELETE`
  - Route: `/api/recipes/{id}`
  - Response: `204` on success, `404` if not found/not permitted
  - Security: Requires ownership (only owner may delete).