import { CONFIG } from './config.js';
import { appendMessage, isTimeRelatedQuestion, isWeatherRelatedQuestion, extractCityName } from './utils.js';
import { sendGemmaRequest, getWeather, stopCurrentResponse } from './api.js';

// Biến để quản lý trạng thái
let messages = [];
let isFirstMessage = true;
let isWaitingForName = false;
let isProcessingMessage = false;

// Elements
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const stopButton = document.getElementById('stop-button');

// Event listeners
sendButton.addEventListener('click', sendMessage);
stopButton.addEventListener('click', handleStopResponse);
userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sendMessage();
});

/**
 * Xử lý và gửi tin nhắn của người dùng
 * @async
 */
export async function sendMessage() {
    const message = userInput.value.trim();
    if (!message || isProcessingMessage) return;

    try {
        // Hiển thị tin nhắn người dùng và xóa input
        appendMessage(message, true);
        userInput.value = '';
        
        isProcessingMessage = true;
        showStopButton();

        // Bỏ class disabled khỏi nút Stop khi bắt đầu nhận response
        stopButton.classList.remove('disabled');

        if (isWaitingForName) {
            handleNameInput(message);
            return;
        }

        // Xử lý các loại câu hỏi đặc biệt
        if (await handleSpecialQueries(message)) {
            stopButton.classList.add('disabled');
            return;
        }

        // Xử lý câu hỏi thông thường qua Gemma
        await processWithGemma(message);
        
        // Thêm class disabled vào nút Stop khi đã nhận xong response
        stopButton.classList.add('disabled');

    } catch (error) {
        console.error('Error processing message:', error);
        appendMessage('Đã xảy ra lỗi khi xử lý tin nhắn của bạn.', false);
        stopButton.classList.add('disabled');
    } finally {
        isProcessingMessage = false;
        hideStopButton();
    }
}

/**
 * Xử lý các loại câu hỏi đặc biệt (thời gian, thời tiết)
 * @param {string} message - Tin nhắn của người dùng
 * @returns {Promise<boolean>} - True nếu đã xử lý câu hỏi đặc biệt
 */
async function handleSpecialQueries(message) {
    // Xử lý câu hỏi về thời gian
    if (isTimeRelatedQuestion(message)) {
        const now = new Date();
        appendMessage(`Bây giờ là: ${now.toLocaleString()}`, false);
        return true;
    }

    // Xử lý câu hỏi về thời tiết
    if (isWeatherRelatedQuestion(message)) {
        const cityName = extractCityName(message);
        if (cityName && CONFIG.ACCUWEATHER.LOCATION_KEYS[cityName.toLowerCase()]) {
            const weatherInfo = await getWeather(cityName);
            appendMessage(weatherInfo, false);
            return true;
        } else {
            appendMessage(`Xin lỗi, tôi chỉ có thông tin thời tiết cho các thành phố: ${Object.keys(CONFIG.ACCUWEATHER.LOCATION_KEYS).join(', ')}`, false);
            return true;
        }
    }

    return false;
}

/**
 * Xử lý tin nhắn thông qua API Gemma
 * @param {string} message - Tin nhắn của người dùng
 */
async function processWithGemma(message) {
    if (messages.length === 0) {
        messages.push({
            role: "system",
            content: CONFIG.PROMPT.SYSTEM
        });
    }

    messages.push({
        role: "user", 
        content: message
    });

    try {
        const messageContainer = createMessageContainer();
        let currentResponse = '';

        // Callback xử lý từng chunk với debounce
        const handleChunk = (chunk) => {
            currentResponse += chunk;
            const formattedResponse = formatResponse(currentResponse);
            updateMessageContainer(messageContainer, formattedResponse);
        };

        // Gửi request và nhận response theo stream
        const fullResponse = await sendGemmaRequest(messages, handleChunk);

        // Đảm bảo hiển thị nội dung cuối cùng
        const finalFormattedResponse = formatResponse(fullResponse);
        updateMessageContainer(messageContainer, finalFormattedResponse);

        // Thêm response đầy đủ vào lịch sử
        messages.push({
            role: "assistant",
            content: fullResponse
        });

    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Response was stopped by user');
            // Don't show error message for user-initiated stops
            return;
        } else {
            console.error('Error in processWithGemma:', error);
            appendMessage('Đã xảy ra lỗi khi xử lý tin nhắn.', false);
        }
    } finally {
        isProcessingMessage = false;
        hideStopButton();
    }
}

