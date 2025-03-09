document.addEventListener('DOMContentLoaded', () => {
    const timerManager = new TimerManager();

    // Thêm sự kiện lắng nghe phím "Enter"
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                const form = backdrop.querySelector('form');
                if (form) {
                    e.preventDefault(); // Ngăn chặn hành vi mặc định của form
                    handleTimerSubmit(form);
                }
            }
        }
    });

    // Thêm sự kiện lắng nghe cho nút "Time Button"
    const timeButton = document.getElementById('time-button'); // Giả sử nút "Time Button" có id là 'time-button'
    if (timeButton) {
        timeButton.addEventListener('click', () => {
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
        });
    }
});

/* ========== MODAL MANAGEMENT ========== */
function showTimerModal() {
    const { backdrop, modal } = createTimerModalElements();
    document.body.appendChild(backdrop);

    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) backdrop.remove();
    });
}

function createTimerModalElements() {
    const backdrop = document.createElement('div');
    backdrop.classList.add('modal-backdrop');

    const modal = document.createElement('div');
    modal.classList.add('timer-modal');

    // Tiêu đề
    const title = document.createElement('h2');
    title.classList.add('timer-modal-title');
    title.textContent = 'Hẹn Giờ / Đếm Ngược';
    modal.appendChild(title);

    // Form
    const form = createTimerForm();
    modal.appendChild(form);

    // Nút đóng
    const closeButton = createCloseButton(() => backdrop.remove());
    modal.appendChild(closeButton);

    backdrop.appendChild(modal);
    return { backdrop, modal };
}

/* ========== FORM COMPONENTS ========== */
function createTimerForm() {
    const form = document.createElement('form');
    form.classList.add('timer-form');

    // Dropdown loại hẹn giờ
    const timerTypeSelect = createTimerTypeSelect();
    form.appendChild(createFormField('Loại Hẹn Giờ:  ', timerTypeSelect));

    // Tạo container cho preset (ẩn ban đầu nếu là báo thức)
    const quickPresetsContainer = createQuickPresets();
    quickPresetsContainer.style.display = timerTypeSelect.value === 'timer' ? 'none' : 'flex';
    form.appendChild(quickPresetsContainer);
    
    // Thêm event listener để ẩn/hiện preset container khi chuyển chế độ
    timerTypeSelect.addEventListener('change', (e) => {
        quickPresetsContainer.style.display = e.target.value === 'timer' ? 'none' : 'flex';
    });

    // Input thời gian
    const timeInputs = createTimeInputs();
    form.appendChild(timeInputs);

    // Ghi chú
    const noteInput = document.createElement('input');
    noteInput.type = 'text';
    noteInput.placeholder = 'Nhập ghi chú';
    noteInput.classList.add('timer-input');
    form.appendChild(createFormField('Ghi Chú (Tuỳ Chọn):  ', noteInput));

    // Nút submit
    const submitButton = document.createElement('button');
    submitButton.classList.add('timer-button');
    submitButton.textContent = 'Bắt Đầu';
    
    submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        handleTimerSubmit(form);
    });

    // Thêm sự kiện submit cho form
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleTimerSubmit(form);
    });

    form.appendChild(submitButton);
    return form;
}


function createTimerTypeSelect() {
    const select = document.createElement('select');
    select.classList.add('timer-input');
    
    [   { value: 'timer', label: 'Báo Thức' },
        { value: 'countdown', label: 'Đếm Ngược' }
    ].forEach(type => {
        const option = document.createElement('option');
        option.value = type.value;
        option.textContent = type.label;
        select.appendChild(option);
    });
    
    return select;
}

function createQuickPresets() {
    const container = document.createElement('div');
    container.classList.add('preset-container');
    
    [
        { label: '5 phút', minutes: 5 },
        { label: '10 phút', minutes: 10 },
        { label: '15 phút', minutes: 15 },
        { label: '30 phút', minutes: 30 },
        { label: '1 giờ', hours: 1 }
    ].forEach(preset => {
        const button = document.createElement('button');
        button.type = 'button';
        button.classList.add('preset-button');
        button.textContent = preset.label;
        
        button.addEventListener('click', () => {
            const form = button.closest('form');
            const inputs = {
                hours: form.querySelector('input[placeholder="Giờ"]'),
                minutes: form.querySelector('input[placeholder="Phút"]'),
                seconds: form.querySelector('input[placeholder="Giây"]')
            };
            
            if (inputs.hours && inputs.minutes && inputs.seconds) {
                inputs.hours.value = preset.hours || 0;
                inputs.minutes.value = preset.minutes || 0;
                inputs.seconds.value = 0;
            }
        });
        
        container.appendChild(button);
    });
    
    return container;
}

