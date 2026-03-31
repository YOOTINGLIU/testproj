const mysql = require('mysql2/promise');

async function checkDB() {
    try {
        const connection = await mysql.createConnection({
            host: '172.235.171.79',
            port: 30663,
            user: 'root',
            password: 'drqRB19fy3pa87nUVe6Z4v2IKY50uPAl'
        });

        await connection.query('USE openclaw');
        const [rows] = await connection.query('SHOW TABLES');
        console.log('📊 資料庫表格:', rows.map(r => Object.values(r)[0]).join(', '));
        
        const [schema] = await connection.query('DESCRIBE parts');
        console.log('\n📋 parts 表欄位:', schema.map(f => f.Field).join(', '));
        
        const [logsSchema] = await connection.query('DESCRIBE logs');
        console.log('\n📋 logs 表欄位:', logsSchema.map(f => f.Field).join(', '));
        
        const [parts] = await connection.query('SELECT part_number, stock FROM parts LIMIT 3');
        console.log('\n🏪 預覽資料（前 3 筆）:', parts.map(p => p.part_number).join(', '));
        
        await connection.end();
    } catch (e) {
        console.error('❌ 錯誤:', e.message);
    }
}

checkDB();
