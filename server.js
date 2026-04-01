const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('啟動 SQL 模式伺服器...');

let connection;

async function getConnection() {
    if (!connection || connection._closed) {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || '172.235.171.79',
            port: parseInt(process.env.DB_PORT || '30663'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            charset: 'utf8mb4'
        });
        await connection.query('USE ' + (process.env.DB_NAME || 'openclaw'));
        console.log('資料庫連線成功');
    }
    return connection;
}

app.use(express.json());
app.use(express('.'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/health', async (req, res) => {
    try {
        const conn = await getConnection();
        await conn.query('SELECT 1');
        res.json({ status: 'healthy', message: '資料庫連線正常' });
    } catch (e) {
        res.status(500).json({ message: '連線失敗' });
    }
});

app.get('/api/items', async (req, res) => {
    try {
        const [rows] = await getConnection().query('SELECT id, part_number, type, stock FROM parts ORDER BY id');
        res.json({ data: rows });
    } catch (e) {
        res.status(500).json({ message: '讀取失敗' });
    }
});

app.get('/api/logs', async (req, res) => {
    try {
        const [rows] = await getConnection().query('SELECT id, part_number, quantity, log_type, date, customer FROM logs ORDER BY date DESC, id DESC');
        res.json({ data: rows });
    } catch (e) {
        res.status(500).json({ message: '讀取失敗' });
    }
});

app.get('/api/statistics', async (req, res) => {
    try {
        const [stock] = await getConnection().query('SELECT COALESCE(SUM(stock), 0) as total FROM parts');
        const [logsCount] = await getConnection().query('SELECT COUNT(*) as count FROM logs');
        res.json({ totalItems: 8, totalStock: stock[0].total, logsCount: logsCount[0].count });
    } catch (e) {
        res.status(500).json({ message: '讀取失敗' });
    }
});

app.listen(PORT, () => {
    console.log(`伺服器啟動成功: ${PORT}`);
});