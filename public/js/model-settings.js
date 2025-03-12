/**
 * Quản lý cài đặt mô hình AI
 */

import { CONFIG, updateModelConfig, getCurrentModel } from './config.js';

// Thêm biến để theo dõi model hiện tại
let currentModel = localStorage.getItem('selectedModel') || CONFIG.API.GEMMA_MODEL;
let availableModels = [];
let currentCategory = 'all';
const MODEL_CATEGORIES = CONFIG.MODEL.CATEGORIES;

// Thêm biến để theo dõi trạng thái chuyển đổi model
let isModelSwitching = false;

// Thêm hàm getModelCategory
function getModelCategory(modelName) {
    // Chuyển tên model về chữ thường để dễ so sánh
    modelName = modelName.toLowerCase();
    
    // Phân loại model dựa trên tên
    if (modelName.includes('chat') || modelName.includes('gpt') || modelName.includes('llama')) {
        return 'chat';
    }
    if (modelName.includes('code') || modelName.includes('starcoder') || modelName.includes('codellama')) {
        return 'code';
    }
    if (modelName.includes('write') || modelName.includes('claude') || modelName.includes('gemma')) {
        return 'writing';
    }
    
    return 'all';
}

// Expose showModelSettings globally
export function showModelSettings() {
    // Tạo backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'settings-backdrop';
    
    // Tạo modal
    const modal = document.createElement('div');
    modal.className = 'model-settings-modal';
    
    // Tạo nội dung modal
    modal.innerHTML = `
        <div class="model-settings-header">
            <h2 class="model-settings-title">🛠 Cài Đặt LLM</h2>
            <div class="model-subtitle">Chọn mô hình AI phù hợp với nhu cầu của bạn</div>
        </div>
        <div class="model-settings-content">
            <div class="category-section">
                <div class="section-title">Danh Mục</div>
                <div class="model-categories">
                    ${Object.entries(MODEL_CATEGORIES).map(([key, category]) => `
                        <button class="model-category ${key === currentCategory ? 'active' : ''}" data-category="${key}">
                            <span class="category-icon">${category.icon}</span>
                            <span class="category-name">${category.name}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <div class="model-section">
                <div class="section-title">Mô Hình Khả Dụng</div>
                <div class="model-list">
                    <div class="model-loading">
                        <div class="loading-spinner"></div>
                        <div>Đang tải danh sách mô hình...</div>
                    </div>
                </div>
            </div>
        </div>
        <button class="close-settings">✕</button>
    `;
    
    // Thêm vào DOM
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    
    // Xử lý đóng modal
    const closeBtn = modal.querySelector('.close-settings');
    closeBtn.onclick = () => backdrop.remove();
    backdrop.onclick = (e) => {
        if (e.target === backdrop) backdrop.remove();
    };
    
    // Xử lý chọn category
    const categoryButtons = modal.querySelectorAll('.model-category');
    categoryButtons.forEach(button => {
        button.onclick = () => {
            currentCategory = button.dataset.category;
            categoryButtons.forEach(btn => btn.classList.toggle('active', btn === button));
            filterAndDisplayModels(modal);
        };
    });
    
    // Tải danh sách mô hình
    loadModels(modal);
    
    // Thêm hiệu ứng xuất hiện
    modal.style.opacity = '0';
    modal.style.transform = 'translateY(20px)';
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.transform = 'translateY(0)';
    }, 100);

    // Đồng bộ hiệu ứng click với các modal khác
    backdrop.style.backdropFilter = 'blur(8px)';
    backdrop.style.webkitBackdropFilter = 'blur(8px)';
    
    // Thêm hiệu ứng hover chuyên nghiệp
    const modelList = modal.querySelector('.model-list');
    modelList.querySelectorAll('.model-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-2px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', () => {
            if(!item.classList.contains('active')) {
                item.style.transform = 'translateY(0) scale(1)';
            }
        });
    });
}

async function loadModels(modal) {
    const modelList = modal.querySelector('.model-list');
    modelList.innerHTML = `
        <div class="model-loading">
            <div class="loading-spinner"></div>
            <div>Đang tải danh sách mô hình...</div>
        </div>
    `;
    
    try {
        // Gọi API để lấy danh sách mô hình từ Ollama
        const response = await fetch('http://localhost:11434/api/tags');
        if (!response.ok) {
            throw new Error('Failed to fetch models');
        }
        
        const data = await response.json();
        availableModels = data.models || [];
        
        // Hiển thị và lọc mô hình theo category hiện tại
        filterAndDisplayModels(modal);
        
    } catch (error) {
        console.error('Error loading models:', error);
        modelList.innerHTML = `
            <div style="color: #ef4444; text-align: center; padding: 20px;">
                Không thể tải danh sách mô hình. Vui lòng kiểm tra:
                <ul style="list-style: none; margin-top: 10px;">
                    <li>1. Ollama đã được khởi động</li>
                    <li>2. API endpoint (http://localhost:11434) có thể truy cập</li>
                    <li>3. CORS đã được cấu hình đúng</li>
                </ul>
            </div>
        `;
    }
}

function filterAndDisplayModels(modal) {
    const modelList = modal.querySelector('.model-list');
    const filteredModels = currentCategory === 'all' 
        ? availableModels 
        : availableModels.filter(model => getModelCategory(model.name) === currentCategory);
    
    if (filteredModels.length === 0) {
        modelList.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #a0a0a0;">
                Không tìm thấy mô hình nào trong danh mục này
            </div>
        `;
        return;
    }

    // Hiển thị danh sách models đã lọc
    modelList.innerHTML = `
        <div class="model-grid">
            ${filteredModels.map(model => `
                <div class="model-item ${model.name === currentModel ? 'active' : ''}" 
                     data-model="${model.name}">
                    <div class="model-name">${model.name}</div>
                    <div class="model-info">
                        <span class="model-category-icon">
                            ${MODEL_CATEGORIES[getModelCategory(model.name)].icon}
                        </span>
                        <button class="select-model-btn ${model.name === currentModel ? 'active' : ''}" 
                                data-model="${model.name}"
                                ${model.name === currentModel ? 'disabled' : ''}>
                            ${model.name === currentModel ? 'Đang sử dụng' : 'Chọn'}
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Thêm sự kiện click cho các nút chọn model
    const selectButtons = modelList.querySelectorAll('.select-model-btn');
    selectButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Kiểm tra nếu đang trong quá trình chuyển đổi
            if (isModelSwitching) {
                showNotification('Hệ thống đang trong quá trình chuyển đổi LLM, xin vui lòng chờ', 'info');
                return;
            }

            const modelName = button.dataset.model;
            
            // Đóng modal ngay lập tức khi click
            const backdrop = document.querySelector('.settings-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
            
            try {
                // Đánh dấu đang trong quá trình chuyển đổi
                isModelSwitching = true;
                
                // Tạo và hiển thị thông báo đang chuyển đổi (không tự động xóa)
                const switchingNotification = document.createElement('div');
                switchingNotification.className = 'timer-notification info';
                
                const noteElement = document.createElement('div');
                noteElement.className = 'timer-note';
                noteElement.textContent = `Đang chuyển đổi sang mô hình ${modelName}...`;
                switchingNotification.appendChild(noteElement);
                
                const container = document.querySelector('.timer-notifications-sidebar');
                if (container) {
                    container.insertBefore(switchingNotification, container.firstChild);
                    setTimeout(() => {
                        switchingNotification.style.opacity = '1';
                    }, 10);
                }
                
                // Kiểm tra model có tồn tại không
                const modelExists = availableModels.some(model => model.name === modelName);
                if (!modelExists) {
                    throw new Error(`Model ${modelName} không tồn tại`);
                }

                // Test kết nối với model mới
                try {
                    const testResponse = await fetch(`${CONFIG.API.OLLAMA_URL}/generate`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: modelName,
                            prompt: "Test connection",
                            stream: false
                        })
                    });

                    if (!testResponse.ok) {
                        throw new Error('Không thể kết nối với model');
                    }

                    // Nếu test thành công, cập nhật CONFIG và UI
                    updateModelConfig(modelName);
                    currentModel = modelName;
            
                    // Xóa thông báo đang chuyển đổi và hiển thị thông báo thành công
                    if (switchingNotification) {
                        switchingNotification.remove();
                    }
                    showNotification(`Đã chuyển đổi`);

                } catch (testError) {
                    console.error('Test connection error:', testError);
                    // Xóa thông báo đang chuyển đổi và hiển thị thông báo lỗi
                    if (switchingNotification) {
                        switchingNotification.remove();
                    }
                    showNotification('Không thể kết nối với model. Vui lòng kiểm tra Ollama', 'error');
                }
                
            } catch (error) {
                console.error('Error selecting model:', error);
                // Xóa thông báo đang chuyển đổi và hiển thị thông báo lỗi
                if (switchingNotification) {
                    switchingNotification.remove();
                }
                showNotification(error.message || 'Không thể chọn mô hình. Vui lòng thử lại.', 'error');
            } finally {
                // Kết thúc quá trình chuyển đổi
                isModelSwitching = false;
            }
        });
    });
}

// Thêm hàm showNotification nếu chưa có
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

// Thêm hàm khởi tạo để load model đã chọn khi trang được tải
function initializeModelSettings() {
    const savedModel = localStorage.getItem('selectedModel');
    if (savedModel) {
        currentModel = savedModel;
        CONFIG.API.GEMMA_MODEL = savedModel;
    }
}

// Gọi hàm khởi tạo khi trang được load
document.addEventListener('DOMContentLoaded', initializeModelSettings);

const getValue = selector => {
    const input = form.querySelector(selector);
    return input ? parseInt(input.value || 0) : 0;
};