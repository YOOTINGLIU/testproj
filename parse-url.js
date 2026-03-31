const mysql = require('mysql2/promise');

const url = process.env.DATABASE_URL_Ting;

async function testConnection() {
    console.log('Zeabur MySQL 連線測試\n');

    // 解析
    console.log(`原始 URL: ${url.substring(0, 60)}...\n`);

    // 測試 1: 标准格式
    console.log('🧪 測試 1: mysql.zeabur.internal:3306');
    try {
        const conn = await mysql.createConnection({
            host: 'mysql.zeabur.internal',
            port: 3306,
            user: 'root',
            password: 'drqRB19fy3pa87nUVe6Z4v2IKY50uPAl',
            connectTimeout: 15000
        });
        console.log('✓ 連接成功');
        await conn.end();
    } catch (e) {
        console.log(`✗ ${e.message}`);
    }

    // 測試 2: 用 Zeabur 提供的 IP
    console.log('\n🧪 測試 2: 172.235.171.79:3306');
    try {
        const conn = await mysql.createConnection({
            host: '172.235.171.79',
            port: 3306,
            user: 'root',
            password: 'drqRB19fy3pa87nUVe6Z4v2IKY50uPAl',
            connectTimeout: 15000
        });
        console.log('✓ 連接成功');
        await conn.end();
    } catch (e) {
        console.log(`✗ ${e.message}`);
    }

    // 測試 3: 10.43.68.130
    console.log('\n🧪 測試 3: 10.43.68.130:3306');
    try {
        const conn = await mysql.createConnection({
            host: '10.43.68.130',
            port: 3306,
            user: 'root',
            password: 'drqRB19fy3pa87nUVe6Z4v2IKY50uPAl',
            connectTimeout: 15000
        });
        console.log('✓ 連接成功');
        await conn.end();
    } catch (e) {
        console.log(`✗ ${e.message}`);
    }

    console.log('\n測試完成 (可能全都失敗，是網路隔離問題)');
}

testConnection().catch(console.error);