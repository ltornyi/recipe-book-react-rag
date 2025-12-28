BEGIN
    ORDS.DEFINE_MODULE(
        p_module_name => 'recipe_api',
        p_base_path => '/api',
        p_items_per_page=> 5000,
        p_status => 'PUBLISHED'
    );    
END;
/