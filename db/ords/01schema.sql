BEGIN
    ORDS.ENABLE_SCHEMA(
        p_enabled          => TRUE,
        p_schema           => 'RECIPE_BOOK',
        p_auto_rest_auth   => TRUE
    );
END;
/
