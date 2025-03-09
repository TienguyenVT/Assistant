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
        form.appendChild(createInput(inputData));
    });
    
    const submitButton = createSubmitButton(isLogin ? 'Đăng Nhập' : 'Đăng Ký', isLogin);
    form.appendChild(submitButton);
    
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
    const action = isLogin ? 'Đăng Nhập' : 'Đăng Ký';
    showNotification(`Chức năng ${action} đang được phát triển`, 'info');
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
}

function createCloseButton(closeCallback) {
    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.classList.add('close-button');
    closeButton.addEventListener('click', closeCallback);
    return closeButton;
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.classList.add('notification', type);
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
    }, 2300);
}

function showLoginModal() { createModal('login'); }
function showRegisterModal() { createModal('register'); }
