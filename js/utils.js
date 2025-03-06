function isTimeRelatedQuestion(message) {
    return CONFIG.TIME_KEYWORDS.some(keyword =>
        message.toLowerCase().includes(keyword)
    );
}

function isWeatherRelatedQuestion(message) {
    return CONFIG.WEATHER_KEYWORDS.some(keyword =>
        message.toLowerCase().includes(keyword)
    );
}

function appendMessage(message, isUser) {
    const chatContainer = document.getElementById('chat-container');
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'user-message message' : 'bot-message message';
    messageDiv.textContent = message;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function extractCityName(message) {
    return message.toLowerCase()
        .replace("thời tiết", "")
        .replace("nhiệt độ", "")
        .trim();
}