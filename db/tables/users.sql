CREATE TABLE recipe_book.users (
    user_id            NVARCHAR2(128)        NOT NULL,
    identity_provider  NVARCHAR2(50)         NOT NULL,
    display_name       NVARCHAR2(256),
    email              NVARCHAR2(256),
    created_at         TIMESTAMP WITH TIME ZONE 
                           DEFAULT SYSTIMESTAMP NOT NULL,
    last_seen_at       TIMESTAMP WITH TIME ZONE,

    CONSTRAINT pk_users
        PRIMARY KEY (user_id)
);
