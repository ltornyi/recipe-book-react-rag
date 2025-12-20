CREATE TABLE recipe_book.user_favourite_recipes (
    user_id    NVARCHAR(128) NOT NULL,
    recipe_id  INT           NOT NULL,
    created_at DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT pk_user_favourite_recipes
        PRIMARY KEY (user_id, recipe_id),

    CONSTRAINT fk_ufr_user
        FOREIGN KEY (user_id) REFERENCES recipe_book.users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_ufr_recipe
        FOREIGN KEY (recipe_id) REFERENCES recipe_book.recipes(recipe_id)
        ON DELETE CASCADE
);

-- Fast lookup of favourites by user
CREATE INDEX ix_user_favourite_recipes_user_id
ON recipe_book.user_favourite_recipes (user_id);