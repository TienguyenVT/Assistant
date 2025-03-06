async function getWeather(cityName) {
    const locationKey = CONFIG.LOCATION_KEYS[cityName.toLowerCase()];
    if (!locationKey) {
        return `Không tìm thấy thông tin thời tiết cho ${cityName}.`;
    }

    try {
        const response = await fetch(`https://dataservice.accuweather.com/forecasts/v1/daily/1day/${locationKey}?apikey=${CONFIG.ACCUWEATHER_API_KEY}&language=vi`);
        const data = await response.json();

        if (response.ok && data.DailyForecasts) {
            const forecast = data.DailyForecasts[0];
            const tempMin = ((forecast.Temperature.Minimum.Value - 32) * 5 / 9).toFixed(1);
            const tempMax = ((forecast.Temperature.Maximum.Value - 32) * 5 / 9).toFixed(1);

            return `Thời tiết tại ${cityName}:
- Ban ngày: ${forecast.Day.IconPhrase}
- Ban đêm: ${forecast.Night.IconPhrase}
- Nhiệt độ: Từ ${tempMin}°C đến ${tempMax}°C`;
        } else {
            return `Không thể lấy thông tin thời tiết cho ${cityName}.`;
        }
    } catch (error) {
        console.error('Weather API error:', error);
        return 'Đã xảy ra lỗi khi lấy thông tin thời tiết.';
    }
}

async function sendGemmaRequest(messages) {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: CONFIG.GEMMA_MODEL,
                messages: messages
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Gemma API error:', error);
        return 'Đã xảy ra lỗi khi giao tiếp với trợ lý ảo.';
    }
}
