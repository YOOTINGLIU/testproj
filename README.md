# testproj - 螺絲零件管理系統

專案目前使用 **JSON 模式**運行（備份模式）

## 檔案結構
```
testproj/
├── data.json           # 庫存資料（JSON 格式）
├── logs.json           # 出貨記錄（JSON 格式）
├── index.html          # 前端頁面（單頁應用）
├── server.js           # Node.js 伺服器（JSON 模式）
├── package.json        # 專案配置
├── init-db.sql         # SQL 資料庫初始化（未使用）
└── README.md          # 專案說明
```

## 運行方式（本地測試）

```bash
cd testproj
node server.js
```

伺服器將在 `http://localhost:3000` 啟動。

## API Endpoints

### 健康檢查
- `GET /api/health` - 測試伺服器狀態

### 項目相關
- `GET /api/items` - 取得所有項目列表
- `GET /api/items?format=json` - 取得 JSON 格式
- `GET /api/items/:id` - 取得單一項目
- `GET /api/search?q=關鍵字` - 搜尋項目（支援規格、編號、材質）
- `POST /api/items` - 新增項目（目前暫停）

### 出貨記錄
- `GET /api/logs` - 取得出貨記錄
- `GET /api/logs?format=json` - 取得 JSON 格式

### 統計資訊
- `GET /api/statistics` - 取得庫存統計

## 使用方式

## 方式 1: 在本機打開（推薦）

1. 安裝 Node.js：https://nodejs.org/
2. 打開終端機，進入資料夾：
   ```bash
   cd testproj
   ```
3. 啟動伺服器：
   ```bash
   node server.js
   ```
4. 用瀏覽器打開：`http://localhost:3000`

## 方式 2: 部署到 Vercel / Netlify

### 使用 Zeabur

1. 在 Zeabur 上建立 Project
2. 上傳程式碼到 GitHub
3. Zeabur 自動偵測為 Node.js 應用
4. 設置環境變數：
   - `PORT=3000`
5. 部署完成後取得 URL

2. 將 `index.html` 貼上到 Zeabur Pages
3. 設置自訂域名（可選）

## 功能特色

- ✅ 庫存變更會即時更新（JSON）
- ✅ 出貨記錄查詢
- ✅ 搜尋功能（支援規格、材質）
- ✅ 統計分析（庫存總數、分類）
- ✅ 單頁應用（無需刷新）

## 前 GitHub Pages 版本會有的功能

- ✅ Zebra Pages 自動部署（已完成）
- ✅ 即時表格顯示（已完成）
- ✅ 出貨記錄（已完成）

## 日後升級到 SQL Server 模式

當你有網路權限後：

1. 執行 `init-db.sql` 建立資料庫
2. 修改 `server.js`，取代 JSON 讀取為 SQL
3. 執行 `create-db.js` 初始化資料表
4. 資料和功能完全相同，只是換資料來源

## Server.js 特點

- 自動回退到 JSON 檔案（如果 SQL 失敗）
- 支援 `format=json` 參數
- 錯誤處理完善
- 可同時運行當前 JSON 伺服器和未來的 SQL 伺服器

需要修改什麼嗎？