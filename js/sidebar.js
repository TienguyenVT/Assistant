document.addEventListener('DOMContentLoaded', () => {
    const sidebarToggle = document.getElementById('toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const arrow = sidebarToggle.querySelector('.arrow');

    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
        mainContent.classList.toggle('expanded');
        arrow.classList.toggle('rotated');
        sidebarToggle.classList.toggle('hidden');
    });
});