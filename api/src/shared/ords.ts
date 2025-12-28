import { AuthenticatedUser } from "./auth";

export interface OrdsRecipe {
    recipe_id: number;
    title: string;
    description: string;
    cuisine: string;
    created_by_user_id: string;
    created_by_user_email: string;
    is_public: number;
    created_at: string;
    updated_at: string;
}

export const getAccessToken = async (): Promise<string> => {
    const tokenUrl = `${process.env.ORACLE_ORDS_BASE_URL}oauth/token`;
    const clientId = process.env.ORACLE_ORDS_CLIENT_ID;
    const clientSecret = process.env.ORACLE_ORDS_CLIENT_SECRET;

    //create POST request to get access token
    //send clientId and clientSecret in header as Basic Authentication
    //send grant_type=client_credentials in body as x-www-form-urlencoded
    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
        },
        body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
};

export const getRecipeList = async (accessToken: string, search: string | undefined, user: AuthenticatedUser): Promise<OrdsRecipe[]> => {
    const url = new URL(`${process.env.ORACLE_ORDS_BASE_URL}api/recipes/`);
    if (search) {
        url.searchParams.append('qry', '%' + search + '%');
    }
    url.searchParams.append('userid', user.userId);
    //add access token in Authorization header as Bearer token
    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to get recipe list: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.items;
};

export const getRecipeById = async (accessToken: string, id: number, user: AuthenticatedUser): Promise<OrdsRecipe | null> => {
    const url = new URL(`${process.env.ORACLE_ORDS_BASE_URL}api/recipes/${id}`);
    url.searchParams.append('userid', user.userId);
    //add access token in Authorization header as Bearer token
    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error(`Failed to get recipe by id: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as OrdsRecipe;
    // Visibility: public recipes visible to all; private only to creator
    if (!data.is_public && data.created_by_user_id !== user.userId) return null;
    return data;
};

export const createRecipe = async (accessToken: string, body: any, user: AuthenticatedUser): Promise<number> => {
    const url = new URL(`${process.env.ORACLE_ORDS_BASE_URL}api/recipes/`);
    //add access token in Authorization header as Bearer token
    const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...body, is_public: (body.is_public ? 1 : 0), userid: user.userId })
    });

    if (!response.ok) {
        throw new Error(`Failed to create recipe: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.recipe_id;
};

export const updateRecipe = async (accessToken: string, id: number, body: any, user: AuthenticatedUser): Promise<boolean> => {
    // ensure owner
    const exist = await getRecipeById(accessToken, id, user);
    if (!exist) return false;
    if (exist.created_by_user_id !== user.userId) return false;

    const url = new URL(`${process.env.ORACLE_ORDS_BASE_URL}api/recipes/${id}`);
    //add access token in Authorization header as Bearer token
    const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...body, is_public: (body.is_public ? 1 : 0), userid: user.userId })
    });
    if (!response.ok) {
        throw new Error(`Failed to update recipe: ${response.status} ${response.statusText}`);
    }
    return true;
};

export const deleteRecipe = async (accessToken: string, id: number, user: AuthenticatedUser): Promise<boolean> => {
    // ensure owner: part of the deleteRecipe API
    
    const url = new URL(`${process.env.ORACLE_ORDS_BASE_URL}api/recipes/${id}`);
    url.searchParams.append('userid', user.userId);
    //add access token in Authorization header as Bearer token
    const response = await fetch(url.toString(), {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to delete recipe: ${response.status} ${response.statusText}`);
    }
    return true;
};