/* ========== INITIALIZATION ========== */
/**
 * Initialize the timer functionality when the DOM is loaded
 * Sets up event listeners for the time button and manages timer-related operations
 */
document.addEventListener('DOMContentLoaded', () => {
    const timerManager = new TimerManager();

    // Add click event listener for the "Time Button"
    const timeButton = document.getElementById('time-button');
    if (timeButton) {
        timeButton.addEventListener('click', () => {
            // Remove any existing modal backdrop
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
        });
    }
});

/* ========== TIMER MANAGER CLASS ========== */
/**
 * Manages all active timers, handles saving/loading from localStorage
 */
class TimerManager {
    constructor() {
        this.timers = new Map(); // Store active timers in memory
        this.loadTimers(); // Load saved timers on initialization
    }

    /**
     * Load saved timers from localStorage and restart them if still valid
     * Removes expired timers
     */
    loadTimers() {
        const savedTimers = JSON.parse(localStorage.getItem('activeTimers') || '{}');
        Object.entries(savedTimers).forEach(([id, data]) => {
            // Calculate remaining time
            const elapsed = (Date.now() - data.timestamp) / 1000;
            const remaining = data.duration - elapsed;
            
            // Start timer if time remains, otherwise remove it
            remaining > 0 ? this.startTimer(remaining, data.type, data.note, id) 
                        : this.removeTimer(id);
        });
    }

    /**
     * Save timer data to localStorage with current timestamp
     * @param {string} id - Timer unique identifier
     * @param {Object} data - Timer data including duration, type and note
     */
    saveTimer(id, data) {
        const saved = JSON.parse(localStorage.getItem('activeTimers') || '{}');
        saved[id] = {...data, timestamp: Date.now()};
        localStorage.setItem('activeTimers', JSON.stringify(saved));
    }

    /**
     * Remove a timer from both memory and localStorage
     * @param {string} id - Timer ID to remove
     */
    removeTimer(id) {
        this.timers.delete(id);
        const saved = JSON.parse(localStorage.getItem('activeTimers') || '{}');
        delete saved[id];
        localStorage.setItem('activeTimers', JSON.stringify(saved));
    }

    /**
     * Start a new timer with given parameters
     * @param {number} duration - Timer duration in seconds
     * @param {string} type - Timer type ('timer' or 'countdown')
     * @param {string} note - Optional timer note
     * @param {string} id - Optional timer ID, defaults to current timestamp
     * @returns {string} Timer ID
     */
    startTimer(duration, type, note, id = Date.now().toString()) {
        const timer = {
            interval: setInterval(() => {/* Countdown logic */}, 1000),
            data: { duration, type, note }
        };
        this.timers.set(id, timer);
        this.saveTimer(id, timer.data);
        return id;
    }
}

/* ========== MODAL CREATION AND DISPLAY ========== */
/**
 * Display the timer modal with backdrop
 * Creates modal elements and handles backdrop click to close
 */
export function showTimerModal() {
    const { backdrop, modal } = createTimerModalElements();
    document.body.appendChild(backdrop);

    // Close modal when clicking backdrop
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) backdrop.remove();
    });
}

/**
 * Create the timer modal elements including title, form and close button
 * @returns {Object} Object containing backdrop and modal elements
 */
function createTimerModalElements() {
    // Create backdrop and modal containers
    const backdrop = document.createElement('div');
    backdrop.classList.add('modal-backdrop');

    const modal = document.createElement('div');
    modal.classList.add('timer-modal');

    // Add modal title
    const title = document.createElement('h2');
    title.classList.add('timer-modal-title');
    title.textContent = 'Hẹn Giờ / Đếm Ngược';
    modal.appendChild(title);

    // Add timer form
    const form = createTimerForm();
    modal.appendChild(form);

    // Add close button
    const closeButton = createCloseButton(() => backdrop.remove());
    modal.appendChild(closeButton);

    backdrop.appendChild(modal);
    return { backdrop, modal };
}

/* ========== FORM CREATION AND COMPONENTS ========== */
/**
 * Create the main timer form with all input fields and handlers
 * @returns {HTMLFormElement} The complete timer form
 */
