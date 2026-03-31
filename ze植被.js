#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function test() {
    console.log('測試 Zeabur 環境設定...\n');

    // Zeabur 環境變數
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        console.log('❌ 找不到 DATABASE_URL 環境變數');
        return;
    }

    console.log('收到連線字串：', databaseUrl);
    const [user, pass] = databaseUrl.split(':');
    const [host, port] = databaseUrl.match(/@tcp\(([^:]+):(\d+)\)/)[1].split(':');
    console.log(`   主機: ${host}`);
    console.log(`   埠號: ${port}`);
    console.log(`   資料庫: openclaw\n`);

    // 測試連線
    try {
        const conn = await mysql.createConnection({
            host,
            port: parseInt(port, 10),
            user,
            password: pass,
            charset: 'utf8mb4'
        });
        console.log('✅ 連線到 Zeabur 資料庫成功\n');

        // 建立資料庫（如果不存在）
        await conn.query('CREATE DATABASE IF NOT EXISTS openclaw CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        await conn.query('USE openclaw');

        // 檢查表結構
        const [partsRows] = await conn.query('SHOW TABLES');
        console.log('📦 現有的資料表：', partsRows.map(r => Object.values(r)[0]));

        // 測試插入
        await conn.query('INSERT INTO parts (part_number, type, stock) VALUES (1, 1, 1)');
        await conn.execute('DELETE FROM parts WHERE id = 1');
        console.log('✅ 測試INSERT成功\n');

        console.log('🎉 Zeabur 環境設定成功！');

        await conn.end();
    } catch (error) {
        console.log('❌ Zeabur 部署失敗：', error.message);
        console.error(error);
    }
}

test().catch(console.error);