/* ========== TIME INPUTS ========== */
function createTimeInputs() {
    const container = document.createElement('div');
    container.classList.add('time-inputs-container');

    const createInput = (placeholder, min, max) => {
        const input = document.createElement('input');
        input.type = 'number';
        input.min = min;
        input.max = max;
        input.value = '0';
        input.placeholder = placeholder;
        input.classList.add('timer-input');
        return input;
    };

    container.appendChild(createFormField('Giờ', createInput('Giờ', 0, 23)));
    container.appendChild(createFormField('Phút', createInput('Phút', 0, 59)));
    container.appendChild(createFormField('Giây', createInput('Giây', 0, 59)));
    
    return container;
}

/* ========== HELPER FUNCTIONS ========== */
function createFormField(labelText, inputElement) {
    const container = document.createElement('div');
    const label = document.createElement('label');
    label.textContent = labelText;
    container.appendChild(label);
    container.appendChild(inputElement);
    return container;
}

function createCloseButton(closeCallback) {
    const button = document.createElement('button');
    button.classList.add('close-button');
    button.textContent = '✕';
    button.addEventListener('click', closeCallback);
    return button;
}

/* ========== TIMER NOTIFICATIONS ========== */
function createTimerNotification(timerType, note) {
    if (timerType === 'timer') {
        return createAlarmNotification(note);
    }

    const notification = document.createElement('div');
    notification.classList.add('timer-notification');

    // Hiển thị thời gian
    const timerDisplay = document.createElement('div');
    timerDisplay.classList.add('timer-display');
    notification.appendChild(timerDisplay);

    // Ghi chú
    if (note) {
        const noteElement = document.createElement('div');
        noteElement.classList.add('timer-note');
        noteElement.textContent = note;
        notification.appendChild(noteElement);
    }

    // Container cho các nút
    const buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('notification-buttons');

    // Nút điều khiển
    const pauseButton = document.createElement('button');
    pauseButton.classList.add('notification-button');
    pauseButton.textContent = '⏸️';
    buttonsContainer.appendChild(pauseButton);

    // Nút đóng
    const closeButton = document.createElement('button');
    closeButton.classList.add('notification-button');
    closeButton.textContent = '✕';
    buttonsContainer.appendChild(closeButton);

    notification.appendChild(buttonsContainer);

    return notification;
}

function createAlarmNotification(note) {
    const notification = document.createElement('div');
    notification.classList.add('alarm-notification');

    // Container cho thông tin báo thức
    const alarmInfo = document.createElement('div');
    alarmInfo.classList.add('alarm-info');

    // Thời gian báo thức
    const alarmTime = document.createElement('div');
    alarmTime.classList.add('alarm-time');
    alarmInfo.appendChild(alarmTime);

    // Thời gian đếm ngược
    const countdown = document.createElement('div');
    countdown.classList.add('alarm-countdown');
    alarmInfo.appendChild(countdown);

    // Ghi chú (nếu có)
    if (note) {
        const noteElement = document.createElement('div');
        noteElement.classList.add('timer-note');
        noteElement.textContent = note;
        alarmInfo.appendChild(noteElement);
    }

    notification.appendChild(alarmInfo);

    // Container cho các nút
    const buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('notification-buttons');

    // Nút đóng
    const closeButton = document.createElement('button');
    closeButton.classList.add('notification-button');
    closeButton.textContent = '✕';
    buttonsContainer.appendChild(closeButton);

    notification.appendChild(buttonsContainer);

    return notification;
}