/**
 * Xử lý sự kiện dừng response
 */
function handleStopResponse() {
    stopCurrentResponse();
    stopButton.classList.add('disabled');
}

/**
 * Hiển thị nút Stop
 */
function showStopButton() {
    stopButton.classList.remove('hidden');
}

/**
 * Ẩn nút Stop
 */
function hideStopButton() {
    stopButton.classList.add('hidden');
}

/**
 * Tạo container cho tin nhắn đang được stream
 * @returns {HTMLElement} - Container element
 */
function createMessageContainer() {
    const chatContainer = document.getElementById('chat-container');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'bot-message message';
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return messageDiv;
}

/**
 * Cập nhật nội dung của message container
 * @param {HTMLElement} container - Container cần cập nhật
 * @param {string} formattedContent - Nội dung đã được format
 */
function updateMessageContainer(container, formattedContent) {
    if (!container) return;

    // Tạo fragment để tối ưu DOM updates
    const fragment = document.createDocumentFragment();
    const blocks = formattedContent.split('\n\n');
    
    // Kiểm tra các block đã tồn tại
    const existingBlocks = container.querySelectorAll('.text-block');
    const existingContent = Array.from(existingBlocks).map(block => block.innerHTML);
    
    // Tạo hoặc cập nhật từng block
    blocks.forEach((block, index) => {
        let blockDiv;
        
        if (index < existingBlocks.length) {
            // Cập nhật block hiện có nếu nội dung thay đổi
            blockDiv = existingBlocks[index];
            
            if (blockDiv.innerHTML !== block) {
                // Thêm class để kích hoạt transition
                blockDiv.style.opacity = '0';
                blockDiv.style.transform = 'translateY(5px)';
                
                // Cập nhật nội dung và kích hoạt animation
                setTimeout(() => {
                    blockDiv.innerHTML = block;
                    blockDiv.style.opacity = '1';
                    blockDiv.style.transform = 'translateY(0)';
                }, 50);
            }
        } else {
            // Tạo block mới với animation
            blockDiv = document.createElement('div');
            blockDiv.className = 'text-block';
            blockDiv.style.opacity = '0';
            blockDiv.style.transform = 'translateY(5px)';
            
            blockDiv.innerHTML = block;
            fragment.appendChild(blockDiv);
            
            // Kích hoạt animation sau khi thêm vào DOM
            requestAnimationFrame(() => {
                blockDiv.style.opacity = '1';
                blockDiv.style.transform = 'translateY(0)';
            });
        }
    });

    // Thêm các block mới (nếu có)
    if (fragment.children.length > 0) {
        container.appendChild(fragment);
    }

    // Scroll xuống cuối với animation mượt mà
    const chatContainer = container.parentElement;
    if (chatContainer) {
        const shouldScroll = 
            chatContainer.scrollTop + chatContainer.clientHeight >= 
            chatContainer.scrollHeight - 100;

        if (shouldScroll) {
            chatContainer.scrollTo({
                top: chatContainer.scrollHeight,
                behavior: 'smooth'
            });
        }
    }
}

/**
 * Format văn bản trả về từ API
 * @param {string} response - Response text từ API
 * @returns {string} - Text đã được format
 */
function formatResponse(response) {
    if (!response) return '';
    
    // Xử lý text thông thường
    const sections = response.split('\n\n');
    return sections.map(section => {
        if (section.includes('\n- ')) {
            return formatBulletPoints(section);
        }
        return formatParagraph(section);
    }).join('\n\n');
}

/**
 * Thêm tin nhắn đã format vào container
 * @param {string} message - Tin nhắn đã được format
 */
