const mysql = require('mysql2/promise');

const databaseUrl = "DATABASE_URL_Ting";
const url = process.env[databaseUrl];

if (!url) {
    console.error(`❌ 找不到 ${databaseUrl} 環境變數`);
    process.exit(1);
}

console.log('💡 解析資料庫連字串...\n');

// 解析連線字串
const authPart = url.split('@tcp(')[0];
const authSplit = authPart.split(':');
const user = authSplit[0];
const password = authSplit.slice(1).join(':');

const dbPart = url.split('@tcp(')[1];
const dbUrl = dbPart.split(')')[0];
const [host, port] = dbUrl.split(':');
const database = url.split('/').pop();

console.log(`   主機: ${host}:${port}`);
console.log(`   資料庫: ${database}\n`);

async function createTables() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host,
            port: parseInt(port, 10),
            user,
            password,
            charset: 'utf8mb4',
        });

        console.log('✅ 已連接到 MySQL 伺服器\n');

        // 建立或使用資料庫
        try {
            await connection.query(`USE ${database}`);
            console.log('✅ 已使用資料庫 openclaw\n');
        } catch (e) {
            console.log('⚠️ 資料庫不存在，將建立...');
            await connection.query(`CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
            await connection.query(`USE ${database}`);
            console.log('✅ 資料庫已建立\n');
        }

        // 刪除舊表（這樣會重建）
        console.log('🗑️ 清除舊表...');
        await connection.query('DROP TABLE IF EXISTS logs');
        await connection.query('DROP TABLE IF EXISTS parts');
        console.log('✅ 舊表已刪除\n');

        // 建立庫存表
        console.log('📦 建立庫存表 (英文欄位)...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS parts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                part_number VARCHAR(100) NOT NULL UNIQUE,
                type VARCHAR(50) NOT NULL,
                material VARCHAR(50) NOT NULL,
                length DECIMAL(10,2) NOT NULL,
                diameter DECIMAL(10,2) NOT NULL,
                pitch DECIMAL(10,2) DEFAULT NULL,
                head_type VARCHAR(50) NOT NULL,
                pack_quantity INT DEFAULT 100,
                stock INT DEFAULT 0,
                min_order INT NOT NULL DEFAULT 100,
                price DECIMAL(18,2) DEFAULT 0,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ 庫存表已建立\n');

        // 建立出貨記錄表
        console.log('🚚 建立出貨記錄表 (英文欄位)...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                part_number VARCHAR(100) NOT NULL,
                quantity INT NOT NULL,
                log_type VARCHAR(20) NOT NULL,
                date DATE NOT NULL,
                customer VARCHAR(100),
                notes VARCHAR(300),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ 出貨記錄表已建立\n');

        // 插入測試資料
        console.log('📊 插入測試資料...');
        await connection.query(`
            INSERT INTO parts (part_number, type, stock) VALUES
            ('M6x25-SUS304', '機械螺絲', 500),
            ('M6x40-鋼六角', '機械螺絲', 1200),
            ('M8x50-SUS316', '機械螺絲', 200),
            ('M10x60-鋼粗牙', '機械螺絲', 800),
            ('M12x80-鎳鍍鋅', '機械螺絲', 300),
            ('M3x12-鋁合金自攻', '自攻螺絲', 1500),
            ('M3x20-熱浸鋅黑去牙', '自攻螺絲', 400),
            ('M8x30-塑膠螺絲圆头', '塑膠螺絲', 600)
        `);
        console.log('✅ 庫存測試資料已插入\n');

        await connection.query(`
            INSERT INTO logs (part_number, quantity, log_type, date, customer) VALUES
            ('M6x25-SUS304', 100, '出貨', '2025-03-01', '甲公司'),
            ('M6x40-鋼六角', 500, '出貨', '2025-03-05', '乙工廠'),
            ('M3x12-鋁合金自攻', 300, '入倉', '2025-03-10', '供應商A'),
            ('M3x20-熱浸鋅黑去牙', 200, '出貨', '2025-03-15', '丁工程行'),
            ('M8x30-塑膠螺絲圆头', 150, '入倉', '2025-03-20', '供應商B')
        `);
        console.log('✅ 出貨記錄測試資料已插入\n');

        // 顯示結果
        const [parts] = await connection.query('SELECT part_number, type, stock FROM parts');
        const [logs] = await connection.query('SELECT * FROM logs');
        parts.forEach(p => console.log(`📦 ${p.part_number} | ${p.type} | 庫存: ${p.stock}`));

        console.log('\n✅ 資料庫重建完成！');
        console.log('📋 欄位名統一改為英文:\n');
        console.log('   庫存表: id, part_number, type, stock, ...');
        console.log('   出貨表: id, part_number, quantity, log_type, date, customer, notes\n');

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