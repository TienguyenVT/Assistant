/**
 * Tạo modal đăng nhập hoặc đăng ký
 * @param {string} type - Loại modal ('login' hoặc 'register')
 */
function createModal(type) {
    const isLogin = type === 'login';
    const title = isLogin ? 'Đăng Nhập' : 'Đăng Ký';
    
    const backdrop = createBackdrop();
    const modal = createModalContainer();
    const titleElement = createTitle(title);
    const form = createForm(isLogin);
    const closeButton = createCloseButton(() => backdrop.remove());

    modal.appendChild(titleElement);
    modal.appendChild(form);
    modal.appendChild(closeButton);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) backdrop.remove();
    });
}

function createBackdrop() {
    const backdrop = document.createElement('div');
    backdrop.classList.add('modal-backdrop');
    return backdrop;
}

function createModalContainer() {
    const modal = document.createElement('div');
    modal.classList.add('auth-modal');
    return modal;
}

function createTitle(text) {
    const title = document.createElement('h2');
    title.textContent = text;
    title.classList.add('modal-title');
    return title;
}

function createForm(isLogin) {
    const form = document.createElement('form');
    form.classList.add('auth-form');
    
    const inputs = isLogin ? [
        { type: 'text', placeholder: 'Tên đăng nhập', name: 'username' },
        { type: 'password', placeholder: 'Mật khẩu', name: 'password' }
    ] : [
        { type: 'text', placeholder: 'Tên đăng nhập', name: 'username' },
        { type: 'email', placeholder: 'Email', name: 'email' },
        { type: 'password', placeholder: 'Mật khẩu', name: 'password' },
        { type: 'password', placeholder: 'Xác nhận mật khẩu', name: 'confirmPassword' }
    ];
    
    const inputElements = [];
    
    inputs.forEach((inputData, index) => {
        const input = createInput(inputData);
        inputElements.push(input);
        
        // Xử lý phím Enter
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                
                // Nếu là input cuối cùng thì submit form
                if (index === inputs.length - 1) {
                    handleFormSubmit(isLogin);
                } else {
                    // Focus vào input tiếp theo
                    inputElements[index + 1].focus();
                }
            }
        });
        
        form.appendChild(input);
    });
    
    const submitButton = createSubmitButton(isLogin ? 'Đăng Nhập' : 'Đăng Ký', isLogin);
    form.appendChild(submitButton);
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleFormSubmit(isLogin);
    });
    
    return form;
}

function createInput(inputData) {
    const input = document.createElement('input');
    input.type = inputData.type;
    input.placeholder = inputData.placeholder;
    input.name = inputData.name;
    input.classList.add('auth-input');
    return input;
}

function createSubmitButton(text, isLogin) {
    const submitButton = document.createElement('button');
    submitButton.textContent = text;
    submitButton.classList.add('auth-button');
    
    submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        handleFormSubmit(isLogin);
    });
    
    return submitButton;
}

function handleFormSubmit(isLogin) {
    const form = document.querySelector('.auth-form');
    const formData = new FormData(form);
    
    if (isLogin) {
        const username = formData.get('username');
        const password = formData.get('password');
        
        if (!username || !password) {
            showNotification('Vui lòng điền đầy đủ thông tin', 'error');
            return;
        }
        
        // Gọi API đăng nhập
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                localStorage.setItem('sessionToken', data.user.sessionToken);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                showNotification('Đã Đăng Nhập!', 'success');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                showNotification(data.error, 'error');
            }
        })
        .catch(error => {
            showNotification('Lỗi kết nối server', 'error');
        });
        
    } else {
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        
        if (!username || !email || !password || !confirmPassword) {
            showNotification('Vui lòng điền đầy đủ thông tin', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showNotification('Mật khẩu xác nhận không khớp', 'error');
            return;
        }
        
        // Gọi API đăng ký
        fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
                createModal('login');
            } else {
                showNotification(data.error, 'error');
            }
        })
        .catch(error => {
            showNotification('Lỗi kết nối server', 'error');
        });
    }
    
    // Đóng modal
    document.querySelector('.modal-backdrop').remove();
}

function createCloseButton(closeCallback) {
    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.classList.add('close-button');
    closeButton.addEventListener('click', closeCallback);
    return closeButton;
}

function showNotification(message, type = 'info') {
    const container = document.querySelector('.timer-notifications-sidebar');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `timer-notification ${type}`;
    
    const noteElement = document.createElement('div');
    noteElement.className = 'timer-note';
    noteElement.textContent = message;
    notification.appendChild(noteElement);
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'notification-buttons';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'notification-button';
    closeButton.textContent = '✕';
    closeButton.onclick = () => {
        notification.classList.add('removing');
        setTimeout(() => notification.remove(), 300);
    };
    
    buttonsContainer.appendChild(closeButton);
    notification.appendChild(buttonsContainer);
    
    // Thêm class dựa trên type
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(52,211,153,0.2) 100%)';
        notification.style.borderColor = 'rgba(52,211,153,0.3)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(220,38,38,0.2) 100%)';
        notification.style.borderColor = 'rgba(239,68,68,0.3)';
    }
    
    container.insertBefore(notification, container.firstChild);
    
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    // Tự động xóa sau 3 giây
    setTimeout(() => {
        notification.classList.add('removing');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showLoginModal() {
    createModal('login');
}

function showRegisterModal() {
    createModal('register');
}

// Thêm hàm kiểm tra trạng thái đăng nhập
function checkAuthState() {
    const sessionToken = localStorage.getItem('sessionToken');
    const currentUser = localStorage.getItem('currentUser');
    const guestButtons = document.getElementById('guestButtons');
    const userButtons = document.getElementById('userButtons');
    
    if (sessionToken && currentUser) {
        // User đã đăng nhập
        guestButtons.style.display = 'none';
        userButtons.style.display = 'flex';
    } else {
        // User chưa đăng nhập
        guestButtons.style.display = 'flex';
        userButtons.style.display = 'none';
    }
}

// Xử lý đăng xuất
async function handleLogout() {
    try {
        const sessionToken = localStorage.getItem('sessionToken');
        if (sessionToken) {
            const response = await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sessionToken })
            });

            const data = await response.json();
            
            if (data.success) {
                localStorage.removeItem('sessionToken');
                localStorage.removeItem('currentUser');
                localStorage.removeItem('chatbot_username');
                showNotification('Đã Đăng Xuất', 'success');
                checkAuthState(); // Cập nhật UI
                setTimeout(() => window.location.reload(), 1000);
            } else {
                showNotification(data.error, 'error');
            }
        }
    } catch (error) {
        showNotification('Lỗi kết nối server', 'error');
    }
}

// Hiển thị modal tài khoản
function showAccountModal() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const backdrop = createBackdrop();
    const modal = createModalContainer();
    modal.innerHTML = `
        <h2 class="modal-title">Thông tin tài khoản</h2>
        <div class="account-info">
            <p><strong>Tên đăng nhập:</strong> ${currentUser.username}</p>
            <p><strong>Email:</strong> ${currentUser.email}</p>
        </div>
    `;
    
    const closeButton = createCloseButton(() => backdrop.remove());
    modal.appendChild(closeButton);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
}

// Gọi checkAuthState khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
});

export {
    showLoginModal,
    showRegisterModal,
    showAccountModal,
    handleLogout,
    checkAuthState
};
