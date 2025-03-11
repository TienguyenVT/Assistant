const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const { 
    registerUser, 
    loginUser, 
    validateSession,
    logoutUser 
} = require('./database/db');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve static files
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// API endpoints
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await registerUser(username, email, password);
        res.json({ success: true, user });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await loginUser(username, password);
        
        // Lưu thông tin user vào session
        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role
        };
        
        res.json({ success: true, user });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.post('/api/logout', async (req, res) => {
    try {
        const { sessionToken } = req.body;
        await logoutUser(sessionToken);
        
        // Xóa session
        req.session.destroy();
        
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Middleware kiểm tra authentication
const requireAuth = async (req, res, next) => {
    try {
        const sessionToken = req.headers['x-session-token'];
        if (!sessionToken) {
            throw new Error('Không tìm thấy session token');
        }
        
        const user = await validateSession(sessionToken);
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            error: 'Vui lòng đăng nhập lại' 
        });
    }
};

// Protected routes example
app.get('/api/user/profile', requireAuth, (req, res) => {
    res.json({ 
        success: true, 
        user: req.user 
    });
});

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        error: 'Lỗi server, vui lòng thử lại sau' 
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
}); 