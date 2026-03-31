const mysql = require('mysql2/promise');

async function test() {
    try {
        const conn = await mysql.createConnection({
            host: '172.235.171.79',
            port: 30663,
            user: 'root',
            password: 'drqRB19fy3pa87nUVe6Z4v2IKY50uPAl'
        });
        console.log('✅ 已連接到 MySQL');
        await conn.query('USE openclaw');
        console.log('✅ 已使用資料庫 openclaw');
        const [parts] = await conn.query('SELECT COUNT(*) FROM parts');
        console.log('Parts:', parts[0]['COUNT(*)']);
        await conn.end();
    } catch (e) {
        console.error('❌ 失敗:', e.message);
    }
}

test();