/* ========== TIMER LOGIC ========== */
function handleTimerSubmit(form) {
    const getValue = selector => parseInt(form.querySelector(selector)?.value || 0);
    const timerType = form.querySelector('select').value;
    const note = form.querySelector('[placeholder="Nhập ghi chú"]').value.trim();
    
    // Kiểm tra dữ liệu đầu vào
    const hours = getValue('[placeholder="Giờ"]');
    const minutes = getValue('[placeholder="Phút"]');
    const seconds = getValue('[placeholder="Giây"]');
    
    // Kiểm tra thời gian trống cho báo thức
    if (timerType === 'timer' && hours === 0 && minutes === 0 && seconds === 0) {
        showTimerError('Vui lòng nhập thời gian báo thức');
        highlightEmptyInputs(form, ['[placeholder="Giờ"]', '[placeholder="Phút"]', '[placeholder="Giây"]']);
        return;
    }
    
    // Kiểm tra thời gian trống cho đếm ngược
    if (timerType === 'countdown' && hours === 0 && minutes === 0 && seconds === 0) {
        showTimerError('Vui lòng nhập thời gian đếm ngược');
        highlightEmptyInputs(form, ['[placeholder="Giờ"]', '[placeholder="Phút"]', '[placeholder="Giây"]']);
        return;
    }

    if (timerType === 'timer') { // Báo thức
        // Tạo thời điểm báo thức cho ngày hiện tại
        const now = new Date();
        const alarmTime = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            hours,
            minutes,
            seconds
        );
        
        // Nếu thời gian đã qua, đặt cho ngày mai
        if (alarmTime <= now) {
            alarmTime.setDate(alarmTime.getDate() + 1);
        }
        
        const millisTillAlarm = alarmTime.getTime() - now.getTime();
        const secondsTillAlarm = Math.floor(millisTillAlarm / 1000);
        
        startTimer(secondsTillAlarm, timerType, note, alarmTime);
        form.closest('.modal-backdrop')?.remove();
        
    } else { // Đếm ngược
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        
        if (totalSeconds > 0) {
            startTimer(totalSeconds, timerType, note);
            form.closest('.modal-backdrop')?.remove();
        }
    }
}

function startTimer(totalSeconds, timerType, note, alarmTime = null) {
    const notificationContainer = document.getElementById('timer-notifications-sidebar');
    if (!notificationContainer) return;

    const notification = createTimerNotification(timerType, note);
    notificationContainer.appendChild(notification);
    
    setTimeout(() => notification.style.opacity = '1', 10);
    initializeTimerLogic(notification, totalSeconds, timerType, alarmTime);
}

