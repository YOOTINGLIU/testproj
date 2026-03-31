FROM node:20-alpine

# 建立工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package.json ./
COPY package-lock.json ./

# 安裝依賴
RUN npm ci --only=production

# 複製應用程式碼
COPY server.js ./
COPY data.json ./
COPY logs.json ./
COPY index.html ./

# 建立資料目錄
RUN mkdir -p logs

# 暴露埠
EXPOSE 3000

# 啟動應用程式
CMD ["node", "server.js"]