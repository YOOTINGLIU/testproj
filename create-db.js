const mysql = require('mysql2/promise');

const databaseUrl = "DATABASE_URL_Ting";
const url = process.env[databaseUrl];

if (!url) {
    console.error(`❌ 找不到 ${databaseUrl} 環境變數`);
    console.error(`可用環境變數:`, Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('MYSQL')));
    process.exit(1);
}

console.log(`💡 解析資料庫連字串...`);

// 方案1: 直接手動解析正常格式
// url = "root:password@tcp(host:port)/database"
function parseUrl(url) {
    const authPart = url.split('@tcp(')[0];  // root:password
    const authSplit = authPart.split(':');
    const user = authSplit[0];
    const password = authSplit.slice(1).join(':');

    const dbPart = url.split('@tcp(')[1];
    const dbUrl = dbPart.split(')')[0];      // host:port
    const [host, port] = dbUrl.split(':');

    const database = url.split('/').pop();

    return { user, password, host, port, database };
}

const dbConfig = parseUrl(url);

console.log(`   用戶: ${dbConfig.user}`);
console.log(`   主機: ${dbConfig.host}:${dbConfig.port}`);
console.log(`   資料庫: ${dbConfig.database}\n`);

async function createTables() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: dbConfig.host,
            port: parseInt(dbConfig.port),
            user: dbConfig.user,
            password: dbConfig.password,
            charset: 'utf8mb4',
        });

        // 先選擇或建立資料庫
        try {
            await connection.query(`USE ${dbConfig.database}`);
            console.log('✅ 已連接到資料庫\n');
        } catch (e) {
            console.log('⚠️ 資料庫不存在，將建立...');
            await connection.query(`CREATE DATABASE \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
            await connection.query(`USE ${dbConfig.database}`);
            console.log('✅ 資料庫已建立\n');
        }

        // 建立庫存表
        console.log('📦 建立庫存表...');
        const createPartsTable = `
            CREATE TABLE IF NOT EXISTS parts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                規格 VARCHAR(100) NOT NULL UNIQUE,
                類型 VARCHAR(50) NOT NULL,
                材質 VARCHAR(50) NOT NULL,
                長度 DECIMAL(10,2) NOT NULL,
                直徑 DECIMAL(10,2) NOT NULL,
                螺距 DECIMAL(10,2) DEFAULT NULL,
                頭型 VARCHAR(50) NOT NULL,
                包裝數量 INT DEFAULT 100,
                庫存數量 INT DEFAULT 0,
                最小訂購量 INT NOT NULL DEFAULT 100,
                單價 DECIMAL(18,2) DEFAULT 0,
                備註 TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        await connection.query(createPartsTable);
        console.log('✅ 庫存表建立完成\n');

        // 建立出貨記錄表
        console.log('🚚 建立出貨記錄表...');
        const createLogsTable = `
            CREATE TABLE IF NOT EXISTS logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                螺絲規格 VARCHAR(100) NOT NULL,
                數量 INT NOT NULL,
                類型 VARCHAR(20) NOT NULL,
                日期 DATE NOT NULL,
                客戶 VARCHAR(100),
                備註 VARCHAR(255),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        await connection.query(createLogsTable);
        console.log('✅ 出貨記錄表建立完成\n');

        // 檢查是否已有資料
        const [partsCount] = await connection.query('SELECT COUNT(*) as count FROM parts');
        const [logsCount] = await connection.query('SELECT COUNT(*) as count FROM logs');

        if (partsCount[0].count === 0) {
            console.log('📊 插入測試資料...');
            await connection.query(`
                INSERT INTO parts (規格, 類型, 材質, 長度, 直徑, 螺距, 頭型, 包裝數量, 庫存數量, 最小訂購量, 單價, 備註) VALUES
                ('M6 x 25 鋼牙平面沉', '機械螺絲', 'SUS304', 25, 6, 1, '平面沉', 100, 500, 100, 2.5, '不鏽鋼材質，防鏽'),
                ('M6 x 40 冷鍍鋅 SUS304六角螺絲片', '機械螺絲', '鋼', 40, 6, 1, '六角', 500, 1200, 100, 0.8, '冷鍍鋅'),
                ('M8 x 50 SUS316機械螺絲外六角', '機械螺絲', 'SUS316', 50, 8, 1.25, '外六角', 100, 200, 100, 3.5, '海水環境用'),
                ('M10 x 60冷鍍鋅螺絲6角光面牙', '機械螺絲', '鋼', 60, 10, 1.5, '六角', 200, 800, 100, 1.2, ''),
                ('M12 x 80表面處理冷鍍鋅牙面', '機械螺絲', '鋼', 80, 12, 1.75, '六角', 100, 300, 100, 1.8, '鎳鍍鋅表面'),
                ('M3 x 12 鋁合金自攻螺絲不發漲牙', '自攻螺絲', '鋁合金', 12, 3, 0.5, '平面', 500, 1500, 500, 0.3, '不發漲牙'),
                ('M3 x 20熱浸鋅螺絲黑去皮牙', '自攻螺絲', '鋼', 20, 3, 0.5, '圓頭', 300, 400, 300, 0.2, '熱浸鋅，黑扣'),
                ('M8 x 30冷鍍鋅塑膠螺絲外壳發大牙圓头', '塑膠螺絲', '鋼', 30, 8, 1.25, '圓頭', 100, 600, 100, 0.5, '專用於塑膠螺絲帽')
            `);
            console.log('✅ 庫存測試資料已插入\n');
        } else {
            console.log(`✅ 庫存表已有 ${partsCount[0].count} 筆現有資料\n`);
        }

        if (logsCount[0].count === 0) {
            console.log('📊 插出入貨記錄測試資料...');
            await connection.query(`
                INSERT INTO logs (螺絲規格, 數量, 類型, 日期, 客戶, 備註) VALUES
                ('M6 x 25 鋼牙平面沉', 100, '出貨', '2025-03-01', '甲公司', '一般用途'),
                ('M6 x 40 冷鍍鋅 SUS304六角螺絲片', 500, '出貨', '2025-03-05', '乙工廠', '大量出貨'),
                ('M3 x 12 鋁合金自攻螺絲不發漲牙', 300, '入倉', '2025-03-10', '供應商A', '新一批貨'),
                ('M3 x 20熱浸鋅螺絲黑去皮牙', 200, '出貨', '2025-03-15', '丁工程行', '小包裝用途'),
                ('M8 x 30冷鍍鋅塑膠螺絲外壳發大牙圓头', 150, '入倉', '2025-03-20', '供應商B', '特殊規格需求')
            `);
            console.log('✅ 出貨記錄測試資料已插入\n');
        } else {
            console.log(`✅ 出貨記錄表已有 ${logsCount[0].count} 筆現有資料\n`);
        }

        // 顯示結果
        const [parts] = await connection.query('SELECT * FROM parts');
        const [logs] = await connection.query('SELECT * FROM logs');

        console.log('📋 資料庫內容:');
        console.log(`\n🏪 庫存資料 (${parts.length} 筆):`);
        parts.forEach(part => {
            console.log(`  - ${part.規格} | 庫存: ${part.庫存數量} | 單價: ${part.單價}`);
        });

        console.log(`\n🚚 出貨記錄 (${logs.length} 筆):`);
        logs.forEach(log => {
            const typeEmoji = log.類型 === '出貨' ? '🛒' : '📥';
            console.log(`  - ${typeEmoji} ${log.螺絲規格} | ${log.類型} ${log.數量} | 日期: ${log.日期} | 客戶: ${log.客戶}`);
        });

        console.log('\n✅ 資料庫建立完成！');
        console.log('\n📝 現在可以修改 server.js 連接這個資料庫\n');

    } catch (error) {
        console.error('❌ 錯誤:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

createTables();