const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('💡 啟動 SQL 模式伺服器...\n');

let connection;

async function getConnection() {
    if (!connection || connection._closed) {
        connection = await mysql.createConnection({
            host: '172.235.171.79',
            port: 30663,
            user: 'root',
            password: 'drqRB19fy3pa87nUVe6Z4v2IKY50uPAl',
            charset: 'utf8mb4'
        });
        await connection.query('USE openclaw');
        console.log('✅ 資料庫連線成功\n');
    }
    return connection;
}

app.use(express.json());
app.use(express.static('.'));

app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('页面不存在');
    }
});

app.get('/api/health', async (req, res) => {
    try {
        const conn = await getConnection();
        await conn.query('SELECT 1');
        res.json({
            status: 'healthy',
            message: '資料庫連線正常',
            provider: 'MySQL',
            database: 'openclaw'
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/items', async (req, res) => {
    try {
        const conn = await getConnection();
        const [rows] = await conn.query('SELECT id, part_number, type, stock FROM parts ORDER BY id');
        res.json({ data: rows });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/logs', async (req, res) => {
    try {
        const conn = await getConnection();
        const [rows] = await conn.query('SELECT id, part_number, quantity, log_type, date, customer FROM logs ORDER BY date DESC, id DESC');
        res.json({ data: rows });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/statistics', async (req, res) => {
    try {
        const conn = await getConnection();
        const [stockResult] = await conn.query('SELECT COALESCE(SUM(stock), 0) as total FROM parts');
        const [logsResult] = await conn.query('SELECT COUNT(*) as count FROM logs');
        res.json({
            totalItems: 8,
            totalStock: stockResult[0].total,
            logsCount: logsResult[0].count
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ 伺服器運行成功: http://localhost:${PORT}`);
});