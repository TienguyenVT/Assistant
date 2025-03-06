function createModal(type) {
    // Tạo backdrop
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

    // Tạo modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        background-color: white;
        padding: 30px;
        border-radius: 15px;
        width: 350px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        position: relative;
    `;

    // Tiêu đề
    const title = document.createElement('h2');
    title.textContent = type === 'login' ? 'Đăng Nhập' : 'Đăng Ký';
    title.style.textAlign = 'center';
    title.style.marginBottom = '20px';

    // Form
    const form = document.createElement('form');
    form.style.display = 'flex';
    form.style.flexDirection = 'column';
    form.style.gap = '15px';

    // Các trường input
    const inputs = type === 'login' ? [
        { type: 'text', placeholder: 'Tên đăng nhập' },
        { type: 'password', placeholder: 'Mật khẩu' }
    ] : [
        { type: 'text', placeholder: 'Tên đăng nhập' },
        { type: 'email', placeholder: 'Email' },
        { type: 'password', placeholder: 'Mật khẩu' },
        { type: 'password', placeholder: 'Xác nhận mật khẩu' }
    ];

    inputs.forEach(inputData => {
        const input = document.createElement('input');
        input.type = inputData.type;
        input.placeholder = inputData.placeholder;
        input.style.cssText = `
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            margin-bottom: 15px;  // Thêm margin dưới cho mỗi input
        `;
        form.appendChild(input);
    });

    // Nút submit
    const submitButton = document.createElement('button');
    submitButton.textContent = type === 'login' ? 'Đăng Nhập' : 'Đăng Ký';
    submitButton.style.cssText = `
        padding: 12px;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
        transition: background-color 0.3s;
        margin-top: 10px;  // Thêm margin trên cho nút submit
    `;
    submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        // TODO: Thêm logic xác thực
        alert(`Chức năng ${type === 'login' ? 'Đăng Nhập' : 'Đăng Ký'} đang được phát triển`);
        backdrop.remove();
    });

    // Nút đóng
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

    // Kết hợp các phần tử
    modal.appendChild(title);
    modal.appendChild(form);
    modal.appendChild(submitButton);
    backdrop.appendChild(modal);

    // Thêm vào body
    document.body.appendChild(backdrop);

    // Đóng modal khi click ngoài
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
            backdrop.remove();
        }
    });
}

function showLoginModal() {
    createModal('login');
}

function showRegisterModal() {
    createModal('register');
}