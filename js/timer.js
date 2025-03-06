function showTimerModal() {

    // Input style
    const inputStyle = `
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 16px;
        margin-bottom: 15px;
    `;

    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.classList.add('modal-backdrop');
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        background-color: white;
        padding: 30px;
        border-radius: 15px;
        width: 400px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        position: relative;
    `;
    const activeTimersContainer = document.createElement('div');

    activeTimersContainer.style.cssText = `
        margin-bottom: 20px;
        max-height: 200px;
        overflow-y: auto;
        `;

    activeTimersContainer.innerHTML = '<h3>Các hẹn giờ đang chạy:</h3>';

    const activeTimers = document.querySelectorAll('.notification-container > div');

    if (activeTimers.length === 0) {
        const noTimerMessage = document.createElement('p');
        noTimerMessage.textContent = 'Không có hẹn giờ nào đang chạy.';
        noTimerMessage.style.color = '#888';
        activeTimersContainer.appendChild(noTimerMessage);
    } else {
        activeTimers.forEach((timer, index) => {
            const timerInfo = document.createElement('div');
            timerInfo.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                background-color: #f0f0f0;
                margin-bottom: 10px;
                border-radius: 5px;
            `;

            // Hiển thị thông tin timer
            const timerDetails = timer.querySelector('div:first-child');
            const timerNote = timer.querySelector('div:nth-child(2)');

            const infoText = document.createElement('span');
            infoText.textContent = `${timerDetails ? timerDetails.textContent : 'Hẹn giờ'} ${timerNote ? '- ' + timerNote.textContent : ''}`;

            // Nút Tắt
            const stopButton = document.createElement('button');
            stopButton.textContent = 'Tắt';
            stopButton.style.cssText = `
                background-color: #e74c3c;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 3px;
                cursor: pointer;
            `;
            stopButton.addEventListener('click', () => {
                // Tìm và xóa notification tương ứng
                const closeBtn = timer.querySelector('button');
                if (closeBtn) closeBtn.click();
                timerInfo.remove();

                // Cập nhật danh sách nếu không còn timer
                if (activeTimersContainer.querySelectorAll('div[style*="display: flex"]').length === 0) {
                    const noTimerMessage = document.createElement('p');
                    noTimerMessage.textContent = 'Không có hẹn giờ nào đang chạy.';
                    noTimerMessage.style.color = '#888';
                    activeTimersContainer.appendChild(noTimerMessage);
                }
            });

            timerInfo.appendChild(infoText);
            timerInfo.appendChild(stopButton);
            activeTimersContainer.appendChild(timerInfo);
        });
    }

    // Title
    const title = document.createElement('h2');
    title.textContent = 'Hẹn Giờ / Đếm Ngược';
    title.style.textAlign = 'center';
    title.style.marginBottom = '20px';

    // Form
    const form = document.createElement('form');
    form.style.display = 'flex';
    form.style.flexDirection = 'column';
    form.style.gap = '15px';

    // Timer type selection
    const timerTypeLabel = document.createElement('label');
    timerTypeLabel.textContent = 'Loại Hẹn Giờ:';
    const timerTypeSelect = document.createElement('select');
    timerTypeSelect.style.cssText = `
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 16px;
    `;
    const timerTypes = [
        { value: 'countdown', label: 'Đếm Ngược' },
        { value: 'timer', label: 'Báo Thức' }
    ];
    timerTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.value;
        option.textContent = type.label;
        timerTypeSelect.appendChild(option);
    });

    // Time inputs
    const hoursLabel = document.createElement('label');
    hoursLabel.textContent = 'Giờ:';
    const hoursInput = document.createElement('input');
    hoursInput.type = 'number';
    hoursInput.min = '0';
    hoursInput.max = '23';
    hoursInput.placeholder = 'Giờ';
    hoursInput.style.cssText = inputStyle;

    const minutesLabel = document.createElement('label');
    minutesLabel.textContent = 'Phút:';
    const minutesInput = document.createElement('input');
    minutesInput.type = 'number';
    minutesInput.min = '0';
    minutesInput.max = '59';
    minutesInput.placeholder = 'Phút';
    minutesInput.style.cssText = inputStyle;

    const secondsLabel = document.createElement('label');
    secondsLabel.textContent = 'Giây:';
    const secondsInput = document.createElement('input');
    secondsInput.type = 'number';
    secondsInput.min = '0';
    secondsInput.max = '59';
    secondsInput.placeholder = 'Giây';
    secondsInput.style.cssText = inputStyle;

    // Note input
    const noteLabel = document.createElement('label');
    noteLabel.textContent = 'Ghi Chú (Tuỳ Chọn):';
    const noteInput = document.createElement('input');
    noteInput.type = 'text';
    noteInput.placeholder = 'Nhập ghi chú';
    noteInput.style.cssText = inputStyle;

    // Submit button
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Bắt Đầu';
    submitButton.style.cssText = `
        padding: 12px;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
        transition: background-color 0.3s;
        margin-top: 10px;
    `;

    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
    `;
    closeButton.addEventListener('click', () => backdrop.remove());

    // Event listener for submit
    submitButton.addEventListener('click', (e) => {
        e.preventDefault();

        // Validate inputs
        const hours = parseInt(hoursInput.value) || 0;
        const minutes = parseInt(minutesInput.value) || 0;
        const seconds = parseInt(secondsInput.value) || 0;
        const timerType = timerTypeSelect.value;
        const note = noteInput.value.trim();

        // Calculate total seconds
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;

        if (totalSeconds > 0) {
            // Start timer
            startTimer(totalSeconds, timerType, note);
            backdrop.remove();
        } else {
            alert('Vui lòng nhập thời gian hợp lệ.');
        }
    });

    // Compose modal
    form.appendChild(timerTypeLabel);
    form.appendChild(timerTypeSelect);
    form.appendChild(hoursLabel);
    form.appendChild(hoursInput);
    form.appendChild(minutesLabel);
    form.appendChild(minutesInput);
    form.appendChild(secondsLabel);
    form.appendChild(secondsInput);
    form.appendChild(noteLabel);
    form.appendChild(noteInput);

    modal.appendChild(title);
    modal.appendChild(form);
    modal.appendChild(submitButton);
    modal.appendChild(closeButton);
    modal.appendChild(activeTimersContainer);
    backdrop.appendChild(modal);

    // Add to body
    document.body.appendChild(backdrop);

    // Close modal when clicking outside
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
            backdrop.remove();
        }
    });
}

function startTimer(totalSeconds, timerType, note) {
    const notificationContainer = document.getElementById('notification-container');

    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #3498db;
        color: white;
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1100;
        display: flex;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s;
    `;

    // Timer display
    const timerDisplay = document.createElement('div');
    timerDisplay.style.marginRight = '15px';
    timerDisplay.style.fontWeight = 'bold';

    // Close button
    const closeNotification = document.createElement('button');
    closeNotification.textContent = '✕';
    closeNotification.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-left: 10px;
    `;

    // Append elements
    notification.appendChild(timerDisplay);

    // Add note if exists
    if (note) {
        const noteElement = document.createElement('div');
        noteElement.textContent = note;
        noteElement.style.fontSize = '14px';
        noteElement.style.marginRight = '15px';
        notification.insertBefore(noteElement, timerDisplay);
    }

    notification.appendChild(closeNotification);
    notificationContainer.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);

    // Timer logic
    let remainingSeconds = totalSeconds;
    const timerInterval = setInterval(() => {
        const hours = Math.floor(remainingSeconds / 3600);
        const minutes = Math.floor((remainingSeconds % 3600) / 60);
        const seconds = remainingSeconds % 60;

        timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (remainingSeconds <= 0) {
            clearInterval(timerInterval);

            // Play sound
            const audio = new Audio('path/to/alarm-sound.mp3'); // Replace with actual path
            audio.play();

            // Change notification style
            notification.style.backgroundColor = '#e74c3c';
            timerDisplay.textContent = timerType === 'countdown' ? 'Hết giờ!' : 'Báo Thức!';

            // Auto-remove after 5 seconds
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => {
                    notificationContainer.removeChild(notification);
                }, 300);
            }, 5000);
        }

        remainingSeconds--;
    }, 1000);

    // Close button functionality
    closeNotification.addEventListener('click', () => {
        clearInterval(timerInterval);
        notification.style.opacity = '0';
        setTimeout(() => {
            notificationContainer.removeChild(notification);
        }, 300);
    });
}