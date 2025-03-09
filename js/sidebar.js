document.addEventListener('DOMContentLoaded', () => {
    // Lấy tham chiếu đến các phần tử DOM cần thiết
    const sidebarToggle = document.getElementById('toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const arrow = sidebarToggle.querySelector('.arrow');
    const sidebarButtons = document.querySelectorAll('.sidebar button');
    
    // Danh sách các nút chức năng cần vô hiệu hóa khi sidebar đóng
    const functionalButtons = [
        document.querySelector('button[data-function="datetime"]'),  // xem ngày giờ
        document.querySelector('button[data-function="weather"]'),   // xem thời tiết
        document.querySelector('button[data-function="schedule"]'),  // lập thời khóa biểu
        document.querySelector('button[data-function="timer"]'),      // hẹn giờ, đếm ngược
        document.querySelector('button[data-function="newchat"]')   // đoạn chat mới
    ];

    /**
     * Xử lý sự kiện khi người dùng nhấp vào nút toggle sidebar
     */
    function toggleSidebar() {
        // Chuyển đổi giữa trạng thái thu gọn và mở rộng thay vì ẩn hoàn toàn
        sidebar.classList.toggle('collapsed');
        
        // Điều chỉnh kích thước của phần nội dung chính
        mainContent.classList.toggle('expanded');
        
        // Xoay biểu tượng mũi tên để thể hiện trạng thái
        arrow.classList.toggle('rotated');
        
        // Lưu trạng thái hiện tại vào localStorage để duy trì giữa các phiên
        const isSidebarCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isSidebarCollapsed);
        
        // Cập nhật trạng thái và hiệu ứng cho các nút chức năng
        updateFunctionalButtons(isSidebarCollapsed);
        
        // Thêm class animation
        mainContent.classList.add('animate-content');
        
        // Xóa class animation sau khi hoàn thành
        setTimeout(() => {
            mainContent.classList.remove('animate-content');
        }, 500);
    }
    
    /**
     * Cập nhật trạng thái nút chức năng dựa trên trạng thái của sidebar
     * @param {boolean} isCollapsed - Trạng thái thu gọn của sidebar
     */
    function updateFunctionalButtons(isCollapsed) {
        functionalButtons.forEach((button, index) => {
            if (button) {
                // Thêm transition cho các thuộc tính
                
                if (isCollapsed) {
                    button.style.transition = 'all 0.3s ease';
                    button.setAttribute('disabled', 'disabled');
                    button.style.opacity = '0.5';
                    button.style.cursor = 'not-allowed';
                    button.style.transform = 'scale(0.95)';
                    button.style.transitionDelay = `${index * 0.1}s`;
                    button.style.width = '46px'; // Tăng kích thước từ 40px lên 46px
                    button.style.height = '46px'; // Tăng kích thước từ 40px lên 46px
                    button.style.padding = '10px'; // Tăng padding từ 8px lên 10px
                    button.style.aspectRatio = '1'; // Đảm bảo hình vuông
                    button.setAttribute('title', 'Mở rộng thanh bên để sử dụng chức năng này');
                } else {
                    button.style.transition = 'all 1.3s ease'; // Giảm thời gian transition từ 1s xuống 0.3s
                    button.removeAttribute('disabled');
                    button.style.opacity = '1';
                    button.style.cursor = 'pointer';
                    button.style.transform = 'scale(1)';
                    button.style.transitionDelay = `${(4 - index) * 0.1}s`; // Giảm delay giữa các nút
                    button.style.width = '100%';
                    button.style.height = 'auto'; // Khôi phục chiều cao tự động
                    button.style.padding = '12px 16px';
                    button.style.aspectRatio = 'auto'; // Bỏ tỷ lệ khung hình vuông
                    button.setAttribute('title', '');
                }
                
                // Thêm hiệu ứng hover với transition nhanh hơn
                button.addEventListener('mouseover', () => {
                    if (!isCollapsed) {
                        button.style.transition = 'all 0.2s ease'; // Giảm thời gian transition khi hover
                        button.style.transform = 'scale(1.05) translateX(4px)';
                        button.style.backgroundColor = '#4d4d4d';
                    }
                });
                
                button.addEventListener('mouseout', () => {
                    if (!isCollapsed) {
                        button.style.transition = 'all 0.2s ease'; // Giảm thời gian transition khi hover out
                        button.style.transform = 'scale(1)';
                        button.style.backgroundColor = '#3d3d3d';
                    }
                });
            }
        });
    }

    // Khôi phục trạng thái sidebar từ phiên trước đó (nếu có)
    function restoreSidebarState() {
        const isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        
        if (isSidebarCollapsed) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
            arrow.classList.add('rotated');
        }
        
        // Cập nhật trạng thái nút chức năng khi trang được tải
        updateFunctionalButtons(isSidebarCollapsed);
    }

    // Đăng ký sự kiện click cho nút toggle
    sidebarToggle.addEventListener('click', toggleSidebar);
    
    // Khôi phục trạng thái sidebar khi trang được tải
    restoreSidebarState();
});
