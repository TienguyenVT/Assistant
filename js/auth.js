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
    
    inputs.forEach(inputData => {
        const input = createInput(inputData);
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
    return submitButton;
}

async function handleFormSubmit(isLogin) {
    const form = document.querySelector('.auth-form');
    const formData = new FormData(form);
    
    if (isLogin) {
        const username = formData.get('username');
        const password = formData.get('password');
        
        if (!username || !password) {
            showNotification('Vui lòng điền đầy đủ thông tin', 'error');
            return;
        }
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('sessionToken', data.user.sessionToken);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                showNotification('Đăng nhập thành công!', 'success');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                showNotification(data.error, 'error');
            }
        } catch (error) {
            showNotification('Lỗi kết nối server', 'error');
        }
        
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
        
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();
            
            if (data.success) {
                showNotification('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
                createModal('login');
            } else {
                showNotification(data.error, 'error');
            }
        } catch (error) {
            showNotification('Lỗi kết nối server', 'error');
        }
    }
    
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
    const container = document.getElementById('timer-notifications-sidebar');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.classList.add('notification', type);
    
    container.insertBefore(notification, container.firstChild);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
    }, 2300);
}

// Xử lý đăng xuất
document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
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
                        showNotification('Đã đăng xuất thành công!', 'success');
                        setTimeout(() => window.location.reload(), 1000);
                    } else {
                        showNotification(data.error, 'error');
                    }
                }
            } catch (error) {
                showNotification('Lỗi kết nối server', 'error');
            }
        });
    }

    // Kiểm tra session
    const sessionToken = localStorage.getItem('sessionToken');
    if (sessionToken) {
        fetch('/api/user/profile', {
            headers: {
                'X-Session-Token': sessionToken
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.body.classList.add('logged-in');
                updateUIForLoggedInUser(data.user);
            } else {
                localStorage.removeItem('sessionToken');
                localStorage.removeItem('currentUser');
            }
        })
        .catch(() => {
            localStorage.removeItem('sessionToken');
            localStorage.removeItem('currentUser');
        });
    }
});

function updateUIForLoggedInUser(user) {
    const userNameElement = document.getElementById('currentUserName');
    if (userNameElement) {
        userNameElement.textContent = user.fullName || user.username;
    }
    
    document.querySelectorAll('.auth-required').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.auth-hidden').forEach(el => el.style.display = 'block');
    
    const avatarElement = document.getElementById('userAvatar');
    if (avatarElement) {
        avatarElement.src = user.avatar_url || 'images/default-avatar.png';
    }
}

function showLoginModal() { createModal('login'); }
function showRegisterModal() { createModal('register'); }