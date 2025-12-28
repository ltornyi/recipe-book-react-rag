declare
  l_priv_roles    owa.vc_arr;
  l_priv_patterns owa.vc_arr;
  l_priv_modules  owa.vc_arr;
begin
  l_priv_roles(1) := 'Recipe user';

  l_priv_patterns(1) := '/api/recipes/*';

  l_priv_modules(1) := 'recipe_api';

  ords.create_role(l_priv_roles(1));     
 
  ords.define_privilege(
    p_privilege_name => 'recipes.privilege',
    p_roles          => l_priv_roles,
    p_patterns       => l_priv_patterns,
    p_modules        => l_priv_modules,
    p_label          => 'Recipe data',
    p_description    => 'Provide read/write access to recipe data'
  );
end;
/