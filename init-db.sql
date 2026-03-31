-- 建立 DB 和資料表（請在 SQL Server 內執行此 SQL）

-- 建立 DB（如果還沒有）
CREATE DATABASE TestDB;
GO

USE TestDB;
GO

-- 建立 Items 資料表
CREATE TABLE Items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    code NVARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- 插入範例資料
INSERT INTO Items (name, code, quantity) VALUES
    ('項目 A', 'A001', 10),
    ('項目 B', 'B002', 20),
    ('項目 C', 'C003', 15);
GO

SELECT * FROM Items;
GO