const NEWS_API_KEY = 'pub_73250ca421728b37242224ee7195216268c84';
const NEWS_API_URL = 'https://newsdata.io/api/1/latest';

export function showNews() {
    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'news-backdrop';
    document.body.appendChild(backdrop);
    
    // Create news container
    const newsContainer = document.createElement('div');
    newsContainer.className = 'news-container';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'news-header';
    
    const title = document.createElement('h2');
    title.textContent = 'Tin Tức Mới Nhất';
    
    const headerButtons = document.createElement('div');
    headerButtons.className = 'news-header-buttons';
    
    const refreshButton = document.createElement('button');
    refreshButton.className = 'news-refresh';
    refreshButton.innerHTML = '<span>↺</span> Làm Mới';
    refreshButton.onclick = () => fetchNews();
    
    const closeButton = document.createElement('button');
    closeButton.className = 'news-close';
    closeButton.innerHTML = '×';
    closeButton.onclick = closeNews;
    closeButton.setAttribute('aria-label', 'Đóng');
    
    headerButtons.appendChild(refreshButton);
    headerButtons.appendChild(closeButton);
    
    header.appendChild(title);
    header.appendChild(headerButtons);
    
    // Create content container
    const content = document.createElement('div');
    content.className = 'news-content';
    
    // Add loading message
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'news-loading';
    loadingMessage.innerHTML = '<span>↺</span> Đang tải tin tức';
    
    // Assemble container
    content.appendChild(loadingMessage);
    newsContainer.appendChild(header);
    newsContainer.appendChild(content);
    
    // Add close functionality
    backdrop.onclick = (event) => {
        if (event.target === backdrop) {
            closeNews();
        }
    };
    
    // Add to document
    document.body.appendChild(newsContainer);
    
    // Trigger animations
    requestAnimationFrame(() => {
        backdrop.classList.add('show');
        newsContainer.classList.add('show');
    });
    
    // Add keyboard event listener for Escape key
    document.addEventListener('keydown', handleEscapeKey);
    
    // Fetch news
    fetchNews();
}

function handleEscapeKey(event) {
    if (event.key === 'Escape') {
        closeNews();
    }
}

function closeNews() {
    const container = document.querySelector('.news-container');
    const backdrop = document.querySelector('.news-backdrop');
    
    if (container && backdrop) {
        // Remove show classes to trigger fade out
        container.classList.remove('show');
        backdrop.classList.remove('show');
        
        // Remove keyboard event listener
        document.removeEventListener('keydown', handleEscapeKey);
        
        // Wait for animations to complete before removing elements
        setTimeout(() => {
            container.remove();
            backdrop.remove();
        }, 300); // Match the CSS transition duration
    }
}

async function fetchNews() {
    const newsList = document.createElement('ul');
    newsList.className = 'news-list';
    
    try {
        const response = await fetch(`${NEWS_API_URL}?country=vi&category=top&apikey=${NEWS_API_KEY}`);
        const data = await response.json();
        
        if (data.status === 'success' && data.results) {
            data.results.forEach(article => {
                const newsItem = document.createElement('li');
                newsItem.className = 'news-item';
                
                // Tạo container cho hình ảnh
                const imageContainer = document.createElement('div');
                imageContainer.className = 'news-image-container';
                
                // Kiểm tra và thêm hình ảnh nếu có
                if (article.image_url) {
                    const image = document.createElement('img');
                    image.src = article.image_url;
                    image.alt = article.title;
                    image.className = 'news-image loading';
                    
                    // Xử lý lỗi load hình ảnh
                    image.onerror = () => {
                        imageContainer.classList.add('no-image');
                        image.remove(); // Xóa thẻ img nếu load thất bại
                    };
                    
                    // Xử lý load thành công
                    image.onload = () => {
                        image.classList.remove('loading');
                    };
                    
                    imageContainer.appendChild(image);
                } else {
                    imageContainer.classList.add('no-image');
                }

                // Tạo wrapper cho nội dung
                const contentWrapper = document.createElement('div');
                contentWrapper.className = 'news-content-wrapper';
                
                const link = document.createElement('a');
                link.href = article.link;
                link.className = 'news-title';
                link.textContent = article.title;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                
                const date = document.createElement('div');
                date.className = 'news-date';
                date.textContent = new Date(article.pubDate).toLocaleString('vi-VN');
                
                // Ghép các phần tử
                contentWrapper.appendChild(link);
                contentWrapper.appendChild(date);
                
                newsItem.appendChild(imageContainer);
                newsItem.appendChild(contentWrapper);
                newsList.appendChild(newsItem);
            });
        } else {
            throw new Error('Không thể tải tin tức');
        }
    } catch (error) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'news-error';
        errorMessage.innerHTML = '⚠️ Đã xảy ra lỗi khi tải tin tức. Vui lòng thử lại sau.';
        newsList.appendChild(errorMessage);
    }
    
    // Replace loading message with news list
    const newsContent = document.querySelector('.news-content');
    newsContent.innerHTML = '';
    newsContent.appendChild(newsList);
} 