function createTimerForm() {
    const form = document.createElement('form');
    form.classList.add('timer-form');

    // Add timer type selection
    const timerTypeSelect = createTimerTypeSelect();
    form.appendChild(createFormField('Loại Hẹn Giờ:  ', timerTypeSelect));

    // Add quick presets for countdown mode
    const quickPresetsContainer = createQuickPresets();
    quickPresetsContainer.style.display = timerTypeSelect.value === 'timer' ? 'none' : 'flex';
    form.appendChild(quickPresetsContainer);
    
    // Toggle presets visibility based on timer type
    timerTypeSelect.addEventListener('change', (e) => {
        quickPresetsContainer.style.display = e.target.value === 'timer' ? 'none' : 'flex';
    });

    // Add time input fields
    const timeInputs = createTimeInputs();
    form.appendChild(timeInputs);

    // Add note input field
    const noteInput = document.createElement('input');
    noteInput.type = 'text';
    noteInput.placeholder = 'Nhập ghi chú';
    noteInput.classList.add('timer-input');
    form.appendChild(createFormField('Ghi Chú (Tuỳ Chọn):  ', noteInput));

    // Add submit button with handlers
    const submitButton = document.createElement('button');
    submitButton.classList.add('timer-button');
    submitButton.textContent = 'Bắt Đầu';
    
    // Handle form submission through button click
    submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        handleTimerSubmit(form);
    });

    // Handle form submission through form submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleTimerSubmit(form);
    });

    // Handle form submission through Enter key
    form.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleTimerSubmit(form);
        }
    });

    form.appendChild(submitButton);
    return form;
}

/**
 * Create timer type select dropdown with options
 * @returns {HTMLSelectElement} Timer type select element
 */
function createTimerTypeSelect() {
    const select = document.createElement('select');
    select.classList.add('timer-input');
    
    // Add timer type options
    [   
        { value: 'timer', label: 'Báo Thức' },
        { value: 'countdown', label: 'Đếm Ngược' }
    ].forEach(type => {
        const option = document.createElement('option');
        option.value = type.value;
        option.textContent = type.label;
        select.appendChild(option);
    });
    
    return select;
}

/**
 * Create quick preset buttons for countdown mode
 * @returns {HTMLDivElement} Container with preset buttons
 */
