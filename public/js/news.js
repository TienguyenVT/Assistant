import { getApiKey } from './secure/api-keys.js';
import { safeFetch } from './fetchHelper.js';

const NEWS_API_KEY = getApiKey('NEWS_API');
const NEWS_API_URL = 'https://newsdata.io/api/1/latest';

export function showNews() {
    const newsContainer = document.createElement('div');
    newsContainer.id = 'news-container';
    newsContainer.className = 'news-container';
    
    document.body.appendChild(newsContainer);
    
    // Add keyboard event listener for Escape key
    document.addEventListener('keydown', handleEscapeKey);
    
    // Fetch and display news
    fetchNews().catch(error => {
        showError(error.message);
    });
}

function handleEscapeKey(event) {
    if (event.key === 'Escape') {
        closeNews();
    }
}

function closeNews() {
    const container = document.getElementById('news-container');
    if (container) {
        document.removeEventListener('keydown', handleEscapeKey);
        container.remove();
    }
}

function showError(message) {
    const container = document.getElementById('news-container');
    if (container) {
        const errorElement = document.createElement('div');
        errorElement.className = 'news-error';
        errorElement.textContent = message;
        container.innerHTML = '';
        container.appendChild(errorElement);
    }
}

async function fetchNews() {
    const newsList = document.createElement('ul');
    newsList.className = 'news-list';
    
    try {
        const response = await safeFetch(`${NEWS_API_URL}?country=vi&category=top&apikey=${NEWS_API_KEY}`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.status === 'success' && data.results) {
            data.results.forEach(article => {
                const newsItem = createNewsItem(article);
                newsList.appendChild(newsItem);
            });
        } else {
            throw new Error('Không thể tải tin tức. Vui lòng thử lại sau.');
        }
        
        const container = document.getElementById('news-container');
        if (container) {
            container.innerHTML = '';
            container.appendChild(newsList);
        }
    } catch (error) {
        throw new Error('Lỗi khi tải tin tức: ' + error.message);
    }
}

function createNewsItem(article) {
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
            image.remove();
        };
        
        // Xử lý khi ảnh load thành công
        image.onload = () => {
            image.classList.remove('loading');
        };
        
        imageContainer.appendChild(image);
    } else {
        imageContainer.classList.add('no-image');
    }
    
    // Tạo container cho nội dung
    const contentContainer = document.createElement('div');
    contentContainer.className = 'news-content';
    
    // Thêm tiêu đề
    const title = document.createElement('h3');
    title.className = 'news-title';
    title.textContent = article.title;
    
    // Thêm mô tả
    const description = document.createElement('p');
    description.className = 'news-description';
    description.textContent = article.description || 'Không có mô tả';
    
    // Thêm link
    const link = document.createElement('a');
    link.href = article.link;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'news-link';
    link.textContent = 'Đọc thêm';
    
    // Ghép các phần tử
    contentContainer.appendChild(title);
    contentContainer.appendChild(description);
    contentContainer.appendChild(link);
    
    newsItem.appendChild(imageContainer);
    newsItem.appendChild(contentContainer);
    
    return newsItem;
}