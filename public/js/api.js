import { CONFIG } from './config.js';

/**
 * Lấy thông tin thời tiết cho một thành phố
 * @param {string} cityName - Tên thành phố cần lấy thông tin thời tiết
 * @returns {Promise<string>} - Thông tin thời tiết dạng văn bản
 */
export async function getWeather(cityName) {
    // Chuẩn hóa tên thành phố và tìm mã định danh
    const normalizedCityName = cityName.toLowerCase().trim();
    const locationKey = CONFIG.ACCUWEATHER.LOCATION_KEYS[normalizedCityName];
    
    if (!locationKey) {
        return `Không tìm thấy thông tin thời tiết cho ${cityName}.`;
    }

    try {
        // Tạo URL API với các tham số phù hợp
        const apiUrl = new URL(`https://dataservice.accuweather.com/forecasts/v1/daily/1day/${locationKey}`);
        apiUrl.searchParams.append('apikey', CONFIG.ACCUWEATHER.API_KEY);
        apiUrl.searchParams.append('language', 'vi');
        
        // Gọi API AccuWeather
        const response = await fetch(apiUrl.toString());
        const data = await response.json();

        // Kiểm tra và xử lý dữ liệu
        if (response.ok && data.DailyForecasts && data.DailyForecasts.length > 0) {
            return formatWeatherData(cityName, data.DailyForecasts[0]);
        } else {
            console.warn('AccuWeather API response issue:', data);
            return `Không thể lấy thông tin thời tiết cho ${cityName}.`;
        }
    } catch (error) {
        console.error('Weather API error:', error);
        return 'Đã xảy ra lỗi khi lấy thông tin thời tiết.';
    }
}

/**
 * Chuyển đổi nhiệt độ từ Fahrenheit sang Celsius
 * @param {number} fahrenheit - Nhiệt độ theo độ F
 * @returns {string} - Nhiệt độ theo độ C, làm tròn 1 chữ số thập phân
 */
function fahrenheitToCelsius(fahrenheit) {
    return ((fahrenheit - 32) * 5 / 9).toFixed(1);
}

/**
 * Định dạng dữ liệu thời tiết thành chuỗi thông tin
 * @param {string} cityName - Tên thành phố
 * @param {Object} forecast - Dữ liệu dự báo thời tiết
 * @returns {string} - Thông tin thời tiết đã định dạng
 */
function formatWeatherData(cityName, forecast) {
    const tempMin = fahrenheitToCelsius(forecast.Temperature.Minimum.Value);
    const tempMax = fahrenheitToCelsius(forecast.Temperature.Maximum.Value);

    return `Thời tiết tại ${cityName}:
- Ban ngày: ${forecast.Day.IconPhrase}
- Ban đêm: ${forecast.Night.IconPhrase}
- Nhiệt độ: Từ ${tempMin}°C đến ${tempMax}°C`;
}

/**
 * Gửi yêu cầu đến API Gemma để nhận phản hồi
 * @param {Array} messages - Mảng các tin nhắn theo định dạng của API
 * @returns {Promise<string>} - Phản hồi từ mô hình Gemma
 */
export async function sendGemmaRequest(messages) {
    try {
        const response = await fetch(`${CONFIG.API.BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: CONFIG.API.GEMMA_MODEL,
                messages: messages
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemma API error response:', errorData);
            throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('Unexpected Gemma API response format:', data);
            throw new Error('Invalid response format from API');
        }
        
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Gemma API error:', error);
        return 'Đã xảy ra lỗi khi giao tiếp với trợ lý ảo.';
    }
}
