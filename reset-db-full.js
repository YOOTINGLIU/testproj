const mysql = require('mysql2/promise');

async function main() {
    const conn = await mysql.createConnection({
        host: '172.235.171.79',
        port: 30663,
        user: 'root',
        password: 'drqRB19fy3pa87nUVe6Z4v2IKY50uPAl',
        charset: 'utf8mb4'
    });

    await conn.query('USE openclaw');

    console.log('刪除舊表...');
    await conn.query('DROP TABLE IF EXISTS logs');
    await conn.query('DROP TABLE IF EXISTS parts');

    console.log('建立資料表...');
    await conn.execute(`
        CREATE TABLE parts (
            id INT PRIMARY KEY AUTO_INCREMENT,
            part_number VARCHAR(100) NOT NULL,
            type VARCHAR(50) NOT NULL,
            stock INT NOT NULL
        )
    `);

    await conn.execute(`
        CREATE TABLE logs (
            id INT PRIMARY KEY AUTO_INCREMENT,
            part_number VARCHAR(100) NOT NULL,
            quantity INT NOT NULL,
            log_type VARCHAR(20) NOT NULL,
            date DATE NOT NULL,
            customer VARCHAR(100)
        )
    `);

    console.log('插入預設資料...');

    await conn.execute(`
        INSERT INTO parts (part_number, type, stock) VALUES
        ('M6x25-SUS304', '機械螺絲', 500),
        ('M6x40-鋼', '機械螺絲', 1200),
        ('M8x50-SUS316', '機械螺絲', 200),
        ('M10x60-鋼', '機械螺絲', 800),
        ('M12x80-鎳鍍鋅', '機械螺絲', 300),
        ('M3x12-鋁合金', '自攻螺絲', 1500),
        ('M3x20-熱浸鋅', '自攻螺絲', 400),
        ('M8x30-圓头', '塑膠螺絲', 600)
    `);

    await conn.execute(`
        INSERT INTO logs (part_number, quantity, log_type, date, customer) VALUES
        ('M6x25-SUS304', 100, '出貨', '2025-03-01', '甲公司'),
        ('M6x40-鋼', 500, '出貨', '2025-03-05', '乙工廠'),
        ('M3x12-鋁合金', 300, '入倉', '2025-03-10', '供應商A'),
        ('M3x20-熱浸鋅', 200, '出貨', '2025-03-15', '丁工程行'),
        ('M8x30-圓头', 150, '入倉', '2025-03-20', '供應商B')
    `);

    console.log('✅ 資料庫建立完成');

    const [parts] = await conn.query('SELECT COUNT(*) as count FROM parts');
    const [logs] = await conn.query('SELECT COUNT(*) as count FROM logs');

    console.log(`   Parts: ${parts[0].count} 筆`);
    console.log(`   Logs: ${logs[0].count} 筆`);

    await conn.end();
    console.log('\n🎉 完成！');
}

main().catch(err => {
    console.error('❌ 錯誤:', err.message);
    process.exit(1);
});