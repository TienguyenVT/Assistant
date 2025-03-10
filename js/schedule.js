class ScheduleManager {
    constructor() {
        this.schedule = this.loadSchedule();
        this.days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
        this.hours = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0'));
        this.minutes = ['00', '15', '30', '45'];
        this.currentUser = null;
        this.checkAuthStatus();
    }

    createScheduleModal() {
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';

        const modal = document.createElement('div');
        modal.className = 'schedule-modal';

        // Header section
        const header = document.createElement('div');
        header.className = 'schedule-header';

        // Nút đóng
        const closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        closeButton.textContent = '✕';
        closeButton.onclick = () => backdrop.remove();
        header.appendChild(closeButton);

        // Tiêu đề
        const title = document.createElement('h2');
        title.textContent = 'Thời Khóa Biểu';
        title.className = 'modal-title';
        header.appendChild(title);

        // Thêm thông tin user nếu đã đăng nhập
        if (this.currentUser) {
            const userInfo = document.createElement('div');
            userInfo.className = 'schedule-user-info';
            userInfo.innerHTML = `
                <span class="user-icon">👤</span>
                <span class="user-name">${this.currentUser.username}</span>
            `;
            header.appendChild(userInfo);
        }

        // Content section
        const content = document.createElement('div');
        content.className = 'schedule-content';

        // Form thêm sự kiện
        const addEventForm = this.createAddEventForm();
        content.appendChild(addEventForm);

        // Bảng thời khóa biểu
        const timetable = this.createTimetable();
        content.appendChild(timetable);

        // Nút điều khiển
        const actions = this.createActionButtons(backdrop);

        // Thêm các phần vào modal
        modal.appendChild(header);
        modal.appendChild(content);
        modal.appendChild(actions);
        backdrop.appendChild(modal);

        document.body.appendChild(backdrop);
    }

    createAddEventForm() {
        const form = document.createElement('div');
        form.className = 'add-event-form';

        // Input tên sự kiện
        const eventInput = document.createElement('input');
        eventInput.type = 'text';
        eventInput.placeholder = 'Tên môn học/sự kiện';
        eventInput.className = 'schedule-input';

        // Select ngày
        const daySelect = document.createElement('select');
        daySelect.className = 'schedule-select';
        this.days.forEach((day, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = day;
            daySelect.appendChild(option);
        });

        // Container cho thời gian bắt đầu
        const startTimeContainer = document.createElement('div');
        startTimeContainer.className = 'time-select-container';
        startTimeContainer.innerHTML = '<span class="time-label">   Bắt đầu:</span>';

        // Select giờ bắt đầu
        const startHourSelect = document.createElement('select');
        startHourSelect.className = 'schedule-select time-select time-select-hour';
        this.hours.forEach(hour => {
            const option = document.createElement('option');
            option.value = hour;
            option.textContent = `${hour}h`;
            startHourSelect.appendChild(option);
        });

        // Select phút bắt đầu
        const startMinuteSelect = document.createElement('select');
        startMinuteSelect.className = 'schedule-select time-select time-select-minute';
        this.minutes.forEach(minute => {
            const option = document.createElement('option');
            option.value = minute;
            option.textContent = `${minute}p`;
            startMinuteSelect.appendChild(option);
        });

        const timeSelectPair = document.createElement('div');
        timeSelectPair.className = 'time-select-pair';
        timeSelectPair.appendChild(startHourSelect);
        timeSelectPair.appendChild(startMinuteSelect);
        startTimeContainer.appendChild(timeSelectPair);

        // Container cho thời gian kết thúc
        const endTimeContainer = document.createElement('div');
        endTimeContainer.className = 'time-select-container';
        endTimeContainer.innerHTML = '<span class="time-label">Kết thúc:</span>';

        // Select giờ kết thúc
        const endHourSelect = document.createElement('select');
        endHourSelect.className = 'schedule-select time-select time-select-hour';
        this.hours.forEach(hour => {
            const option = document.createElement('option');
            option.value = hour;
            option.textContent = `${hour}h`;
            endHourSelect.appendChild(option);
        });

        // Select phút kết thúc
        const endMinuteSelect = document.createElement('select');
        endMinuteSelect.className = 'schedule-select time-select time-select-minute';
        this.minutes.forEach(minute => {
            const option = document.createElement('option');
            option.value = minute;
            option.textContent = `${minute}p`;
            endMinuteSelect.appendChild(option);
        });

        const endTimeSelectPair = document.createElement('div');
        endTimeSelectPair.className = 'time-select-pair';
        endTimeSelectPair.appendChild(endHourSelect);
        endTimeSelectPair.appendChild(endMinuteSelect);
        endTimeContainer.appendChild(endTimeSelectPair);

        // Nút thêm
        const addButton = document.createElement('button');
        addButton.textContent = 'Thêm';
        addButton.className = 'schedule-button save-button';
        addButton.onclick = () => {
            const startTime = `${startHourSelect.value}:${startMinuteSelect.value}`;
            const endTime = `${endHourSelect.value}:${endMinuteSelect.value}`;
            
            if (!this.isValidTimeRange(startTime, endTime)) {
                alert('Thời gian kết thúc phải sau thời gian bắt đầu');
                return;
            }

            this.addEvent(
                eventInput.value,
                parseInt(daySelect.value),
                startTime,
                endTime
            );
        };

        form.appendChild(eventInput);
        form.appendChild(daySelect);
        form.appendChild(startTimeContainer);
        form.appendChild(endTimeContainer);
        form.appendChild(addButton);

        return form;
    }

    isValidTimeRange(startTime, endTime) {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        return endMinutes > startMinutes;
    }

    createTimetable() {
        const table = document.createElement('table');
        table.className = 'timetable';

        // Tạo header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const timeHeader = document.createElement('th');
        timeHeader.textContent = 'Thời gian';
        headerRow.appendChild(timeHeader);

        this.days.forEach(day => {
            const th = document.createElement('th');
            th.textContent = day;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Lọc ra các khung giờ có lịch
        const usedTimeSlots = new Set();
        
        // Kiểm tra tất cả các ngày và thời gian để tìm các slot có sự kiện
        for (let day = 0; day < 7; day++) {
            if (this.schedule[day]) {
                Object.keys(this.schedule[day]).forEach(time => {
                    if (this.schedule[day][time]?.length > 0) {
                        usedTimeSlots.add(time);
                    }
                });
            }
        }

        // Nếu không có sự kiện nào, hiển thị một số khung giờ mặc định
        if (usedTimeSlots.size === 0) {
            ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'].forEach(time => {
                usedTimeSlots.add(time);
            });
        }

        // Sắp xếp các khung giờ theo thứ tự
        const sortedTimeSlots = Array.from(usedTimeSlots).sort();

        // Tạo body
        const tbody = document.createElement('tbody');
        sortedTimeSlots.forEach(time => {
            const row = document.createElement('tr');
            const timeCell = document.createElement('td');
            timeCell.textContent = time;
            row.appendChild(timeCell);

            for (let day = 0; day < 7; day++) {
                const cell = document.createElement('td');
                const events = this.getEventsForTimeSlot(day, time);
                const hasConflict = this.hasTimeConflict(day, time);

                events.forEach(event => {
                    const eventDiv = this.createScheduleItem(event, hasConflict);
                    eventDiv.onclick = () => this.removeEvent(day, time, event);
                    cell.appendChild(eventDiv);
                });
                row.appendChild(cell);
            }
            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        return table;
    }

    createActionButtons(backdrop) {
        const actions = document.createElement('div');
        actions.className = 'schedule-actions';

        // Nút lưu
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Lưu';
        saveButton.className = 'schedule-button save-button';
        saveButton.onclick = () => {
            this.saveSchedule();
            backdrop.remove();
        };

        // Nút xóa tất cả
        const clearButton = document.createElement('button');
        clearButton.textContent = 'Xóa tất cả';
        clearButton.className = 'schedule-button clear-button';
        clearButton.onclick = () => {
            if (confirm('Bạn có chắc muốn xóa toàn bộ thời khóa biểu?')) {
                this.clearSchedule();
                backdrop.remove();
            }
        };

        actions.appendChild(clearButton);
        actions.appendChild(saveButton);

        return actions;
    }

    addEvent(name, day, startTime, endTime) {
        if (!name.trim()) {
            alert('Vui lòng nhập tên môn học/sự kiện');
            return;
        }

        // Kiểm tra xung đột thời gian
        const conflicts = this.getConflictingEvents(day, startTime, endTime);
        
        if (conflicts.length > 0) {
            const conflictMessages = conflicts.map(conflict => conflict.message);
            const warningMessage = `Phát hiện xung đột thời gian:\n\n${conflictMessages.join('\n')}\n\nBạn có muốn thêm sự kiện mới không?`;
            
            if (!confirm(warningMessage)) {
                return;
            }
        }

        const eventData = {
            name: name,
            startTime: startTime,
            endTime: endTime
        };

        if (!this.schedule[day]) {
            this.schedule[day] = {};
        }
        if (!this.schedule[day][startTime]) {
            this.schedule[day][startTime] = [];
        }
        this.schedule[day][startTime].push(eventData);
        this.refreshSchedule();
    }

    removeEvent(day, time, event) {
        if (confirm(`Bạn có chắc muốn xóa "${event.name}"?`)) {
            this.schedule[day][time] = this.schedule[day][time].filter(e => e !== event);
            this.refreshSchedule();
        }
    }

    getEventsForTimeSlot(day, time) {
        return this.schedule[day]?.[time] || [];
    }

    refreshSchedule() {
        const modal = document.querySelector('.schedule-modal');
        if (modal) {
            const oldTable = modal.querySelector('.timetable');
            const newTable = this.createTimetable();
            oldTable.replaceWith(newTable);
        }
    }

    saveSchedule() {
        if (this.currentUser) {
            const scheduleData = {
                userId: this.currentUser.id,
                schedule: this.schedule
            };
            localStorage.setItem(`schedule_${this.currentUser.id}`, JSON.stringify(this.schedule));
            showNotification('Đã lưu thời khóa biểu', 'success');
        } else {
            if (confirm('Bạn cần đăng nhập để lưu thời khóa biểu. Bạn có muốn đăng nhập không?')) {
                showLoginModal();
            } else {
                localStorage.setItem('schedule', JSON.stringify(this.schedule));
                showNotification('Đã lưu thời khóa biểu tạm thời', 'info');
            }
        }
    }

    loadSchedule() {
        if (this.currentUser) {
            const saved = localStorage.getItem(`schedule_${this.currentUser.id}`);
            return saved ? JSON.parse(saved) : {};
        } else {
            const saved = localStorage.getItem('schedule');
            return saved ? JSON.parse(saved) : {};
        }
    }

    clearSchedule() {
        this.schedule = {};
        this.saveSchedule();
        showNotification('Đã xóa toàn bộ thời khóa biểu', 'info');
    }

    // Thêm các phương thức mới để kiểm tra xung đột thời gian
    hasTimeConflict(day, startTime, endTime) {
        // Kiểm tra tham số đầu vào
        if (!day || !startTime || !endTime) return false;
        if (!this.schedule[day]) return false;

        try {
            const newStart = this.timeToMinutes(startTime);
            const newEnd = this.timeToMinutes(endTime);

            // Kiểm tra thời gian hợp lệ
            if (newStart === null || newEnd === null) return false;

            return Object.keys(this.schedule[day]).some(existingStartTime => {
                return this.schedule[day][existingStartTime].some(event => {
                    if (!event.endTime) return false;
                    
                    const existingStart = this.timeToMinutes(existingStartTime);
                    const existingEnd = this.timeToMinutes(event.endTime);
                    
                    // Kiểm tra thời gian hợp lệ
                    if (existingStart === null || existingEnd === null) return false;
                    
                    return this.isOverlapping(newStart, newEnd, existingStart, existingEnd);
                });
            });
        } catch (error) {
            console.error('Error checking time conflict:', error);
            return false;
        }
    }

    timeToMinutes(time) {
        try {
            // Kiểm tra tham số đầu vào
            if (!time || typeof time !== 'string') return null;
            
            // Kiểm tra định dạng thời gian
            if (!time.includes(':')) return null;
            
            const [hours, minutes] = time.split(':').map(Number);
            
            // Kiểm tra giá trị hợp lệ
            if (isNaN(hours) || isNaN(minutes)) return null;
            if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
            
            return hours * 60 + minutes;
        } catch (error) {
            console.error('Error converting time to minutes:', error);
            return null;
        }
    }

    isOverlapping(start1, end1, start2, end2) {
        return start1 < end2 && start2 < end1;
    }

    getConflictType(start1, end1, start2, end2) {
        // Kiểm tra tham số đầu vào
        if (start1 === null || end1 === null || start2 === null || end2 === null) {
            return null;
        }

        // Trùng hoàn toàn
        if (start1 === start2 && end1 === end2) {
            return 'full';
        }
        
        // Sự kiện 1 nằm hoàn toàn trong sự kiện 2
        if (start1 >= start2 && end1 <= end2) {
            return 'contained';
        }
        
        // Sự kiện 2 nằm hoàn toàn trong sự kiện 1
        if (start2 >= start1 && end2 <= end1) {
            return 'contains';
        }
        
        // Trùng một phần
        if (start1 < end2 && start2 < end1) {
            return 'partial';
        }
        
        return null;
    }

    getConflictingEvents(day, newStartTime, newEndTime) {
        if (!this.schedule[day]) return [];

        const conflicts = [];
        const newStart = this.timeToMinutes(newStartTime);
        const newEnd = this.timeToMinutes(newEndTime);

        Object.keys(this.schedule[day]).forEach(startTime => {
            this.schedule[day][startTime].forEach(event => {
                const existingStart = this.timeToMinutes(startTime);
                const existingEnd = this.timeToMinutes(event.endTime);
                
                const conflictType = this.getConflictType(newStart, newEnd, existingStart, existingEnd);
                
                if (conflictType) {
                    let conflictMessage;
                    switch (conflictType) {
                        case 'full':
                            conflictMessage = `${event.name} (${startTime}-${event.endTime}) - Trùng hoàn toàn`;
                            break;
                        case 'contained':
                            conflictMessage = `${event.name} (${startTime}-${event.endTime}) - Nằm trong sự kiện này`;
                            break;
                        case 'contains':
                            conflictMessage = `${event.name} (${startTime}-${event.endTime}) - Chứa sự kiện này`;
                            break;
                        case 'partial':
                            conflictMessage = `${event.name} (${startTime}-${event.endTime}) - Trùng một phần`;
                            break;
                    }
                    conflicts.push({
                        message: conflictMessage,
                        type: conflictType,
                        event: event
                    });
                }
            });
        });

        return conflicts;
    }

    // Thêm phương thức để hiển thị cảnh báo trực quan
    createScheduleItem(event, hasConflict = false) {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'schedule-item';
        
        if (hasConflict) {
            const conflicts = this.getConflictingEvents(
                event.day, 
                event.startTime, 
                event.endTime
            );
            
            if (conflicts.length > 0) {
                const conflictType = conflicts[0].type;
                eventDiv.classList.add(`schedule-conflict-${conflictType}`);
                
                // Thêm tooltip hiển thị thông tin xung đột
                eventDiv.title = conflicts.map(c => c.message).join('\n');
            }
        }
        
        eventDiv.textContent = `${event.name} (${event.startTime}-${event.endTime})`;
        return eventDiv;
    }

    // Thêm phương thức kiểm tra trạng thái đăng nhập
    checkAuthStatus() {
        const user = localStorage.getItem('currentUser');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.loadUserSchedule();
        }
    }

    // Thêm phương thức tải lịch của user
    loadUserSchedule() {
        if (this.currentUser) {
            const userSchedule = localStorage.getItem(`schedule_${this.currentUser.id}`);
            if (userSchedule) {
                this.schedule = JSON.parse(userSchedule);
                this.refreshSchedule();
            }
        }
    }
}

// Khởi tạo và gán vào window để có thể truy cập từ các file khác
window.scheduleManager = new ScheduleManager();

function createSchedule() {
    window.scheduleManager.createScheduleModal();
} 
