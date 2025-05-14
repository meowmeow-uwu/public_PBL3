// Load header and footer
document.addEventListener('DOMContentLoaded', async function() {
    const basePath = window.APP_CONFIG.BASE_PATH || './';
    const headerDiv = document.getElementById('header');
    const footerDiv = document.getElementById('footer');

    // Ẩn header và footer ban đầu để tránh nhấp nháy
    if (headerDiv) headerDiv.style.display = 'none';
    if (footerDiv) footerDiv.style.display = 'none';

    try {
        // Load header
        const headerResponse = await fetch(basePath + 'Pages/Components/Layouts/header.html');
        let headerHtml = await headerResponse.text();
        headerHtml = headerHtml.replace(/\${window\.APP_CONFIG\.BASE_PATH}/g, basePath);
        headerDiv.innerHTML = headerHtml;

        // Load footer
        const footerResponse = await fetch(basePath + 'Pages/Components/Layouts/footer.html');
        let footerHtml = await footerResponse.text();
        footerHtml = footerHtml.replace(/\${window\.APP_CONFIG\.BASE_PATH}/g, basePath);
        footerDiv.innerHTML = footerHtml;

        // Kiểm tra đăng nhập
        let userInfo = null;
        const token = localStorage.getItem('token');
        
        // Chỉ thử lấy thông tin user nếu có token và hàm fetchUserInfo tồn tại
        if (token && typeof window.fetchUserInfo === 'function') {
            try {
                userInfo = await window.fetchUserInfo();
            } catch (error) {
                console.error('Error fetching user info:', error);
                // Nếu có lỗi khi lấy thông tin user, xử lý như guest
                handleGuestView();
                return;
            }
        }

        // Xử lý hiển thị dựa trên role
        if (userInfo && userInfo.group_user_id) {
            handleUserView(userInfo);
        } else {
            handleGuestView();
        }

        // Hiển thị header và footer
        if (headerDiv) headerDiv.style.display = '';
        if (footerDiv) footerDiv.style.display = '';

        // Thêm event listeners cho header
        addHeaderEventListeners();
    } catch (error) {
        console.error('Error loading header/footer:', error);
        // Nếu có lỗi, hiển thị giao diện guest
        handleGuestView();
        if (headerDiv) headerDiv.style.display = '';
        if (footerDiv) footerDiv.style.display = '';
    }
});

// Xử lý hiển thị cho user đã đăng nhập
function handleUserView(userInfo) {
    // Ẩn các phần tử guest
    document.querySelectorAll('.guest-only').forEach(el => el.style.display = 'none');
    // Hiển thị các phần tử user
    document.querySelectorAll('.user-only').forEach(el => el.style.display = '');

    // Cập nhật thông tin user
    const userNameSpan = document.getElementById('userName');
    if (userNameSpan) userNameSpan.textContent = userInfo.name || 'User';
    const avatarImg = document.querySelector('.user-info .avatar');
    if (avatarImg && userInfo.avatar) avatarImg.src = userInfo.avatar;

    // Xử lý hiển thị header/footer dựa trên role
    const headerDiv = document.getElementById('header');
    const footerDiv = document.getElementById('footer');
    
    if (userInfo.group_user_id === 1 || userInfo.group_user_id === 3) {
        // Admin hoặc Staff - ẩn header/footer
        if (headerDiv) headerDiv.style.display = 'none';
        if (footerDiv) {
            footerDiv.style.display = 'none';
            footerDiv.classList.add('footer-has-sidebar');
        }
    } else {
        // User thường - hiển thị header/footer
        if (headerDiv) headerDiv.style.display = '';
        if (footerDiv) {
            footerDiv.style.display = '';
            footerDiv.classList.remove('footer-has-sidebar');
        }
    }
}

// Xử lý hiển thị cho guest
function handleGuestView() {
    // Hiển thị các phần tử guest
    document.querySelectorAll('.guest-only').forEach(el => el.style.display = '');
    // Ẩn các phần tử user
    document.querySelectorAll('.user-only').forEach(el => el.style.display = 'none');
}

// Thêm event listeners cho header
function addHeaderEventListeners() {
    const header = document.getElementById('header');
    if (!header) return;

    // Xử lý click vào các link trong header
    header.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (link) {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href) {
                window.location.href = href;
            }
        }
    });

    // Xử lý đăng xuất
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.clear();
            const basePath = window.APP_CONFIG.BASE_PATH || './';
            window.location.href = basePath + 'Pages/Components/Login_Register_ForgotPW/login.html';
        });
    }

    // Xử lý form đăng ký
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            if (password !== confirmPassword) {
                e.preventDefault();
                alert('Mật khẩu không khớp!');
            }
        });
    }

    // Đánh dấu active cho nút login/register
    const path = window.location.pathname;
    const loginBtn = document.querySelector('.login-button');
    const registerBtn = document.querySelector('.register-button');
    if (loginBtn && path.includes('login.html')) {
        loginBtn.classList.add('active');
    }
    if (registerBtn && path.includes('register.html')) {
        registerBtn.classList.add('active');
    }

    // Xử lý mobile menu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
        });

        // Đóng menu khi click ra ngoài
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.mobile-menu-btn') && !e.target.closest('.mobile-menu')) {
                mobileMenu.classList.remove('active');
            }
        });
    }

    // Xử lý mobile logout
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.clear();
            const basePath = window.APP_CONFIG.BASE_PATH || './';
            window.location.href = basePath + 'Pages/Components/Login_Register_ForgotPW/login.html';
        });
    }
}
