CREATE TABLE dbo.users (
    user_id            NVARCHAR(128) NOT NULL,   -- Static Web Apps userId
    identity_provider  NVARCHAR(50)  NOT NULL,   -- e.g. 'aad'
    display_name       NVARCHAR(256) NULL,
    email              NVARCHAR(256) NULL,
    created_at         DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    last_seen_at       DATETIME2     NULL,

    CONSTRAINT pk_users
        PRIMARY KEY (user_id)
);
