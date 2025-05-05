// Import configuration settings
import { CONFIG } from './config.js';

/**
 * Check if a message is related to time/schedule questions
 * @param {string} message - Message to check
 * @returns {boolean} - True if message contains time-related keywords
 */
export function isTimeRelatedQuestion(message) {
    // Return false for invalid input
    if (!message || typeof message !== 'string') {
        return false;
    }
    
    // Convert message to lowercase for case-insensitive matching
    const normalizedMessage = message.toLowerCase();
    return CONFIG.KEYWORDS.TIME.some(keyword => normalizedMessage.includes(keyword));
}

/**
 * Check if a message is related to weather questions
 * @param {string} message - Message to check  
 * @returns {boolean} - True if message contains weather-related keywords
 */
export function isWeatherRelatedQuestion(message) {
    // Return false for invalid input
    if (!message || typeof message !== 'string') {
        return false;
    }
    
    // Convert message to lowercase for case-insensitive matching
    const normalizedMessage = message.toLowerCase();
    return CONFIG.KEYWORDS.WEATHER.some(keyword => normalizedMessage.includes(keyword));
}

/**
 * Add a new message to the chat container
 * @param {string} message - Message content to append
 * @param {boolean} isUser - True if message is from user, false if from bot
 */
export function appendMessage(message, isUser) {
    // Get chat container element
    const chatContainer = document.getElementById('chat-container');
    
    // Return if container not found
    if (!chatContainer) {
        console.error('Chat container not found');
        return;
    }
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'user-message message' : 'bot-message message';
    
    // Format tin nhắn với tên người dùng nếu là tin nhắn bot
    const formattedMessage = isUser ? message : formatMessageWithName(message);
    
    // Sử dụng formatting khác nhau cho tin nhắn người dùng và bot 
    if (isUser) {
        messageDiv.textContent = formattedMessage;
    } else {
        // Sử dụng hàm formatBotMessage cho tin nhắn bot
        messageDiv.innerHTML = formatBotMessage(formattedMessage);
    }
    
    // Thêm tin nhắn và cuộn xuống dưới
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * Extract city name from a weather-related question
 * @param {string} message - Weather question to parse
 * @returns {string} - Extracted city name
 */
export function extractCityName(message) {
    // Return empty string for invalid input
    if (!message || typeof message !== 'string') {
        return '';
    }
    
    // Normalize message to lowercase and trim whitespace
    const normalizedMessage = message.toLowerCase().trim();
    
    // Keywords to remove from the message to isolate city name
    const keywordsToRemove = [
        'thời tiết', 'nhiệt độ', 'mưa', 'nắng', 'dự báo',
        'tại', 'ở', 'của', 'hôm nay', 'ngày mai', 'thế nào',
        'như thế nào', 'ra sao', 'thành phố', 'tỉnh'
    ];
    
    // Map of common city name abbreviations and aliases
    const specialCases = {
        'hcm': 'hồ chí minh',
        'sg': 'hồ chí minh',
        'sài gòn': 'hồ chí minh',
        'hn': 'hà nội'
    };

    let result = normalizedMessage;
    
    // Remove all non-city keywords
    keywordsToRemove.forEach(keyword => {
        result = result.replace(new RegExp(`\\b${keyword}\\b`, 'g'), '');
    });
    
    // Handle special cases and return trimmed result
    result = result.trim();
    return specialCases[result] || result;
}

/**
 * Replace {username} placeholder with actual username in messages
 * @param {string} message - Message containing username placeholder
 * @returns {string} - Message with username inserted
 */
function formatMessageWithName(message) {
    if (CONFIG.USER.name) {
        return message.replace(/\{username\}/g, CONFIG.USER.name);
    }
    return message;
}

/**
 * Example function for demonstration purposes
 * @returns {number} Sum of x and y
 */
function example() { 
    let x = 10; 
    let y = 20; 
    return x + y; 
}

/**
 * Format tin nhắn bot để hiển thị đúng định dạng
 * @param {string} message - Tin nhắn gốc từ bot
 * @returns {string} - Tin nhắn đã được format
 */
function formatBotMessage(message) {
    // Tách thành các đoạn văn bản
    const paragraphs = message.split('\n\n');
    
    return paragraphs.map(paragraph => {
        // Bỏ qua đoạn trống
        if (!paragraph.trim()) return '';
        
        // Xử lý tiêu đề 
        if (paragraph.startsWith('#')) {
            const level = paragraph.match(/^#+/)[0].length;
            const content = paragraph.replace(/^#+\s*/, '');
            return `<div class="heading-${level}">${content}</div>`;
        }

        // Xử lý bullet point
        if (paragraph.startsWith('* ')) {
            return `<div class="bullet-point">${paragraph.substring(2)}</div>`;
        }

        // Xử lý giải thích
        if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
            return `<div class="explanation">${paragraph.slice(2, -2)}</div>`;
        }

        // Đoạn văn bản thường
        return `<div class="paragraph">${paragraph}</div>`;
    }).join('');
}

// Export các hàm cần thiết
export { formatBotMessage };
