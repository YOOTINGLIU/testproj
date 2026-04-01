### 部署到 Zeabur

1. **在 Zeabur 上建立新專案**
2. **貼入以下設定：**

**專案架構：**
```
.
├── Dockerfile          # Docker 部署配置
├── package.json        # Node.js 依賴
├── server.js          # 後端伺服器
├── index.html         # 前端頁面（僅查詢功能）
├── data.json          # 庫存資料（本機預覽用）
├── logs.json          # 出貨記錄（本機預覽用）
└── .dockerignore      # Docker 忽略檔案
```

**Deployment Configuration:**
- **Framework:** None
- **Runtime:** Node.js
- **Build Command:** `npm ci --only=production`
- **Start Command:** `node server.js`
- **Port:** `3000`

**Environment Variables (測試時先不填)：**
```

```

**注意：**
- GitHub Pages 版本使用 `index.html` + JSON
- Zeabur 版本應使用完整 `server.js` + SQL
- 這兩個版本可同時存在，專案會自動切換顯示模式
