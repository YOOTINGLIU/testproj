const express = require('express');
const sql = require('mssql');

const app = express();
const PORT = process.env.PORT || 3000;

// SQL Server 連線設定
const config = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'testdb',
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
    options: {
        trustServerCertificate: true
    }
};

app.use(express.json());

// 測試連線
app.get('/api/health', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        res.json({ status: 'healthy', message: 'SQL Server 連線正常' });
    } catch (error) {
        res.status(500).json({ error: '無法連接 SQL Server', details: error.message });
    }
});

// 取得所有項目
app.get('/api/items/:format?', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .query('SELECT * FROM Items');
        res.json({ items: result.recordset });
    } catch (error) {
        res.status(500).json({ error: '取得資料失敗', details: error.message });
    }
});

// 新增項目
app.post('/api/items', async (req, res) => {
    try {
        const { name, code, quantity } = req.body;
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('code', sql.NVarChar, code)
            .input('quantity', sql.Int, quantity)
            .query('INSERT INTO Items (name, code, quantity) VALUES (@name, @code, @quantity); SELECT SCOPE_IDENTITY() AS id');
        res.json({ id: result.recordset[0].id, message: '新增成功' });
    } catch (error) {
        res.status(500).json({ error: '新增失敗', details: error.message });
    }
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`伺服器運行在 http://localhost:${PORT}`);
    console.log(`API: http://localhost:${PORT}/api/items/:format?`);
});