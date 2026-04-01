const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('啟動 SQL 模式伺服器...');

let connection;

async function getConnection() {
    if (!connection || connection._closed) {
        const databaseUrl = process.env.DATABASE_URL_Ting || process.env.DATABASE_URL;

        if (!databaseUrl) {
            throw new Error('缺少資料庫連線設定');
        }

        const [user, rest] = databaseUrl.split('@tcp(')[0].split(':');
        const dbUrl = databaseUrl.split('@tcp(')[1].replace(')', '');
        const [host, port, dbName] = dbUrl.split(':');

        const cleanHost = host.replace(/\)?$/, '');

        console.log(`連線資料庫: ${cleanHost}:${port}`);

        connection = await mysql.createConnection({
            host: cleanHost,
            port: parseInt(port, 10),
            user: user,
            password: rest.replace(')', ''),
            charset: 'utf8mb4'
        });

        await connection.query(`USE \`openclaw\``);
        console.log('資料庫連線成功');
    }
    return connection;
}

app.use(express.json());

app.get('/', (req, res) => {
    const fs = require('fs');
    const indexPath = process.join(process.cwd(), 'index.html');

    if (!fs.existsSync(indexPath)) {
        console.log('檔案不存在:', indexPath);
        return res.status(404).send('index.html 不存在');
    }

    res.sendFile(indexPath);
});

app.get('/api/health', async (req, res) => {
    try {
        const conn = await getConnection();
        await conn.query('SELECT 1');
        res.json({ status: 'healthy' });
    } catch (e) {
        console.error('健康檢查失敗:', e.message);
        res.status(500).json({ status: 'error', message: e.message });
    }
});

app.get('/api/items', async (req, res) => {
    try {
        const conn = await getConnection();
        const [rows] = await conn.query('SELECT id, part_number, type, stock FROM parts ORDER BY id');
        res.json({ data: rows });
    } catch (e) {
        console.error('讀取庫存失敗:', e.message);
        res.status(500).json({ status: 'error', message: e.message });
    }
});

app.get('/api/logs', async (req, res) => {
    try {
        const conn = await getConnection();
        const [rows] = await conn.query('SELECT id, part_number, quantity, log_type, date, customer FROM logs ORDER BY date DESC, id DESC');
        res.json({ data: rows });
    } catch (e) {
        console.error('讀取出貨記錄失敗:', e.message);
        res.status(500).json({ status: 'error', message: e.message });
    }
});

app.get('/api/statistics', async (req, res) => {
    try {
        const conn = await getConnection();
        const [stock] = await conn.query('SELECT COALESCE(SUM(stock), 0) as total FROM parts');
        const [logsCount] = await conn.query('SELECT COUNT(*) as count FROM logs');
        res.json({
            totalItems: 8,
            totalStock: stock[0].total,
            logsCount: logsCount[0].count
        });
    } catch (e) {
        console.error('讀取統計失敗:', e.message);
        res.status(500).json({ status: 'error', message: e.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ 伺服器運行中: ${PORT}`);
});