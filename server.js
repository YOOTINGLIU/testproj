const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// hardcoded 對應到 Zeabur 的正確配置
const config = {
    host: '172.235.171.79',
    port: 30663,
    user: 'root',
    password: 'drqRB19fy3pa87nUVe6Z4v2IKY50uPAl'
};

console.log('💡 啟動 SQL 模式伺服器...');
console.log(`   連接資料庫: ${config.host}:${config.port}`);
console.log('   資料庫: openclaw\n');

let connection;

async function getConnection() {
    if (!connection || connection._closed) {
        connection = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            charset: 'utf8mb4'
        });
        await connection.query('USE openclaw');
        console.log('✅ 資料庫連線成功');
    }
    return connection;
}

app.use(express.json());

// 健康檢查
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

// 取得所有項目
app.get('/api/items', async (req, res) => {
    try {
        const conn = await getConnection();
        const [rows] = await conn.query(
            'SELECT id, part_number, type, stock FROM parts ORDER BY id'
        );
        res.json({ data: rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 取得出貨記錄
app.get('/api/logs', async (req, res) => {
    try {
        const conn = await getConnection();
        const [rows] = await conn.query(
            'SELECT id, part_number, quantity, log_type, date, customer FROM logs ORDER BY date DESC, id DESC'
        );
        res.json({ data: rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 取得統計
app.get('/api/statistics', async (req, res) => {
    try {
        const conn = await getConnection();
        const [result] = await conn.query('SELECT COALESCE(SUM(stock), 0) as total FROM parts');
        const [logsCount] = await conn.query('SELECT COUNT(*) as count FROM logs');
        res.json({
            totalItems: 8,
            totalStock: result[0].total,
            logsCount: logsCount[0].count
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ 伺服器啟動成功: http://localhost:${PORT}`);
});