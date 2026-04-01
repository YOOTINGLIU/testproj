#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function test() {
    console.log('測試環境...\n');

    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        console.log('找不到資料庫設定');
        return;
    }

    try {
        // 使用 Zeabur 的 URL
        const [user, pass] = databaseUrl.split(':');
        const [host, port] = databaseUrl.match(/@tcp\(([^:]+):(\d+)\)/)[1].split(':');

        const conn = await mysql.createConnection({
            host,
            port: parseInt(port, 10),
            user,
            password: pass,
            charset: 'utf8mb4'
        });

        console.log('✅ 測試成功！');

        await conn.end();
    } catch (error) {
        console.log('❌ 測試失敗：', error.message);
    }
}

test().catch(console.error);