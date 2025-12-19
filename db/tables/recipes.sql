CREATE TABLE dbo.recipes (
    recipe_id          INT IDENTITY(1,1) NOT NULL,
    title              NVARCHAR(200)     NOT NULL,
    description        NVARCHAR(1000)    NULL,
    ingredients        NVARCHAR(MAX)     NOT NULL,
    steps              NVARCHAR(MAX)     NOT NULL,
    cuisine            NVARCHAR(100)     NULL,
    created_by_user_id NVARCHAR(128)     NULL,
    is_public           BIT               NOT NULL DEFAULT 1,
    created_at         DATETIME2         NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at         DATETIME2         NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT pk_recipes
        PRIMARY KEY (recipe_id),

    CONSTRAINT fk_recipes_created_by_user
        FOREIGN KEY (created_by_user_id)
        REFERENCES dbo.users (user_id)
);
