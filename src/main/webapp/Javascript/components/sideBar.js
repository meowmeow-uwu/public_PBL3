// Save this content as: Javascript/components/sideBar.js

document.addEventListener('DOMContentLoaded', function() {
    const sidebarDiv = document.getElementById('sidebar');
    let sidebarOverlay = document.getElementById('sidebar-overlay'); // Khởi tạo overlay

    if (!sidebarDiv) {
        console.error('Lỗi: Không tìm thấy phần tử #sidebar trong HTML chính. Sidebar không thể hoạt động.');
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        sidebarDiv.style.display = 'none';
        if (!sidebarOverlay) {
            const newOverlay = document.createElement('div');
            newOverlay.id = 'sidebar-overlay';
            newOverlay.classList.add('sidebar-overlay');
            document.body.appendChild(newOverlay);
            sidebarOverlay = newOverlay;
        }
        sidebarOverlay.style.display = 'none';
        return;
    }

    let currentUserProfileHeader;
    let currentSidebarMenuContent;
    // mobileMenuToggleButton không còn tồn tại trong HTML
    // mobileDropdownMenu không còn tồn tại trong HTML

    /**
     * @function adjustSidebarLayout
     * Điều chỉnh layout của sidebar và các phần tử liên quan dựa trên kích thước màn hình (responsive).
     */
    function adjustSidebarLayout() {
        if (!sidebarDiv || !currentUserProfileHeader || !currentSidebarMenuContent) {
            return;
        }

        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            // Mobile Mode: Sidebar thu gọn ban đầu
            sidebarDiv.style.width = '70px'; // Chiều rộng thu gọn
            sidebarDiv.style.height = '100vh';
            sidebarDiv.style.position = 'fixed';
            sidebarDiv.style.top = '0';
            sidebarDiv.style.left = '0';
            sidebarDiv.style.boxShadow = '2px 0 10px rgba(0, 0, 0, 0.2)';
            sidebarDiv.style.zIndex = '1050';
            sidebarDiv.style.display = 'flex';
            sidebarDiv.style.flexDirection = 'column';
            sidebarDiv.style.visibility = 'visible'; // Luôn visible
            sidebarDiv.style.transform = 'translateX(0)'; // Luôn ở vị trí 0
            sidebarDiv.style.overflowX = 'hidden'; // Quan trọng: Ẩn nội dung tràn ngang

            currentUserProfileHeader.style.position = 'static';
            currentUserProfileHeader.style.width = '70px';
            currentUserProfileHeader.style.zIndex = 'auto';
            currentUserProfileHeader.style.boxShadow = 'none';
            currentUserProfileHeader.style.margin = '0px 0px 0px 8px';

            // Không còn mobileMenuToggleButton, mobileDropdownMenu để xóa inline style

            currentSidebarMenuContent.style.height = 'auto';
            currentSidebarMenuContent.style.opacity = ''; // CSS sẽ quản lý
            currentSidebarMenuContent.style.visibility = ''; // CSS sẽ quản lý
            currentSidebarMenuContent.style.overflow = 'auto';
            currentSidebarMenuContent.style.paddingBottom = '20px';

            document.body.style.overflow = '';
            
            // Đảm bảo sidebar và overlay đóng khi resize về mobile (nếu đang mở)
            sidebarDiv.classList.remove('active');
            if (sidebarOverlay) sidebarOverlay.classList.remove('active');

        } else {
            // Chế độ Desktop: Sidebar luôn hiển thị
            sidebarDiv.style.width = '280px';
            sidebarDiv.style.height = '100vh';
            sidebarDiv.style.position = 'fixed';
            sidebarDiv.style.left = '0';
            sidebarDiv.style.top = '0';
            sidebarDiv.style.boxShadow = '2px 0 5px rgba(0, 0, 0, 0.1)';
            sidebarDiv.style.zIndex = '1000';
            sidebarDiv.style.display = 'flex';
            sidebarDiv.style.flexDirection = 'column';
            sidebarDiv.style.visibility = 'visible';
            sidebarDiv.style.transform = 'translateX(0)';
            sidebarDiv.style.overflowX = 'auto'; /* Cho phép scrollbar ngang trên desktop nếu cần */

            currentUserProfileHeader.style.position = 'static';
            currentUserProfileHeader.style.width = 'auto';
            currentUserProfileHeader.style.zIndex = 'auto';
            currentUserProfileHeader.style.boxShadow = 'none';

            // Không còn mobileMenuToggleButton, mobileDropdownMenu để xóa inline style

            currentSidebarMenuContent.style.height = 'auto';
            currentSidebarMenuContent.style.opacity = '1';
            currentSidebarMenuContent.style.visibility = 'visible';
            currentSidebarMenuContent.style.overflow = 'auto';
            currentSidebarMenuContent.style.paddingBottom = '20px';

            document.body.style.overflow = '';

            // Đảm bảo không còn các class/trạng thái mobile khi chuyển sang desktop
            sidebarDiv.classList.remove('active');
            if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        }
    }

    window.addEventListener('resize', adjustSidebarLayout);

    function waitForFetchUserInfo(cb, tries = 10) {
        if (typeof window.USER_API.fetchUserInfo === 'function') {
            cb();
        } else if (tries > 0) {
            setTimeout(() => waitForFetchUserInfo(cb, tries - 1), 100);
        } else {
            console.error('Lỗi: Hàm window.USER_API.fetchUserInfo không được định nghĩa hoặc không khả dụng.');
            sidebarDiv.style.display = 'none';
            if (sidebarOverlay) sidebarOverlay.style.display = 'none';
        }
    }

    waitForFetchUserInfo(async () => {
        const userInfo = await window.USER_API.fetchUserInfo();
        if (!userInfo || !userInfo.group_user_id) {
            console.warn('Cảnh báo: Không có thông tin người dùng hoặc group_user_id không hợp lệ.');
            sidebarDiv.style.display = 'none';
            if (sidebarOverlay) sidebarOverlay.style.display = 'none';
            return;
        }

        if (userInfo.group_user_id === 1 || userInfo.group_user_id === 3) {
            const basePath = window.APP_CONFIG.BASE_PATH || './';
            fetch(basePath + 'Pages/Components/Layouts/sideBar.html')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Lỗi HTTP: ${response.status} - ${response.statusText}`);
                    }
                    return response.text();
                })
                .then(data => {
                    data = data.replace(/\${window\.APP_CONFIG\.BASE_PATH}/g, basePath);

                    if (!sidebarOverlay) {
                        const newOverlay = document.createElement('div');
                        newOverlay.id = 'sidebar-overlay';
                        newOverlay.classList.add('sidebar-overlay');
                        document.body.appendChild(newOverlay);
                        sidebarOverlay = newOverlay;
                    }

                    sidebarDiv.innerHTML = data;

                    currentUserProfileHeader = sidebarDiv.querySelector('#user-profile-header');
                    currentSidebarMenuContent = sidebarDiv.querySelector('#sidebar-menu-content');
                    // mobileMenuToggleButton không còn tồn tại trong sidebar.html

                    updateSidebarContent(userInfo, currentUserProfileHeader, currentSidebarMenuContent);

                    adjustSidebarLayout(); // Áp dụng layout ban đầu

                    // --- ĐỊNH NGHĨA CÁC EVENT LISTENER ---

                    // 1. Mở/đóng sidebar khi click vào user-profile-header
                    if (currentUserProfileHeader) { 
                        currentUserProfileHeader.addEventListener('click', function(event) {
                            event.stopPropagation(); // Ngăn click lan ra document
                            const isMobile = window.innerWidth <= 768;
                            if (isMobile) {
                                sidebarDiv.classList.toggle('active');
                                if (sidebarOverlay) sidebarOverlay.classList.toggle('active');
                                
                                if (sidebarDiv.classList.contains('active')) {
                                    document.body.style.overflow = 'hidden'; // Ngăn cuộn body
                                } else {
                                    document.body.style.overflow = ''; // Cho phép cuộn body
                                }
                            }
                        });
                    }

                    // 2. Đóng sidebar khi click vào overlay
                    if (sidebarOverlay) {
                        sidebarOverlay.addEventListener('click', function() {
                            sidebarDiv.classList.remove('active');
                            sidebarOverlay.classList.remove('active');
                            document.body.style.overflow = '';
                        });
                    }
                    
                    // 3. Đóng sidebar khi click vào một link bên trong sidebar
                    sidebarDiv.addEventListener('click', function(event) {
                        const isMobile = window.innerWidth <= 768;
                        if (!isMobile) return;

                        // Nếu click vào một link menu (hoặc bất kỳ đâu TRONG sidebar) và sidebar đang mở
                        if (sidebarDiv.classList.contains('active')) {
                            if (event.target.closest('.menu-link')) { // Nếu click vào một link menu, đóng sidebar
                                sidebarDiv.classList.remove('active');
                                if (sidebarOverlay) sidebarOverlay.classList.remove('active');
                                document.body.style.overflow = '';
                            }
                            // Không cần else if cho dropdown con nữa vì nó đã bị xóa
                        }
                    });

                }).catch(error => {
                    console.error('Lỗi khi tải nội dung sidebar HTML:', error);
                    sidebarDiv.style.display = 'none';
                    if (sidebarOverlay) sidebarOverlay.style.display = 'none';
                });
        } else {
            console.log('Sidebar ẩn: Người dùng không có vai trò Admin hoặc Staff.');
            sidebarDiv.style.display = 'none';
            if (sidebarOverlay) sidebarOverlay.style.display = 'none';
        }
    });
});

/**
 * @function updateSidebarContent
 * Cập nhật thông tin người dùng (tên, avatar) và hiển thị/ẩn các mục menu
 * dựa trên vai trò của người dùng (Admin, Staff).
 */
function updateSidebarContent(userInfo, userProfileHeaderElement, sidebarMenuContentElement) {
    const userNameElement = userProfileHeaderElement.querySelector('#sidebar-user-name');
    if (userNameElement) {
        userNameElement.textContent = userInfo.name || 'User Name';
    }

    const avatarImg = userProfileHeaderElement.querySelector('#user-avatar');
    if (avatarImg && userInfo.avatar) {
        avatarImg.src = userInfo.avatar;
    }

    const staffSection = sidebarMenuContentElement.querySelector('.staff-only');
    const adminSection = sidebarMenuContentElement.querySelector('.admin-only');

    // mobileMenuButton và dropdown của nó đã bị xóa khỏi HTML, nên logic này không cần thiết
    
    if (staffSection && adminSection) {
        if (userInfo.group_user_id === 1) { // Admin
            staffSection.style.display = '';
            adminSection.style.display = '';
        } else if (userInfo.group_user_id === 3) { // Staff
            staffSection.style.display = '';
            adminSection.style.display = 'none';
        } else { // Các vai trò khác
            staffSection.style.display = 'none';
            adminSection.style.display = 'none';
        }
    }
}

/**
 * @function logOut
 * Xóa token khỏi localStorage và chuyển hướng người dùng về trang đăng nhập.
 */
function logOut() {
    localStorage.clear();
    const basePath = window.APP_CONFIG.BASE_PATH || './';
    window.location.href = basePath + 'Pages/Components/Login_Register_ForgotPW/login.html';
}