function createQuickPresets() {
    const container = document.createElement('div');
    container.classList.add('preset-container');
    
    // Define preset options
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
        
        // Set time inputs when preset is clicked
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

/**
 * Create time input fields for hours, minutes, and seconds
 * @returns {HTMLDivElement} Container with time input fields
 */
function createTimeInputs() {
    const container = document.createElement('div');
    container.classList.add('time-inputs-container');

    // Helper function to create number input
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

    // Add hour, minute, second inputs
    container.appendChild(createFormField('Giờ', createInput('Giờ', 0, 23)));
    container.appendChild(createFormField('Phút', createInput('Phút', 0, 59)));
    container.appendChild(createFormField('Giây', createInput('Giây', 0, 59)));
    
    return container;
}

/* ========== NOTIFICATION COMPONENTS ========== */
/**
 * Create timer notification element based on type
 * @param {string} timerType - Type of timer ('timer' or 'countdown')
 * @param {string} note - Optional note for the timer
 * @returns {HTMLDivElement} Timer notification element
 */
function createTimerNotification(timerType, note) {
    return timerType === 'timer' ? createAlarmNotification(note) : createCountdownNotification(note);
}

/**
 * Create countdown notification element
 * @param {string} note - Optional note for the countdown
 * @returns {HTMLDivElement} Countdown notification element
 */
function createCountdownNotification(note) {
    const notification = document.createElement('div');
    notification.classList.add('timer-notification');

    // Add timer display
    const timerDisplay = document.createElement('div');
    timerDisplay.classList.add('timer-display');
    notification.appendChild(timerDisplay);

    // Add note if provided
    if (note) {
        const noteElement = document.createElement('div');
        noteElement.classList.add('timer-note');
        noteElement.textContent = note;
        notification.appendChild(noteElement);
    }

    // Add control buttons
    const buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('notification-buttons');

    const pauseButton = document.createElement('button');
    pauseButton.classList.add('notification-button');
    pauseButton.textContent = '⏸️';
    buttonsContainer.appendChild(pauseButton);

    const closeButton = document.createElement('button');
    closeButton.classList.add('notification-button');
    closeButton.textContent = '✕';
    buttonsContainer.appendChild(closeButton);

    notification.appendChild(buttonsContainer);

    return notification;
}

/**
 * Create alarm notification element
 * @param {string} note - Optional note for the alarm
 * @returns {HTMLDivElement} Alarm notification element
 */
function createAlarmNotification(note) {
    const notification = document.createElement('div');
    notification.classList.add('alarm-notification');

    // Create alarm info container
    const alarmInfo = document.createElement('div');
    alarmInfo.classList.add('alarm-info');

    // Add time display
    const timeContainer = document.createElement('div');
    timeContainer.classList.add('alarm-time-container');

    const alarmTime = document.createElement('div');
    alarmTime.classList.add('alarm-time');
    timeContainer.appendChild(alarmTime);

    const countdown = document.createElement('div');
    countdown.classList.add('alarm-countdown');
    timeContainer.appendChild(countdown);

    alarmInfo.appendChild(timeContainer);

    // Add note if provided
    if (note) {
        const noteElement = document.createElement('div');
        noteElement.classList.add('timer-note');
        noteElement.textContent = note;
        alarmInfo.appendChild(noteElement);
    }

    notification.appendChild(alarmInfo);

    // Add close button
    const buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('notification-buttons');

    const closeButton = document.createElement('button');
    closeButton.classList.add('notification-button');
    closeButton.textContent = '✕';
    buttonsContainer.appendChild(closeButton);

    notification.appendChild(buttonsContainer);

    return notification;
}

/* ========== TIMER LOGIC ========== */
/**
 * Handle timer form submission
 * Validates input and starts appropriate timer
 * @param {HTMLFormElement} form - Timer form element
 */
function handleTimerSubmit(form) {
    if (!form) return;

    const timerTypeSelect = form.querySelector('select');
    if (!timerTypeSelect) return;

    // Helper function to get input values
    const getValue = selector => {
        const input = form.querySelector(selector);
        return input ? parseInt(input.value || 0) : 0;
    };

    const timerType = timerTypeSelect.value;
    const noteInput = form.querySelector('[placeholder="Nhập ghi chú"]');
    const note = noteInput ? noteInput.value.trim() : '';
    
    // Get time input values
    const hours = getValue('[placeholder="Giờ"]');
    const minutes = getValue('[placeholder="Phút"]');
    const seconds = getValue('[placeholder="Giây"]');
    
    // Validate inputs
    if (hours === 0 && minutes === 0 && seconds === 0) {
        const errorMessage = timerType === 'timer' ? 
            'Vui lòng nhập thời gian báo thức' : 
            'Vui lòng nhập thời gian đếm ngược';
        
        showTimerError(errorMessage);
        highlightEmptyInputs(form, [
            '[placeholder="Giờ"]',
            '[placeholder="Phút"]',
            '[placeholder="Giây"]'
        ]);
        return;
    }

    if (timerType === 'timer') {
        handleAlarmSubmit(hours, minutes, seconds, note, form);
    } else {
        handleCountdownSubmit(hours, minutes, seconds, note, form);
    }
}

/**
 * Handle alarm timer submission
 * @param {number} hours - Hours value
 * @param {number} minutes - Minutes value
 * @param {number} seconds - Seconds value
 * @param {string} note - Optional note
 * @param {HTMLFormElement} form - Timer form
 */
function handleAlarmSubmit(hours, minutes, seconds, note, form) {
    // Create alarm time for current day
    const now = new Date();
    const alarmTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes,
        seconds
    );
    
    // If time has passed, set for next day
    if (alarmTime <= now) {
        alarmTime.setDate(alarmTime.getDate() + 1);
    }
    
    const millisTillAlarm = alarmTime.getTime() - now.getTime();
    const secondsTillAlarm = Math.floor(millisTillAlarm / 1000);
    
    startTimer(secondsTillAlarm, 'timer', note, alarmTime);
    form.closest('.modal-backdrop')?.remove();
}

