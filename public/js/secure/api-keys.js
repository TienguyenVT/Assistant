/**
 * Quản lý các khóa API một cách an toàn
 * Lưu ý: Không được commit file này lên version control
 */
export const API_KEYS = {
    // Khóa AccuWeather
    ACCUWEATHER: {
        API_KEY: "vANWrSRtLlt97kQK91wcI1xANQNZ2gCz", // Placeholder for actual API key
        
        // Mã định danh các thành phố chính
        LOCATION_KEYS: {
            "hà nội": "353412",
            "tp.hcm": "353981",
            "hồ chí minh": "353981",
            "đà nẵng": "351939",
            // Có thể thêm các thành phố khác ở đây
        }
    },

    // Khóa News API
    NEWS_API: {
        API_KEY: "pub_73250ca421728b37242224ee7195216268c84" // Sample API key
    },

    // Các khóa API khác
    OLLAMA: {
        BASE_URL: "http://localhost:11434/v1"
    }
};

// Hàm để lấy khóa API một cách an toàn
export function getApiKey(service) {
    const key = API_KEYS[service]?.API_KEY;
    
    if (!key) {
        console.error(`
🚨 CRITICAL: API Key Not Configured 🚨

Bạn cần cấu hình khóa API cho dịch vụ: ${service}

Hướng dẫn:
1. Mở file: public/js/secure/api-keys.js
2. Điền khóa API thực tế của bạn vào trường API_KEY
3. Đối với ${service}, hãy thay thế 'null' bằng khóa API của bạn

Ví dụ:
API_KEYS.${service}.API_KEY = "your_actual_api_key_here";

Nguồn lấy khóa API:
- AccuWeather: https://developer.accuweather.com/
- News API: https://newsdata.io/
`);
        return null;
    }
    return key;
}

// Hàm để lấy các cấu hình khác
export function getApiConfig(service) {
    return API_KEYS[service] || {};
}

// Kiểm tra và cảnh báo nếu không có khóa API
function checkApiKeysConfigured() {
    const services = ['ACCUWEATHER', 'NEWS_API'];
    const missingKeys = services.filter(service => !API_KEYS[service]?.API_KEY);
    
    if (missingKeys.length > 0) {
        console.warn(`⚠️ Các dịch vụ sau chưa được cấu hình API key: ${missingKeys.join(', ')}`);
    }
}

// Chạy kiểm tra khi module được import
checkApiKeysConfigured(); 