// Helper function để lấy CSRF token từ cookie
function getCsrfToken() {
    const match = document.cookie.match('(^|;)\\s*XSRF-TOKEN\\s*=\\s*([^;]+)');
    return match ? match[2] : '';
}

// Quản lý rate limiting ở client
const rateLimiter = {
    requests: new Map(),
    resetTime: 60000, // 1 phút
    maxRequests: 30, // Số request tối đa trong 1 phút

    canMakeRequest(endpoint) {
        const now = Date.now();
        const requests = this.requests.get(endpoint) || [];
        
        // Xóa các request cũ hơn 1 phút
        const validRequests = requests.filter(time => now - time < this.resetTime);
        this.requests.set(endpoint, validRequests);
        
        return validRequests.length < this.maxRequests;
    },

    trackRequest(endpoint) {
        const requests = this.requests.get(endpoint) || [];
        requests.push(Date.now());
        this.requests.set(endpoint, requests);
    }
};

// Wrap fetch API với CSRF token và xử lý lỗi chung
export async function safeFetch(url, options = {}) {
    const csrfToken = getCsrfToken();
    const endpoint = new URL(url).pathname;

    // Kiểm tra rate limit
    if (!rateLimiter.canMakeRequest(endpoint)) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.');
    }

    const defaultOptions = {
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
        }
    };

    const fetchOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        rateLimiter.trackRequest(endpoint);
        const response = await fetch(url, fetchOptions);
        
        if (!response.ok) {
            // Xử lý các mã lỗi HTTP
            switch (response.status) {
                case 429:
                    throw new Error('Quá nhiều yêu cầu. Vui lòng thử lại sau.');
                case 403:
                    if (response.headers.get('X-CSRF-Token') === 'invalid') {
                        throw new Error('CSRF token không hợp lệ. Vui lòng tải lại trang.');
                    }
                    throw new Error('Không có quyền truy cập.');
                case 401:
                    throw new Error('Chưa đăng nhập hoặc phiên làm việc đã hết hạn.');
                case 404:
                    throw new Error('Không tìm thấy tài nguyên yêu cầu.');
                case 500:
                    throw new Error('Lỗi máy chủ nội bộ. Vui lòng thử lại sau.');
                default:
                    throw new Error('Đã xảy ra lỗi khi thực hiện yêu cầu.');
            }
        }

        return response;
    } catch (error) {
        // Log lỗi để debug
        console.error('Fetch error:', error);
        
        // Ném lại lỗi để component xử lý
        throw error;
    }
}