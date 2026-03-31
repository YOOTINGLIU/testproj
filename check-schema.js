const mysql = require('mysql2/promise');

async function checkSchema() {
    const conn = await mysql.createConnection({
        host: '172.235.171.79',
        port: 30663,
        user: 'root',
        password: 'drqRB19fy3pa87nUVe6Z4v2IKY50uPAl'
    });

    await conn.query('USE openclaw');

    console.log('📋 parts 表欄位:');
    const [partsSchema] = await conn.query('DESCRIBE parts');
    partsSchema.forEach(f => console.log(`  - ${f.Field} (${f.Type})`));

    console.log('\n📋 logs 表欄位:');
    const [logsSchema] = await conn.query('DESCRIBE logs');
    logsSchema.forEach(f => console.log(`  - ${f.Field} (${f.Type})`));

    await conn.end();
}

checkSchema();