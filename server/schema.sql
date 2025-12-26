-- Create database manually if not exists
-- CREATE DATABASE Zimmet_App;
-- GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
  CREATE TABLE [dbo].[Users](
    [id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    [name] NVARCHAR(200) NOT NULL,
    [email] NVARCHAR(200) NOT NULL,
    [department] NVARCHAR(200) NULL,
    [role] NVARCHAR(20) NOT NULL DEFAULT 'user',
    [passwordHash] NVARCHAR(200) NOT NULL
  );
END
GO

-- Add missing columns if table already exists
IF COL_LENGTH('dbo.Users', 'role') IS NULL
BEGIN
  ALTER TABLE dbo.Users ADD [role] NVARCHAR(20) NOT NULL DEFAULT 'user';
END
GO

IF COL_LENGTH('dbo.Users', 'passwordHash') IS NULL
BEGIN
  ALTER TABLE dbo.Users ADD [passwordHash] NVARCHAR(200) NOT NULL DEFAULT '';
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Assets]') AND type in (N'U'))
BEGIN
  CREATE TABLE [dbo].[Assets](
    [id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    [name] NVARCHAR(200) NOT NULL,
    [model] NVARCHAR(200) NOT NULL,
    [serial] NVARCHAR(200) NOT NULL,
    [category] NVARCHAR(100) NOT NULL
  );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Categories]') AND type in (N'U'))
BEGIN
  CREATE TABLE [dbo].[Categories](
    [id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    [name] NVARCHAR(100) NOT NULL UNIQUE
  );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Assignments]') AND type in (N'U'))
BEGIN
  CREATE TABLE [dbo].[Assignments](
    [id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    [userId] UNIQUEIDENTIFIER NOT NULL,
    [assetId] UNIQUEIDENTIFIER NOT NULL,
    [assignedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    [note] NVARCHAR(500) NULL,
    CONSTRAINT FK_Assign_User FOREIGN KEY (userId) REFERENCES [dbo].[Users](id) ON DELETE CASCADE,
    CONSTRAINT FK_Assign_Asset FOREIGN KEY (assetId) REFERENCES [dbo].[Assets](id) ON DELETE CASCADE
  );
END
GO
