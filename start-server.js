const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

const databaseUrl = process.env.DATABASE_URL_Ting;

console.log('💡 解析資料庫連字串...');

// 使用最簡單的方式解析
const userName = databaseUrl.split(':')[0];
const password = databaseUrl.split(':')[1];
const rest = databaseUrl.split('@tcp(')[1];
const [host, port, dbName] = rest.match(/^([^:]+):(\d+)\)/);

console.log(`   主機: ${host}`);
console.log(`   埠號: ${port}`);
console.log(`   資料庫: ${dbName}\n`);

console.log(`   主機: ${hostPort}`);
console.log(`   資料庫: ${db}\n`);

let connection;

async function getConnection() {
    if (!connection || connection._closed) {
        connection = await mysql.createConnection({
            host: hostPort,
            port: parseInt(port, 10),
            user: 'root',
            password: 'drqRB19fy3pa87nUVe6Z4v2IKY50uPAl',
            charset: 'utf8mb4'
        });
        await connection.query(`USE \`${db}\``);
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
            host, port, database: db
        });
    } catch (e) {
        res.status(500).json({ error: '無法連接資料庫', details: e.message });
    }
});

app.get('/api/items', async (req, res) => {
    try {
        const conn = await getConnection();
        const [rows] = await conn.query('SELECT id, part_number, type, stock FROM parts ORDER BY id');
        res.json({ data: rows });
    } catch (error) {
        res.status(500).json({ error: '取得資料失敗', details: error.message });
    }
});

app.get('/api/logs', async (req, res) => {
    try {
        const conn = await getConnection();
        const [rows] = await conn.query('SELECT id, part_number, quantity, log_type, date, customer FROM logs ORDER BY created_at DESC');
        res.json({ data: rows });
    } catch (error) {
        res.status(500).json({ error: '取得資料失敗', details: error.message });
    }
});

app.get('/api/statistics', async (req, res) => {
    try {
        const conn = await getConnection();
        const [result] = await conn.query('SELECT COALESCE(SUM(stock), 0) as total FROM parts');
        const [logs] = await conn.query('SELECT COUNT(*) as count FROM logs');
        res.json({
            totalItems: 8,
            totalStock: result[0].total,
            logsCount: logs[0].count
        });
    } catch (error) {
        res.status(500).json({ error: '取得統計失敗', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`📦 SQL 模式伺服器已啟動`);
    console.log(`📡 API: http://localhost:${PORT}`);
});