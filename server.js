const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

const databaseUrl = process.env.DATABASE_URL_Ting;

console.log('💡 解析資料庫連線字串...');
const user = databaseUrl.split(':')[0];
const password = databaseUrl.split(':')[1];
const hostPort = databaseUrl.match(/@tcp\(([^:]+):(\d+)\)/)[1].split(':');
const host = hostPort[0];
const port = hostPort[1];
const database = databaseUrl.split('/').pop();

console.log(`   用戶: ${user}`);
console.log(`   主機: ${host}:${port}`);
console.log(`   資料庫: ${database}\n`);

let connection;

async function getConnection() {
    if (!connection || connection._closed) {
        connection = await mysql.createConnection({
            host,
            port: parseInt(port, 10),
            user,
            password: pass,
            charset: 'utf8mb4'
        });
        await connection.query(`USE \`${database}\``);
        console.log('✅ 資料庫已選擇');
    }
    return connection;
}

app.use(express.json());

app.get('/api/health', async (req, res) => {
    try {
        const conn = await getConnection();
        await conn.query('SELECT 1');
        res.json({
            status: 'healthy',
            message: '資料庫連線正常',
            provider: 'SQL Server',
            host, port, database
        });
    } catch (e) {
        res.status(500).json({ error: '無法連接資料庫', details: e.message });
    }
});

app.get('/api/items/:format?', async (req, res) => {
    try {
        const conn = await getConnection();
        const [rows] = await conn.query(
            'SELECT id, part_number, type, stock FROM parts ORDER BY id'
        );
        res.json({ data: rows });
    } catch (error) {
        res.status(500).json({ error: '取得資料失敗', details: error.message });
    }
});

app.get('/api/logs/:format?', async (req, res) => {
    try {
        const conn = await getConnection();
        const [rows] = await conn.query(
            'SELECT id, part_number, quantity, log_type, date, customer FROM logs ORDER BY created_at DESC'
        );
        res.json({ data: rows });
    } catch (error) {
        res.status(500).json({ error: '取得資料失敗', details: error.message });
    }
});

app.get('/api/statistics', async (req, res) => {
    try {
        const conn = await getConnection();
        const [result] = await conn.query('SELECT COALESCE(SUM(stock), 0) as total FROM parts');
        const totalStock = result[0].total;
        const [logs] = await conn.query('SELECT COUNT(*) as count FROM logs');
        res.json({
            totalItems: 8,
            totalStock,
            logsCount: logs[0].count
        });
    } catch (error) {
        res.status(500).json({ error: '取得統計失敗', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`📊 SQL 模式伺服器已啟動`);
    console.log(`📡 API: http://localhost:${PORT}`);
    console.log(`   - /api/health`);
    console.log(`   - /api/items`);
    console.log(`   - /api/logs`);
    console.log(`   - /api/statistics`);
});