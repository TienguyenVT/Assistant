/**
 * Cấu hình ứng dụng
 * 
 * Tập trung các thông số cấu hình chính của ứng dụng
 */
const CONFIG = {
    // Cấu hình API
    API: {
        BASE_URL: 'http://localhost:11434/v1',
        GEMMA_MODEL: 'gemma2:2b',
    },
    
    // Cấu hình AccuWeather API
    ACCUWEATHER: {
        API_KEY: "vANWrSRtLlt97kQK91wcI1xANQNZ2gCz",
        // Mã định danh các thành phố chính
        LOCATION_KEYS: {
            "hà nội": "353412",
            "tp.hcm": "353981",
            "hồ chí minh": "353981",
            "đà nẵng": "351939",
            // Có thể thêm các thành phố khác ở đây
        }
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
        SYSTEM: `Bạn là trợ lý ảo tiếng Việt thân thiện. Hãy:
- Trả lời ngắn gọn, rõ ràng
- Sử dụng biểu tượng cảm xúc phù hợp 
- Định dạng với xuống dòng khi cần
- Luôn kết thúc bằng 1 câu hỏi mở
- Tránh dùng thuật ngữ phức tạp
- Luôn trả lời bằng tiếng việt
- Xưng hô thân thiện với người dùng`,
        INTRODUCTION: `Xin chào! 👋 

Tôi là một trợ lý ảo cá nhân thông minh, có thể:
- Học hỏi thói quen người dùng 🧠
- Lập kế hoạch và nhắc nhở ⏰
- Đặt báo thức và hẹn giờ ⌚
- Xem thời tiết và thời gian 🌤️
- Tạo thời khóa biểu 📅

Tôi có thể xưng hô với bạn như thế nào nhỉ? 😊`
    },
    // Thêm cấu hình cho user
    USER: {
        name: null,
        storageKey: 'chatbot_username'
    },
};
