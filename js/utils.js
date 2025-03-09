/**
 * Kiểm tra xem tin nhắn có liên quan đến thời gian hay không
 * @param {string} message - Tin nhắn cần kiểm tra
 * @returns {boolean} - True nếu tin nhắn liên quan đến thời gian
 */
function isTimeRelatedQuestion(message) {
    if (!message || typeof message !== 'string') {
        return false;
    }
    
    const normalizedMessage = message.toLowerCase();
    return CONFIG.KEYWORDS.TIME.some(keyword => normalizedMessage.includes(keyword));
}

/**
 * Kiểm tra xem tin nhắn có liên quan đến thời tiết hay không
 * @param {string} message - Tin nhắn cần kiểm tra
 * @returns {boolean} - True nếu tin nhắn liên quan đến thời tiết
 */
function isWeatherRelatedQuestion(message) {
    if (!message || typeof message !== 'string') {
        return false;
    }
    
    const normalizedMessage = message.toLowerCase();
    return CONFIG.KEYWORDS.WEATHER.some(keyword => normalizedMessage.includes(keyword));
}

/**
 * Thêm tin nhắn vào container chat
 * @param {string} message - Nội dung tin nhắn
 * @param {boolean} isUser - True nếu tin nhắn từ người dùng, false nếu từ bot
 */
function appendMessage(message, isUser) {
    const chatContainer = document.getElementById('chat-container');
    
    if (!chatContainer) {
        console.error('Không tìm thấy chat-container');
        return;
    }
    
    // Tạo phần tử tin nhắn
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'user-message message' : 'bot-message message';
    
    // Format tin nhắn với tên người dùng nếu có
    const formattedMessage = isUser ? message : formatMessageWithName(message);
    
    // Xử lý tin nhắn có thể chứa HTML
    if (formattedMessage.includes('<') && formattedMessage.includes('>')) {
        messageDiv.innerHTML = formattedMessage;
    } else {
        messageDiv.textContent = formattedMessage;
    }
    
    // Thêm vào container và cuộn xuống
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * Trích xuất tên thành phố từ câu hỏi về thời tiết
 * @param {string} message - Câu hỏi về thời tiết
 * @returns {string} - Tên thành phố đã được trích xuất
 */
function extractCityName(message) {
    if (!message || typeof message !== 'string') {
        return '';
    }
    
    const normalizedMessage = message.toLowerCase().trim();
    
    // Danh sách các từ khóa cần loại bỏ
    const keywordsToRemove = [
        'thời tiết', 'nhiệt độ', 'mưa', 'nắng', 'dự báo',
        'tại', 'ở', 'của', 'hôm nay', 'ngày mai', 'thế nào',
        'như thế nào', 'ra sao', 'thành phố', 'tỉnh'
    ];
    
    // Xử lý các trường hợp đặc biệt
    const specialCases = {
        'hcm': 'hồ chí minh',
        'sg': 'hồ chí minh',
        'sài gòn': 'hồ chí minh',
        'hn': 'hà nội'
    };

    let result = normalizedMessage;
    
    // Loại bỏ các từ khóa không cần thiết
    keywordsToRemove.forEach(keyword => {
        result = result.replace(new RegExp(`\\b${keyword}\\b`, 'g'), '');
    });
    
    // Xử lý tên thành phố viết tắt
    result = result.trim();
    return specialCases[result] || result;
}

function formatMessageWithName(message) {
    if (CONFIG.USER.name) {
        return message.replace(/\{username\}/g, CONFIG.USER.name);
    }
    return message;
}
