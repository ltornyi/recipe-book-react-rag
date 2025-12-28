# APIs

## Create the api using the SWA extension command

`Azure Static Web Apps: Create HTTP Function....`

## Create ORDS endpoints

See under `db`. The Oracle Autonomous DB hostname and base path goes into the environment variable named `ORACLE_ORDS_BASE_URL`. The generated client id and client secret go into the environment variables `ORACLE_ORDS_CLIENT_ID` and `ORACLE_ORDS_CLIENT_SECRET`.

## Local development

Add environment variables to local.settings.json, example:

    {
        "Values": {
            "ALLOWED_EMAIL_DOMAIN": "@mycompanydomain.com",
            "ORACLE_ORDS_BASE_URL": "https://your.ads.host/ords/recipe_book/",
            "ORACLE_ORDS_CLIENT_ID": "your.ords.client.id",
            "ORACLE_ORDS_CLIENT_SECRET": "your.ords.client.secret"
        }
    }

Start the function app locally

    cd api
    npm start

Endpoints are available under `http://localhost:7071/api` but because of the SWA authentication checks, you should leverage the
SWA emulator, see details under `ui`. Function endpints will be available under `http://localhost:4280/api`.    

## Deploy to Azure

Deployment is automatic with Github actions when changes are pushed or merged into the main branch. After the initial deployment,
set up the environment variables for the static app in Azure portal under Settings -> Environment variables.

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
    - `q` (string) — cross-column text search across `title`, `description`, `ingredients`, `steps`, `cuisine`
  - Response: `{ [ { recipe_id, title, description, cuisine, created_by_user_email, created_by_user_id, is_public, created_at, updated_at } ] }`
  - Notes: private recipes (`is_public = 0`) require ownership.

- **Get single recipe**
  - Method: `GET`
  - Route: `/api/recipes/{id}`
  - Response: full recipe row including `ingredients` and `steps` (NCLOB fields)
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