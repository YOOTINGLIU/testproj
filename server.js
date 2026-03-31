const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// SQL Server 連線設定
const getDatabaseUrl = () => {
    const url = process.env.DATABASE_URL_Ting;
    if (!url) {
        console.error('❌ 找不到 DATABASE_URL_Ting 環境變數');
        process.exit(1);
    }

    console.log('💡 解析資料庫連線字串...');

    // 方案: 直接手動解析正常格式
    // url = "root:password@tcp(host:port)/database"
    const authPart = url.split('@tcp(')[0];  // root:password
    const authSplit = authPart.split(':');
    const user = authSplit[0];
    const password = authSplit.slice(1).join(':');

    const dbPart = url.split('@tcp(')[1];
    const dbUrl = dbPart.split(')')[0];      // host:port
    const [host, port] = dbUrl.split(':');

    const database = url.split('/').pop();

    return {
        user,
        password,
        host,
        port: parseInt(port, 10),
        database
    };
};

const dbConfig = getDatabaseUrl();

console.log(`   用戶: ${dbConfig.user}`);
console.log(`   主機: ${dbConfig.host}:${dbConfig.port}`);
console.log(`   資料庫: ${dbConfig.database}\n`);

// 建立連線參數（延遲建立以避免啟動時連接失敗）
let connection;

async function getConnection() {
    if (!connection || connection._closed) {
        connection = await mysql.createConnection({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password,
            charset: 'utf8mb4',
        });
    }
    return connection;
}

app.use(express.json());

// 測試連線狀態
app.get('/api/health', async (req, res) => {
    try {
        const conn = await getConnection();
        await conn.query('SELECT 1');
        res.json({
            status: 'healthy',
            message: '資料庫連線正常',
            provider: 'SQL Server',
            host: dbConfig.host,
            port: dbConfig.port
        });
    } catch (e) {
        res.status(500).json({ error: '無法連接資料庫', details: e.message });
    }
});

// 取得所有項目
app.get('/api/items/:format?', async (req, res) => {
    try {
        const conn = await getConnection();
        const [rows] = await conn.query('SELECT * FROM parts ORDER BY id');

        const format = req.params.format;
        if (format === 'json') {
            res.json({ items: rows });
        } else {
            res.json({ data: rows });
        }
    } catch (error) {
        res.status(500).json({ error: '取得資料失敗', details: error.message });
    }
});

// 新增項目
app.post('/api/items', async (req, res) => {
    try {
        const { name, code, quantity } = req.body;  // API 需求使用英文欄位

        if (!name || !quantity) {
            return res.status(400).json({ error: '缺少必要欄位: name 或 quantity' });
        }

        const conn = await getConnection();
        const [result] = await conn.query(
            'INSERT INTO parts (規格, 庫存數量) VALUES (?, ?)',
            [name, quantity]
        );

        res.json({
            id: result.insertId,
            message: '新增成功',
            规格: name,
            库存数量: quantity
        });
    } catch (error) {
        res.status(500).json({ error: '新增失敗', details: error.message });
    }
});

// 取得出貨記錄
app.get('/api/logs/:format?', async (req, res) => {
    try {
        const conn = await getConnection();
        const [rows] = await conn.query('SELECT * FROM logs ORDER BY created_at DESC');

        const format = req.params.format;
        if (format === 'json') {
            res.json({ logs: rows });
        } else {
            res.json({ data: rows });
        }
    } catch (error) {
        res.status(500).json({ error: '取得資料失敗', details: error.message });
    }
});

// 取得單一項目
app.get('/api/item/:id', async (req, res) => {
    try {
        const conn = await getConnection();
        const [rows] = await conn.query('SELECT * FROM parts WHERE id = ?', [req.params.id]);

        if (rows.length > 0) {
            res.json({ item: rows[0] });
        } else {
            res.status(404).json({ error: '找不到此項目' });
        }
    } catch (error) {
        res.status(500).json({ error: '取得資料失敗', details: error.message });
    }
});

// 搜尋項目
app.get('/api/search', async (req, res) => {
    try {
        const conn = await getConnection();
        const { q } = req.query;
        const query = `%${q}%`;

        const [rows] = await conn.query(
            `SELECT * FROM parts
             WHERE 規格 LIKE ? OR 編號 LIKE ? OR 材質 LIKE ?
             ORDER BY id`,
            [query, query, query]
        );

        res.json({ results: rows, count: rows.length });
    } catch (error) {
        res.status(500).json({ error: '搜尋失敗', details: error.message });
    }
});

// 取得統計資訊
app.get('/api/statistics', async (req, res) => {
    try {
        const conn = await getConnection();

        // 總庫存
        const [stockResult] = await conn.query(
            'SELECT SUM(庫存數量) as total FROM parts'
        );
        const totalStock = stockResult[0].total || 0;

        // 總價值
        const [valueResult] = await conn.query(
            'SELECT SUM(庫存數量 * 單價) as total FROM parts'
        );
        const totalValue = parseFloat(valueResult[0].total || 0).toFixed(2);

        // 分類統計
        const [categoryResult] = await conn.query(
            'SELECT 類型, COUNT(*) as count FROM parts GROUP BY 類型'
        );

        res.json({
            totalItems: 8,  // 目前是固定值，後續可從資料庫計算
            totalStock,
            totalValue,
            categories: categoryResult
        });
    } catch (error) {
        res.status(500).json({ error: '取得統計失敗', details: error.message });
    }
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`📦 伺服器運行中 (SQL 模式)`);
    console.log(`📡 健康檢查: http://localhost:${PORT}/api/health`);
    console.log(`📡 項目列表: http://localhost:${PORT}/api/items`);
    console.log(`📡 出貨記錄: http://localhost:${port}/api/logs`);
    console.log(`📡 搜尋功能: http://localhost:${PORT}/api/search?q=關鍵字`);
    console.log(`📈 統計資訊: http://localhost:${PORT}/api/statistics`);
});