const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Tạo kết nối database
const db = new sqlite3.Database('./database/users.db', (err) => {
    if (err) {
        console.error('Lỗi kết nối database:', err);
    } else {
        console.log('Đã kết nối thành công tới database');
        createTables();
    }
});

// Tạo các bảng cần thiết
function createTables() {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);
}

// Đăng ký người dùng mới
async function registerUser(username, email, password) {
    return new Promise((resolve, reject) => {
        // Kiểm tra username và email đã tồn tại chưa
        db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], async (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            if (row) {
                reject(new Error('Username hoặc email đã tồn tại'));
                return;
            }

            try {
                // Mã hóa mật khẩu
                const hashedPassword = await bcrypt.hash(password, 10);

                // Thêm user mới
                db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                    [username, email, hashedPassword],
                    function(err) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve({
                            id: this.lastID,
                            username,
                            email
                        });
                    }
                );
            } catch (error) {
                reject(error);
            }
        });
    });
}

// Đăng nhập
async function loginUser(username, password) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
            if (err) {
                reject(err);
                return;
            }
            if (!user) {
                reject(new Error('Username không tồn tại'));
                return;
            }

            try {
                const match = await bcrypt.compare(password, user.password);
                if (!match) {
                    reject(new Error('Mật khẩu không đúng'));
                    return;
                }

                // Tạo session token mới
                const sessionToken = uuidv4();
                db.run('INSERT INTO sessions (token, user_id) VALUES (?, ?)',
                    [sessionToken, user.id],
                    (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve({
                            id: user.id,
                            username: user.username,
                            email: user.email,
                            role: user.role,
                            sessionToken
                        });
                    }
                );
            } catch (error) {
                reject(error);
            }
        });
    });
}

// Kiểm tra session
async function validateSession(sessionToken) {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT u.* FROM users u
            JOIN sessions s ON u.id = s.user_id
            WHERE s.token = ?
        `, [sessionToken], (err, user) => {
            if (err) {
                reject(err);
                return;
            }
            if (!user) {
                reject(new Error('Session không hợp lệ'));
                return;
            }
            resolve(user);
        });
    });
}

// Đăng xuất
async function logoutUser(sessionToken) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM sessions WHERE token = ?', [sessionToken], (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

module.exports = {
    registerUser,
    loginUser,
    validateSession,
    logoutUser
}; 