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
