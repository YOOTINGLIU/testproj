const mysql = require('mysql2/promise');

async function tryConnection() {
    console.log('測試連接到 Zeabur MySQL\n');

    // 測試方式 1: 嘗試連接
    console.log('🧪 測試 1: 嘗試用 mysql.zeabur.internal...');
    try {
        const connection = await mysql.createConnection({
            host: 'mysql.zeabur.internal',
            port: 3306,
            user: 'root',
            password: 'drqRB19fy3pa87nUVe6Z4v2IKY50uPAl',
            connectTimeout: 10000,
        });
        console.log('✓ MySQL 連線成功!');
        await connection.end();
    } catch (e) {
        console.log(`✗ 連接失敗: ${e.message}\n`);
        console.log('原因：這台機器無法連接到 Zeabur MySQL 內部網路');
    }
}

tryConnection().catch(console.error);