/**
 * Handle countdown timer submission
 * @param {number} hours - Hours value
 * @param {number} minutes - Minutes value
 * @param {number} seconds - Seconds value
 * @param {string} note - Optional note
 * @param {HTMLFormElement} form - Timer form
 */
function handleCountdownSubmit(hours, minutes, seconds, note, form) {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    
    if (totalSeconds > 0) {
        startTimer(totalSeconds, 'countdown', note);
        form.closest('.modal-backdrop')?.remove();
    }
}

/**
 * Start a new timer
 * Creates notification and initializes timer logic
 * @param {number} totalSeconds - Timer duration in seconds
 * @param {string} timerType - Type of timer
 * @param {string} note - Optional timer note
 * @param {Date} alarmTime - Alarm time for timer type
 */
function startTimer(totalSeconds, timerType, note, alarmTime = null) {
    const notificationContainer = document.getElementById('timer-notifications-sidebar');
    if (!notificationContainer) return;

    const notification = createTimerNotification(timerType, note);
    notificationContainer.appendChild(notification);
    
    // Fade in notification
    setTimeout(() => notification.style.opacity = '1', 10);
    initializeTimerLogic(notification, totalSeconds, timerType, alarmTime);
}

/**
 * Initialize timer countdown logic
 * @param {HTMLElement} notification - Timer notification element
 * @param {number} totalSeconds - Timer duration in seconds
 * @param {string} timerType - Type of timer
 * @param {Date} alarmTime - Alarm time for timer type
 */
function initializeTimerLogic(notification, totalSeconds, timerType, alarmTime) {
    let remainingSeconds = totalSeconds;
    let isPaused = false;
    let isCompleted = false;
    const isAlarm = timerType === 'timer';
    
    // Get display elements
    const timerDisplay = isAlarm ? 
        notification.querySelector('.alarm-time') : 
        notification.querySelector('.timer-display');
    const countdownDisplay = isAlarm ? 
        notification.querySelector('.alarm-countdown') : 
        null;
    const pauseButton = isAlarm ? 
        null : 
        notification.querySelector('.notification-button');
    const closeButton = isAlarm ? 
        notification.querySelector('.notification-button') : 
        notification.querySelectorAll('.notification-button')[1];

    // Update timer display
    const updateDisplay = () => {
        if (isCompleted) return;

        if (isAlarm) {
            updateAlarmDisplay(alarmTime, remainingSeconds, timerDisplay, countdownDisplay);
        } else {
            updateCountdownDisplay(remainingSeconds, timerDisplay);
        }
    };

    // Start timer interval
    const timerInterval = setInterval(() => {
        if (!isPaused) {
            if (remainingSeconds <= 0) {
                clearInterval(timerInterval);
                isCompleted = true;
                handleTimerCompletion(notification, timerDisplay, pauseButton, timerType);
            } else {
                remainingSeconds--;
                updateDisplay();
            }
        }
    }, 1000);

    // Add pause button functionality
    if (pauseButton) {
        pauseButton.addEventListener('click', () => {
            isPaused = !isPaused;
            pauseButton.textContent = isPaused ? '▶️' : '⏸️';
            notification.classList.toggle('timer-paused', isPaused);
        });
    }

    // Add close button functionality
    closeButton.addEventListener('click', () => {
        clearInterval(timerInterval);
        notification.classList.add('removing');
        setTimeout(() => notification.remove(), 300);
    });

    updateDisplay();
}

/**
 * Update alarm display with current time and countdown
 * @param {Date} alarmTime - Target alarm time
 * @param {number} remainingSeconds - Seconds remaining
 * @param {HTMLElement} timerDisplay - Timer display element
 * @param {HTMLElement} countdownDisplay - Countdown display element
 */