function initializeTimerLogic(notification, totalSeconds, timerType, alarmTime) {
    let remainingSeconds = totalSeconds;
    let isPaused = false;
    const isAlarm = timerType === 'timer';
    const timerDisplay = isAlarm ? notification.querySelector('.alarm-time') : notification.querySelector('.timer-display');
    const countdownDisplay = isAlarm ? notification.querySelector('.alarm-countdown') : null;
    const pauseButton = isAlarm ? null : notification.querySelector('.notification-button');
    const closeButton = isAlarm ? notification.querySelector('.notification-button') : notification.querySelectorAll('.notification-button')[1];

    const updateDisplay = () => {
        if (timerType === 'timer') {
            // Hiển thị thời gian báo thức
            const hours = alarmTime.getHours();
            const minutes = alarmTime.getMinutes();
            const seconds = alarmTime.getSeconds();
            timerDisplay.textContent = 
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            
            // Cập nhật thời gian đếm ngược
            const hours_left = Math.floor(remainingSeconds / 3600);
            const minutes_left = Math.floor((remainingSeconds % 3600) / 60);
            const seconds_left = remainingSeconds % 60;
            countdownDisplay.textContent = 
                ` / ${hours_left}:${minutes_left}:${seconds_left}`;
        } else {
            // Hiển thị thời gian đếm ngược
            const hours = Math.floor(remainingSeconds / 3600);
            const minutes = Math.floor((remainingSeconds % 3600) / 60);
            const seconds = remainingSeconds % 60;
            timerDisplay.textContent = 
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    };

    const timerInterval = setInterval(() => {
        if (!isPaused && remainingSeconds-- <= 0) {
            clearInterval(timerInterval);
            handleTimerCompletion(notification, timerDisplay, pauseButton, timerType);
        }
        updateDisplay();
    }, 1000);

    if (pauseButton) {
        pauseButton.addEventListener('click', () => {
            isPaused = !isPaused;
            pauseButton.textContent = isPaused ? '▶️' : '⏸️';
            notification.classList.toggle('timer-paused', isPaused);
        });
    }

    closeButton.addEventListener('click', () => {
        clearInterval(timerInterval);
        notification.classList.add('removing');
        setTimeout(() => notification.remove(), 300);
    });

    // Hiển thị thời gian ban đầu
    updateDisplay();
}

function handleTimerCompletion(notification, timerDisplay, pauseButton, timerType) {
    notification.classList.add('timer-expired');
    timerDisplay.textContent = timerType === 'countdown' ? 'Hết giờ!' : 'Đã đến giờ!';
    if (pauseButton) pauseButton.remove();

    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    
    setTimeout(() => {
        notification.classList.add('removing');
        setTimeout(() => notification.remove(), 300);
    }, 10000);
}

/* ========== TIMER MANAGER ========== */
class TimerManager {
    constructor() {
        this.timers = new Map();
        this.loadTimers();
    }

    loadTimers() {
        const savedTimers = JSON.parse(localStorage.getItem('activeTimers') || '{}');
        Object.entries(savedTimers).forEach(([id, data]) => {
            const elapsed = (Date.now() - data.timestamp) / 1000;
            const remaining = data.duration - elapsed;
            remaining > 0 ? this.startTimer(remaining, data.type, data.note, id) 
                          : this.removeTimer(id);
        });
    }

    saveTimer(id, data) {
        const saved = JSON.parse(localStorage.getItem('activeTimers') || '{}');
        saved[id] = {...data, timestamp: Date.now()};
        localStorage.setItem('activeTimers', JSON.stringify(saved));
    }

    removeTimer(id) {
        this.timers.delete(id);
        const saved = JSON.parse(localStorage.getItem('activeTimers') || '{}');
        delete saved[id];
        localStorage.setItem('activeTimers', JSON.stringify(saved));
    }

    startTimer(duration, type, note, id = Date.now().toString()) {
        const timer = {
            interval: setInterval(() => {/* Logic đếm ngược */}, 1000),
            data: { duration, type, note }
        };
        this.timers.set(id, timer);
        this.saveTimer(id, timer.data);
        return id;
    }
}

/* ========== ACTIVE TIMERS DISPLAY ========== */
function displayActiveTimers(modal) {
    const activeTimersContainer = document.createElement('div');
    activeTimersContainer.classList.add('active-timers');
    
    // Get active timers from TimerManager
    const activeTimers = Array.from(window.timerManager?.timers || []);
    
    if (activeTimers.length === 0) {
        const noTimersMessage = document.createElement('p');
        noTimersMessage.textContent = 'Không có hẹn giờ đang chạy';
        noTimersMessage.classList.add('no-timers-message');
        activeTimersContainer.appendChild(noTimersMessage);
    } else {
        activeTimers.forEach(([id, timer]) => {
            const timerElement = document.createElement('div');
            timerElement.classList.add('active-timer-item');
            timerElement.textContent = `${timer.data.note || 'Hẹn giờ'} - ${formatTime(timer.data.duration)}`;
            activeTimersContainer.appendChild(timerElement);
        });
    }
    
    // Insert active timers container after the title
    const title = modal.querySelector('.timer-modal-title');
    title.insertAdjacentElement('afterend', activeTimersContainer);
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

/**
 * Hiển thị thông báo lỗi trong modal timer
 * @param {string} message - Nội dung thông báo lỗi
 */
function showTimerError(message) {
    // Tìm hoặc tạo container thông báo lỗi
    let errorContainer = document.querySelector('.timer-error');
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.className = 'timer-error';
        const form = document.querySelector('.timer-form');
        form.insertBefore(errorContainer, form.firstChild);
    }

    // Hiển thị thông báo
    errorContainer.textContent = message;
    errorContainer.style.opacity = '1';

    // Tự động ẩn sau 3 giây
    setTimeout(() => {
        errorContainer.style.opacity = '0';
        setTimeout(() => errorContainer.remove(), 300);
    }, 3000);
}

/**
 * Highlight các input trống
 * @param {HTMLFormElement} form - Form chứa các input
 * @param {Array<string>} selectors - Mảng các selector của input cần highlight
 */
function highlightEmptyInputs(form, selectors) {
    selectors.forEach(selector => {
        const input = form.querySelector(selector);
        if (input) {
            input.classList.add('timer-input-error');
            // Xóa highlight sau 3 giây
            setTimeout(() => input.classList.remove('timer-input-error'), 3000);
        }
    });
}
