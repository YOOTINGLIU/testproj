const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 優先使用 JSON 檔案
const DATA_FILE = path.join(__dirname, 'data.json');
const LOGS_FILE = path.join(__dirname, 'logs.json');

// 讀取 JSON 檔案
function readJsonFile(filename) {
    try {
        if (fs.existsSync(filename)) {
            const content = fs.readFileSync(filename, 'utf8');
            return JSON.parse(content);
        }
        return null;
    } catch (err) {
        console.error(`讀取 ${filename} 失敗:`, err.message);
        return null;
    }
}

// 測試連線狀態（不使用資料庫）
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        message: '使用 JSON 檔案備份模式',
        provider: 'data.json'
    });
});

// 取得所有項目
app.get('/api/items/:format?', async (req, res) => {
    try {
        const data = readJsonFile(DATA_FILE);

        if (!data || !Array.isArray(data)) {
            return res.status(500).json({ error: 'JSON 檔案內容錯誤或不存在' });
        }

        const format = req.params.format;
        if (format === 'json' || format === 'legacy') {
            // 返回原始 JSON 格式
            res.json({ items: data });
        } else {
            // 返回標準格式
            res.json({ data: data });
        }
    } catch (error) {
        res.status(500).json({ error: '取得資料失敗', details: error.message });
    }
});

// 新增項目（只讀不存，暫時功能）
app.post('/api/items', (req, res) => {
    res.status(501).json({
        error: '功能暫時停用',
        message: '請使用資料庫模式',
        note: 'JSON 模式下僅提供檢視功能'
    });
});

// 取得出貨記錄
app.get('/api/logs/:format?', (req, res) => {
    try {
        const data = readJsonFile(LOGS_FILE);

        if (!data || !Array.isArray(data)) {
            return res.status(500).json({ error: 'JSON 檔案內容錯誤或不存在' });
        }

        const format = req.params.format;
        if (format === 'json' || format === 'legacy') {
            res.json({ logs: data });
        } else {
            res.json({ data: data });
        }
    } catch (error) {
        res.status(500).json({ error: '取得資料失敗', details: error.message });
    }
});

// 取得單一項目
app.get('/api/item/:id', (req, res) => {
    const items = readJsonFile(DATA_FILE) || [];

    if (!Array.isArray(items)) {
        return res.status(500).json({ error: 'JSON 檔案內容錯誤' });
    }

    const item = items.find(i => i.編號 === req.params.id);
    if (item) {
        res.json({ item });
    } else {
        res.status(404).json({ error: '找不到此項目' });
    }
});

// 搜尋項目（按規格查詢）
app.get('/api/search', (req, res) => {
    const items = readJsonFile(DATA_FILE) || [];

    if (!Array.isArray(items)) {
        return res.status(500).json({ error: 'JSON 檔案內容錯誤' });
    }

    const query = req.query.q.toLowerCase();
    const results = items.filter(item =>
        item.規格 && item.規格.toLowerCase().includes(query) ||
        item.編號 && item.編號.toLowerCase().includes(query) ||
        item.材質 && item.材質.toLowerCase().includes(query)
    );

    res.json({ results, count: results.length });
});

// 取得統計資訊
app.get('/api/statistics', (req, res) => {
    const items = readJsonFile(DATA_FILE) || [];

    if (!Array.isArray(items)) {
        return res.status(500).json({ error: 'JSON 檔案內容錯誤' });
    }

    const totalItems = items.length;
    const totalStock = items.reduce((sum, item) => sum + (item.庫存數量 || 0), 0);
    const totalValue = items.reduce((sum, item) => sum + (item.單價 || 0) * (item.庫存數量 || 0), 0);

    const categories = {};
    items.forEach(item => {
        const cat = item.類型 || '未知';
        if (!categories[cat]) categories[cat] = 0;
        categories[cat]++;
    });

    res.json({
        totalItems,
        totalStock,
        totalValue: parseFloat(totalValue.toFixed(2)),
        categories
    });
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`📦 伺服器運行中 (JSON 模式)`);
    console.log(`📡 實時 API: http://localhost:${PORT}/api/health`);
    console.log(`📡 項目列表: http://localhost:${PORT}/api/items`);
    console.log(`📡 出貨記錄: http://localhost:${PORT}/api/logs`);
    console.log(`📡 搜尋功能: http://localhost:${PORT}/api/search?q=關鍵字`);
    console.log(`📈 統計資訊: http://localhost:${PORT}/api/statistics`);
});