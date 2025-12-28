CREATE TABLE recipe_book.recipes (
    recipe_id          NUMBER GENERATED ALWAYS AS IDENTITY,
    title              NVARCHAR2(200)        NOT NULL,
    description        NVARCHAR2(1000),
    ingredients        NCLOB                  NOT NULL,
    steps              NCLOB                  NOT NULL,
    cuisine            NVARCHAR2(100),
    created_by_user_id NVARCHAR2(128),
    is_public          NUMBER(1) DEFAULT 1    NOT NULL,
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,

    CONSTRAINT pk_recipes
        PRIMARY KEY (recipe_id),

    CONSTRAINT fk_recipes_created_by_user
        FOREIGN KEY (created_by_user_id)
        REFERENCES recipe_book.users (user_id)
);
