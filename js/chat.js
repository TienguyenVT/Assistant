let messages = [];

document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sendMessage();
});


async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();

    if (message) {
        appendMessage(message, true);
        userInput.value = '';

        // Xử lý câu hỏi thời gian
        if (isTimeRelatedQuestion(message)) {
            const now = new Date();
            appendMessage(`Bây giờ là: ${now.toLocaleString()}`, false);
            return;
        }

        // Xử lý câu hỏi thời tiết
        if (isWeatherRelatedQuestion(message)) {
            const cityName = extractCityName(message);
            if (cityName) {
                const weatherInfo = await getWeather(cityName);
                appendMessage(weatherInfo, false);
                return;
            }
        }

        // Gọi API Ollama/Gemma
        try {
            // Thêm tin nhắn người dùng vào danh sách
            messages.push({
                role: "user",
                content: message
            });

            const botResponse = await sendGemmaRequest(messages);

            // Thêm phản hồi của bot vào danh sách
            messages.push({
                role: "assistant",
                content: botResponse
            });

            appendMessage(botResponse, false);
        } catch (error) {
            console.error('Error:', error);
            appendMessage('Đã xảy ra lỗi khi giao tiếp với trợ lý ảo.', false);
        }
    }
}

function showDateTime() {
    const now = new Date();
    const dateTimeString = now.toLocaleString();
    appendMessage(`Ngày và giờ hiện tại: ${dateTimeString}`, false);
}

function createSchedule() {
    appendMessage("Tính năng lập thời khóa biểu đang được phát triển.", false);
}

// function showWeather() {
//     message = "Thời tiết tại Hà Nội";
//     const cityName = extractCityName(message);
//     const 
// }

function newChat() {
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = '';
    messages = []; // Reset chat history
    appendMessage("Đoạn chat mới đã được bắt đầu.", false);
}