function appendFormattedMessage(message) {
    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = 'bot-message message';
    
    // Tạo các block con cho từng phần của tin nhắn
    const blocks = message.split('\n\n');
    blocks.forEach(block => {
        const blockDiv = document.createElement('div');
        blockDiv.className = 'text-block';
        
        if (block.startsWith('```')) {
            // Xử lý code block
            blockDiv.innerHTML = formatCodeBlock(block);
        } else {
            // Xử lý text thường
            blockDiv.innerHTML = block;
        }
        
        messageDiv.appendChild(blockDiv);
    });

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * Format bullet points
 */
function formatBulletPoints(text) {
    return text.split('\n').map(line => {
        if (line.startsWith('- ')) {
            return `<div class="bullet-point">${line.substring(2)}</div>`;
        }
        return `<div class="text-paragraph">${line}</div>`;
    }).join('\n');
}

/**
 * Format heading
 */
function formatHeading(text) {
    const level = text.match(/^#+/)[0].length;
    const content = text.replace(/^#+\s*/, '');
    return `<div class="heading-${level}">${content}</div>`;
}

/**
 * Format paragraph
 */
function formatParagraph(text) {
    return `<div class="text-paragraph">${text}</div>`;
}

/**
 * Hiển thị ngày giờ hiện tại
 */
function showDateTime() {
    const now = new Date();
    const dateTimeString = now.toLocaleString();
    appendMessage(`Ngày và giờ hiện tại: ${dateTimeString}`, false);
}


async function showWeather() {
    try {
        const weatherInfo = await getWeather("Hà Nội");
        appendMessage(weatherInfo, false);
    } catch (error) {
        console.error('Error getting weather:', error);
        appendMessage('Đã xảy ra lỗi khi lấy thông tin thời tiết.', false);
    }
}

/**
 * Bắt đầu cuộc trò chuyện mới
 */
export function newChat() {
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = '';
    messages = [{
        role: "system",
        content: CONFIG.PROMPT.SYSTEM
    }];
    initializeChat();
}

/**
 * Chuyển đổi tên người dùng thành dạng viết hoa
 * @param {string} name - Tên người dùng
 * @returns {string} Tên đã được viết hoa
 */
function capitalizeUserName(name) {
    return name.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Thêm hàm khởi tạo chat
function initializeChat() {
    const sessionToken = localStorage.getItem('sessionToken');
    const savedName = localStorage.getItem(CONFIG.USER.storageKey);
    
    if (!sessionToken) {
        appendMessage("Vui lòng đăng nhập hoặc đăng ký để tôi có thể hỗ trợ bạn tốt hơn 😊", false);
        return;
    }
    
    if (savedName) {
        const capitalizedName = capitalizeUserName(savedName);
        CONFIG.USER.name = capitalizedName;
        appendMessage(`Xin chào ${capitalizedName}! 👋 Tôi có thể giúp gì được cho bạn?`, false);
    } else {
        // Hiển thị tin nhắn introduction theo thứ tự
        const intro = CONFIG.PROMPT.INTRODUCTION;
        
        // Lời chào
        appendMessage(intro.GREETING, false);
        
        // Tính năng
        setTimeout(() => {
            appendMessage("Tôi được đào tạo để:", false);
            intro.FEATURES.forEach((feature, index) => {
                setTimeout(() => {
                    appendMessage(`• ${feature}`, false);
                }, 200 * (index + 1));
            });
        }, 1000);
        
        // Yêu cầu tên
        setTimeout(() => {
            appendMessage(intro.NAME_REQUEST, false);
            isWaitingForName = true;
        }, 3000);
    }
}

// Thêm hàm xử lý input tên
function handleNameInput(name) {
    name = name.trim();
    if (name) {
        const capitalizedName = capitalizeUserName(name);
        CONFIG.USER.name = capitalizedName;
        localStorage.setItem(CONFIG.USER.storageKey, capitalizedName);
        isWaitingForName = false;
        appendMessage(`Xin chào ${capitalizedName}! 👋 Tôi có thể giúp gì được cho bạn?`, false);
    } else {
        appendMessage('Xin lỗi, tôi chưa nghe rõ tên của bạn. Bạn có thể sử dụng nickname khác được không? ', false);
    }
}

// Thêm lệnh khởi tạo chat khi trang được load
document.addEventListener('DOMContentLoaded', () => {
    initializeChat();
    
    // ... existing event listeners ...
});

/**
 * Tạo và hiển thị hiệu ứng đang nhập
 * @param {HTMLElement} container - Container để hiển thị hiệu ứng
 * @returns {HTMLElement} - Element hiệu ứng đang nhập
 */
function showTypingIndicator(container) {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    container.appendChild(typingDiv);
    return typingDiv;
}

// Sử dụng class để quản lý chat history thay vì global variable
class ChatManager {
    constructor() {
        this.messages = [];
        this.specialHandlers = {
            time: this.handleTimeQuery.bind(this),
            weather: this.handleWeatherQuery.bind(this),
            schedule: this.handleScheduleQuery.bind(this),
            timer: this.handleTimerQuery.bind(this)
        };
    }

    async handleSpecialQueries(message) {
        // Xử lý thời gian
        if (isTimeRelatedQuestion(message)) {
            return await this.specialHandlers.time(message);
        }

        // Xử lý thời tiết
        if (isWeatherRelatedQuestion(message)) {
            return await this.specialHandlers.weather(message);
        }

        // Xử lý lịch trình
        if (isScheduleRelatedQuestion(message)) {
            return await this.specialHandlers.schedule(message);
        }

        // Xử lý hẹn giờ
        if (isTimerRelatedQuestion(message)) {
            return await this.specialHandlers.timer(message);
        }

        return false;
    }

    // ... các phương thức xử lý khác
}

function parseResponseBlocks(response) {
    const blocks = [];
    let currentBlock = {
        type: 'text',
        content: ''
    };

    // Tách response thành các dòng
    const lines = response.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Xử lý code block
        if (line.trim().startsWith('```')) {
            if (currentBlock.content) {
                blocks.push({...currentBlock});
                currentBlock.content = '';
            }
            
            // Bắt đầu code block mới
            currentBlock.type = 'code';
            currentBlock.language = line.trim().slice(3);
            continue;
        }
        
        // Kết thúc code block
        if (currentBlock.type === 'code' && line.trim() === '```') {
            blocks.push({...currentBlock});
            currentBlock = {
                type: 'text',
                content: ''
            };
            continue;
        }

        // Xử lý text thông thường
        if (currentBlock.type === 'text') {
            // Kiểm tra đây có phải là tiêu đề không
            if (line.trim().startsWith('**') && line.trim().endsWith(':**')) {
                if (currentBlock.content) {
                    blocks.push({...currentBlock});
                }
                blocks.push({
                    type: 'heading',
                    content: line.trim()
                });
                currentBlock = {
                    type: 'text',  
                    content: ''
                };
                continue;
            }
            
            // Kiểm tra bullet point
            if (line.trim().startsWith('*')) {
                if (currentBlock.content) {
                    blocks.push({...currentBlock});
                }
                blocks.push({
                    type: 'bullet',
                    content: line.trim()
                });
                currentBlock = {
                    type: 'text',
                    content: ''
                };
                continue;
            }

            // Thêm dòng vào text block hiện tại
            if (line.trim() === '') {
                // Kết thúc paragraph nếu gặp dòng trống
                if (currentBlock.content) {
                    blocks.push({...currentBlock});
                    currentBlock.content = '';
                }
            } else {
                // Thêm dòng vào paragraph hiện tại
                currentBlock.content += (currentBlock.content ? ' ' : '') + line;
            }
        } else {
            // Thêm dòng vào code block
            currentBlock.content += line + '\n';
        }
    }

    // Thêm block cuối cùng nếu còn
    if (currentBlock.content) {
        blocks.push({...currentBlock});
    }

    return blocks;
}

// Make sendMessage available globally
window.sendMessage = sendMessage;
