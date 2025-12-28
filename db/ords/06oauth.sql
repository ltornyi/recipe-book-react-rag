begin 
  oauth.create_client(
    p_name => 'S2S Recipe Client',
    p_grant_type => 'client_credentials',
    p_privilege_names => 'recipes.privilege',
    p_support_email => 'nobody@acme.com'
  );
  commit;
end;
/

begin 
  oauth.grant_client_role(
    'S2S Recipe Client',
    'Recipe user'
  );
  commit;
end;
/