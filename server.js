const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('啟動 SQL 模式伺服器...');

// 嘗試使用不同的環境變數名稱
const getDatabaseUrl = () => {
    const databaseUrl = process.env.DATABASE_URL_Ting || process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('找不到資料庫連線設定');
    }
    return databaseUrl;
};

let connection;

async function getConnection() {
    if (!connection || connection._closed) {
        const dbUrl = getDatabaseUrl();
        const [user, pass] = dbUrl.split('@tcp(')[0].split(':');
        const [host, port, dbName] = dbUrl.split('@tcp(')[1].replace(')', '').split(':');

        connection = await mysql.createConnection({
            host: host,
            port: parseInt(port, 10),
            user: user,
            password: pass.replace(')', ''),
            database: 'openclaw',
            charset: 'utf8mb4'
        });
        console.log('資料庫連線成功');
    }
    return connection;
}

app.use(express.json());
app.use(express(process.cwd()));

app.get('/', (req, res) => {
    const indexPath = process.join(process.cwd(), 'index.html');
    if (!require('fs').sync(indexPath)) {
        return res.status(404).send('Index.html 不存在');
    }
    res.sendFile(indexPath);
});

app.get('/api/health', async (req, res) => {
    try {
        await getConnection();
        res.json({ status: 'healthy' });
    } catch (e) {
        res.status(500).json({ message: e.message, system: error });
    }
});

app.get('/api/items', async (req, res) => {
    try {
        const [rows] = await getConnection().query('SELECT id, part_number, type, stock FROM parts ORDER BY id');
        res.json({ data: rows });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

app.get('/api/logs', async (req, res) => {
    try {
        const [rows] = await getConnection().query('SELECT id, part_number, quantity, log_type, date, customer FROM logs ORDER BY date DESC, id DESC');
        res.json({ data: rows });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

app.get('/api/statistics', async (req, res) => {
    try {
        const [stock] = await getConnection().query('SELECT COALESCE(SUM(stock), 0) as total FROM parts');
        const [logsCount] = await getConnection().query('SELECT COUNT(*) as count FROM logs');
        res.json({
            totalItems: 8,
            totalStock: stock[0].total,
            logsCount: logsCount[0].count
        });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

app.listen(PORT, () => {
    console.log(`伺服器運行中: http://0.0.0.0:${PORT}`);
});