function updateAlarmDisplay(alarmTime, remainingSeconds, timerDisplay, countdownDisplay) {
    // Display alarm time
    const hours = alarmTime.getHours();
    const minutes = alarmTime.getMinutes();
    const seconds = alarmTime.getSeconds();
    timerDisplay.textContent = formatTime(hours, minutes, seconds);
    
    // Update countdown if time remaining
    if (remainingSeconds > 0) {
        const hours_left = Math.floor(remainingSeconds / 3600);
        const minutes_left = Math.floor((remainingSeconds % 3600) / 60);
        const seconds_left = remainingSeconds % 60;
        countdownDisplay.textContent = ` / ${formatTime(hours_left, minutes_left, seconds_left)}`;
    }
}

/**
 * Update countdown display with remaining time
 * @param {number} remainingSeconds - Seconds remaining
 * @param {HTMLElement} timerDisplay - Timer display element
 */
function updateCountdownDisplay(remainingSeconds, timerDisplay) {
    if (remainingSeconds >= 0) {
        const hours = Math.floor(remainingSeconds / 3600);
        const minutes = Math.floor((remainingSeconds % 3600) / 60);
        const seconds = remainingSeconds % 60;
        timerDisplay.textContent = formatTime(hours, minutes, seconds);
    }
}

/**
 * Format time values as HH:MM:SS
 * @param {number} hours - Hours value
 * @param {number} minutes - Minutes value
 * @param {number} seconds - Seconds value
 * @returns {string} Formatted time string
 */
function formatTime(hours, minutes, seconds) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Handle timer completion
 * Shows completion message and handles cleanup
 * @param {HTMLElement} notification - Timer notification element
 * @param {HTMLElement} timerDisplay - Timer display element
 * @param {HTMLElement} pauseButton - Pause button element
 * @param {string} timerType - Type of timer
 */
function handleTimerCompletion(notification, timerDisplay, pauseButton, timerType) {
    notification.classList.add('timer-expired');
    
    // Show completion message
    if (timerType === 'timer') {
        timerDisplay.textContent = 'Đã đến giờ hẹn!';
        if (notification.querySelector('.alarm-countdown')) {
            notification.querySelector('.alarm-countdown').textContent = '';
        }
    } else {
        timerDisplay.textContent = 'Hết giờ!';
    }

    // Remove pause button if exists
    if (pauseButton) pauseButton.remove();

    // Vibrate device if supported
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    
    // Remove notification after delay
    setTimeout(() => {
        notification.classList.add('removing');
        setTimeout(() => notification.remove(), 300);
    }, 10000);
}

/* ========== HELPER FUNCTIONS ========== */
/**
 * Create a form field with label and input
 * @param {string} labelText - Label text
 * @param {HTMLElement} inputElement - Input element
 * @returns {HTMLDivElement} Form field container
 */
function createFormField(labelText, inputElement) {
    const container = document.createElement('div');
    const label = document.createElement('label');
    label.textContent = labelText;
    container.appendChild(label);
    container.appendChild(inputElement);
    return container;
}

/**
 * Create a close button
 * @param {Function} closeCallback - Callback function for close action
 * @returns {HTMLButtonElement} Close button element
 */
function createCloseButton(closeCallback) {
    const button = document.createElement('button');
    button.classList.add('close-button');
    button.textContent = '✕';
    button.addEventListener('click', closeCallback);
    return button;
}

/**
 * Show error message in timer modal
 * @param {string} message - Error message to display
 */
function showTimerError(message) {
    // Find or create error container
    let errorContainer = document.querySelector('.timer-error');
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.className = 'timer-error';
        const form = document.querySelector('.timer-form');
        form.insertBefore(errorContainer, form.firstChild);
    }

    // Show error message
    errorContainer.textContent = message;
    errorContainer.style.opacity = '1';

    // Auto-hide after delay
    setTimeout(() => {
        errorContainer.style.opacity = '0';
        setTimeout(() => errorContainer.remove(), 300);
    }, 3000);
}

/**
 * Highlight empty input fields
 * @param {HTMLFormElement} form - Form containing inputs
 * @param {Array<string>} selectors - Array of input selectors to highlight
 */
function highlightEmptyInputs(form, selectors) {
    selectors.forEach(selector => {
        const input = form.querySelector(selector);
        if (input) {
            input.classList.add('timer-input-error');
            // Remove highlight after delay
            setTimeout(() => input.classList.remove('timer-input-error'), 3000);
        }
    });
}
