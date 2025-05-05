/**
 * Cấu hình ứng dụng
 * 
 * Tập trung các thông số cấu hình chính của ứng dụng
 */
import { API_KEYS } from './secure/api-keys.js';

export const CONFIG = {
    // Cấu hình API
    API: {
        BASE_URL: API_KEYS.OLLAMA.BASE_URL,
        GEMMA_MODEL: localStorage.getItem('selectedModel') || 'gemma2:2b', // Lấy model từ localStorage nếu có
        OLLAMA_URL: 'http://localhost:11434/api',
        ENDPOINTS: {
            CHAT: '/chat',
            LIST_MODELS: '/api/tags',
            GENERATE: '/generate'
        }
    },

    // Cấu hình Model
    MODEL: {
        // Danh sách các model mặc định
        DEFAULTS: {
            CHAT: 'gemma2:2b',
            CODE: 'codellama:7b',
            WRITING: 'mistral:7b'
        },
        // Các category cho model
        CATEGORIES: {
            all: { name: 'Tất cả', icon: '🤖' },
            chat: { name: 'Trò chuyện', icon: '💬' },
            code: { name: 'Lập trình', icon: '👨‍💻' },
            writing: { name: 'Viết lách', icon: '✍️' }
        }
    },

    USER: {
        storageKey: 'userName',
        name: null
    },
    
    // Cấu hình AccuWeather API
    ACCUWEATHER: {
        API_KEY: API_KEYS.ACCUWEATHER.API_KEY,
        // Mã định danh các thành phố chính
        LOCATION_KEYS: API_KEYS.ACCUWEATHER.LOCATION_KEYS
    },
    
    // Từ khóa nhận diện
    KEYWORDS: {
        // Từ khóa liên quan đến thời gian
        TIME: [
            "mấy giờ", "ngày nào", "thời gian",
            "hôm nay", "hôm qua", "ngày mai", "giờ hiện tại"
        ],
        
        // Từ khóa liên quan đến thời tiết
        WEATHER: [
            "thời tiết", "nhiệt độ", "độ ẩm",
            "mưa", "nắng", "gió"
        ]
    },
    
    // Cấu hình giao diện
    UI: {
        THEME: 'dark',
        DEFAULT_LANGUAGE: 'vi'
    },
    // Cấu hình prompt
    PROMPT: {
        SYSTEM: "Bạn là một trợ lý AI thân thiện, hữu ích và thông minh. Hãy giúp đỡ người dùng một cách chân thành và hiệu quả.",
        INTRODUCTION: {
            GREETING: "Xin chào! Tôi là trợ lý AI cá nhân của bạn 🤖",
            FEATURES: [
                "Hỗ trợ trò chuyện và giải đáp thắc mắc",
                "Hỗ trợ lập trình và giải thuật",
                "Hỗ trợ tra cứu thông tin",
                "Hỗ trợ quản lý thời gian và công việc"
            ],
            NAME_REQUEST: "Tôi có thể gọi bạn là gì? 😊"
        }
    },
    // Thêm cấu hình cho user
    USER: {
        name: null,
        storageKey: 'chatbot_username'
    },
};

// Thêm hàm helper để cập nhật model
export function updateModelConfig(modelName) {
    CONFIG.API.GEMMA_MODEL = modelName;
    localStorage.setItem('selectedModel', modelName);
}

// Thêm hàm để lấy model hiện tại
export function getCurrentModel() {
    return CONFIG.API.GEMMA_MODEL;
}

function capitalizeUserName(name) {
    if (!name) return name;
    return name.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Retrieve existing username from localStorage if it exists
const existingUserName = localStorage.getItem(CONFIG.USER.storageKey);

if (existingUserName) {
    const capitalizedName = capitalizeUserName(existingUserName);
    CONFIG.USER.name = capitalizedName;
} else {
    // If no existing username, set to null
    CONFIG.USER.name = null;
}