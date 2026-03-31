const mysql = require('mysql2/promise');

const databaseUrl = process.env.DATABASE_URL_Ting || "root:drqRB19fy3pa87nUVe6Z4v2IKY50uPAl@tcp(mysql.zeabur.internal:172.235.171.79)/openclaw";

function parseUrl(url) {
    const authPart = url.split('@tcp(')[0];
    const user = authPart.split(':')[0];
    const password = authPart.split(':').slice(1).join(':');

    const dbUrl = url.split('@tcp(')[1].split(')')[0];      // host:port
    const [host, port, database] = dbUrl.split(':').concat(['']);

    return { user, password, host, port, database };
}

const dbConfig = parseUrl(databaseUrl);

async function checkDB() {
    try {
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            port: parseInt(dbConfig.port),
            user: dbConfig.user,
            password: dbConfig.password,
        });

        console.log('✅ 已連接到 MySQL 伺服器\n');

        // 建立資料庫
        try {
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
            await connection.query(`USE \`${dbConfig.database}\``);
            console.log(`✅ 使用資料庫: ${dbConfig.database}\n`);
        } catch (e) {
            console.error('⚠️  無法使用資料庫:', e.message);
            process.exit(1);
        }

        // 檢查表
        const [tables] = await connection.query('SHOW TABLES');
        console.log(`📊 目前表格: ${tables.length} 個`);
        tables.forEach(row => {
            console.log(`   - ${Object.values(row)[0]}`);
        });

        // 檢查庫存表
        if (tables.length > 0) {
            const [partsCount] = await connection.query('SELECT COUNT(*) as count FROM parts');
            const [logsCount] = await connection.query('SELECT COUNT(*) as count FROM logs');

            console.log(`\n📈 庫存資料筆數: ${partsCount[0].count}`);
            console.log(`📦 出貨記錄筆數: ${logsCount[0].count}`);

            if (partsCount[0].count > 0) {
                const [parts] = await connection.query('SELECT 規格, 庫存數量, 單價 FROM parts LIMIT 3');
                console.log(`\n示例資料 (前三筆):`);
                parts.forEach(p => {
                    console.log(`   - ${p.規格} | 庫存: ${p.庫存數量} | 單價: ${p.單價}`);
                });
            }

            if (logsCount[0].count > 0) {
                const [logs] = await connection.query('SELECT 螺絲規格, 類型, 數量 FROM logs LIMIT 3');
                console.log(`\n示例資料 (前三筆):`);
                logs.forEach(l => {
                    console.log(`   - ${l.類型} ${l.螺絲規格} | ${l.數量} 顆`);
                });
            }
        }

        console.log('\n✅ 檢查完成！');
        await connection.end();

    } catch (error) {
        console.error('❌ 錯誤:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

checkDB();