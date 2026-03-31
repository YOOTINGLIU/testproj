# testproj - 專案列表管理系統

## 專案架構
- **前端**: React + Express/Fastify API + SQL Server
- **資料庫**: SQL Server
- **托管**: GitHub Pages（供顯示用）

## 檔案說明
```
testproj/
├── index.html          # 前端頁面（GitHub Pages 顯示用）
├── data.json           # 暫時資料（供 API 運作前使用）
├── server.js           # Node.js 伺服器
├── package.json        # 專案設定
└── init-db.sql         # SQL Server 初始化 SQL
```

## 使用方式

### 方案 A: 暫時用 JSON 展示（推薦先用這個）

**Step 1**: 更新 GitHub Pages
1. 前往 https://github.com/YOOTINGLIU/testproj/settings/pages
2. Source 選擇 **Deploy from a branch**
3. Branch: `main`, Folder: `/ (root)`
4. 儲存 → 等待 1-2 分鐘

**Step 2**: 部署到 GitHub Pages
1. 在 GitHub 頁面按 **Actions** 标签
2. Select **I understand my workflows, go ahead and enable them**
3. 按下 **Enable workflow**
4. 等待完成應該就應該可以直接看到 index.html 了

**Step 3**: 查看
- 打開 http://yootingliu.github.io/testproj
- 網頁會自動從 /data.json 載入資料

### 方案 B: 完整搭建（使用 SQL Server）

**Step 1**: 設定 SQL Server
1. 執行 `init-db.sql` 檔案中的 SQL 指令（在你的 SQL Server Management Studio）
2. 這會建立 database 和 Items 資料表

**Step 2**: 安裝依賴
```bash
cd testproj
npm install
```

**Step 3**: 啟動伺服器
```bash
# 設定環境變數（根據你的 SQL Server 設定）
export DB_SERVER=localhost
export DB_NAME=testdb
export DB_USER=sa
export DB_PASSWORD=你的密碼

node server.js
```

**Step 4**: 測試 API
- 測試連線: http://localhost:3000/api/health
- 取得資料: http://localhost:3000/api/items
- 新增資料: POST http://localhost:3000/api/items

## API Endpoint
- `GET /api/health` - 測試連線狀態
- `GET /api/items/:format?` - 取得所有項目
- `POST /api/items` - 新增項目

## 想要完整展示進功能？
你可以部署 Node.js 伺服器到 Vercel/Netlify/自己的雲主機，然後前端連到你的 API。

需要我幫你 Make 專案部署到任何平台嗎？