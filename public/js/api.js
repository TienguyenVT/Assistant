import { CONFIG } from './config.js';
import { getApiKey, getApiConfig } from './secure/api-keys.js';

// Biến để theo dõi request đang được thực hiện
let currentResponseController = null;
let currentReader = null;

/**
 * Lấy thông tin thời tiết cho một thành phố
 * @param {string} cityName - Tên thành phố cần lấy thông tin thời tiết
 * @returns {Promise<string>} - Thông tin thời tiết dạng văn bản
 */
export async function getWeather(cityName) {
    // Chuẩn hóa tên thành phố và tìm mã định danh
    const normalizedCityName = cityName.toLowerCase().trim();
    const locationKeys = getApiConfig('ACCUWEATHER').LOCATION_KEYS || {};
    const locationKey = locationKeys[normalizedCityName];
    
    if (!locationKey) {
        return `Không tìm thấy thông tin thời tiết cho ${cityName}.`;
    }

    const apiKey = getApiKey('ACCUWEATHER');
    if (!apiKey) {
        return 'Không thể truy cập dịch vụ thời tiết. Vui lòng kiểm tra cấu hình API.';
    }

    try {
        // Tạo URL API với các tham số phù hợp
        const apiUrl = new URL(`https://dataservice.accuweather.com/forecasts/v1/daily/1day/${locationKey}`);
        apiUrl.searchParams.append('apikey', apiKey);
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
 * Gửi yêu cầu đến API Gemma để nhận phản hồi theo stream
 * @param {Array} messages - Mảng các tin nhắn theo định dạng của API
 * @param {Function} onChunk - Callback để xử lý từng phần của response
 * @returns {Promise<string>} - Toàn bộ phản hồi từ mô hình Gemma
 */
export async function sendGemmaRequest(messages, onChunk) {
    try {
        // Cleanup any existing response
        if (currentResponseController) {
            currentResponseController.abort();
        }
        
        // Create new controller
        currentResponseController = new AbortController();
        const signal = currentResponseController.signal;

        const response = await fetch(`${CONFIG.API.BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: CONFIG.API.GEMMA_MODEL,
                messages: messages,
                stream: true,
                max_tokens_per_chunk: 10
            }),
            signal
        });

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        currentReader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullResponse = '';
        
        try {
            while (true) {
                const {done, value} = await currentReader.read();
                
                if (done) {
                    break;
                }

                const chunk = decoder.decode(value, {stream: true});
                buffer += chunk;

                // Process complete messages
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.choices?.[0]?.delta?.content) {
                                const content = parsed.choices[0].delta.content;
                                fullResponse += content;
                                if (onChunk) onChunk(content);
                            }
                        } catch (e) {
                            console.warn('Error parsing chunk:', e);
                        }
                    }
                }
            }
        } finally {
            if (currentReader) {
                try {
                    await currentReader.cancel();
                } catch (e) {
                    console.warn('Error canceling reader:', e);
                }
                currentReader = null;
            }
        }

        return fullResponse;

    } catch (error) {
        if (error.name === 'AbortError') {
            // Clean throw for expected abort
            throw error;
        }
        console.error('Error in sendGemmaRequest:', error);
        throw error;
    } finally {
        // Always cleanup the controller
        currentResponseController = null;
    }
}

/**
 * Dừng response stream hiện tại nếu có
 */
export async function stopCurrentResponse() {
    if (currentReader) {
        try {
            await currentReader.cancel();
        } catch (e) {
            console.warn('Error canceling reader:', e);
        }
        currentReader = null;
    }
    if (currentResponseController) {
        currentResponseController.abort();
        currentResponseController = null;
    }
}
