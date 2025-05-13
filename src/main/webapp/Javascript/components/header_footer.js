// Load header and footer
document.addEventListener('DOMContentLoaded', async function() {
    // Nếu có hàm fetchUserInfo (tức là đã load getInfor.js), thì gọi lấy user
    let userInfo = null;
    if (typeof window.fetchUserInfo === 'function') {
        const token = localStorage.getItem('token');
        if (token) {
            userInfo = await window.fetchUserInfo();
        }
    }

    // Lấy đường dẫn hiện tại của trang
    const basePath = window.APP_CONFIG.BASE_PATH || './';

    // Load header
    const headerResponse = await fetch(basePath + 'Pages/Components/Layouts/header.html');
    let headerHtml = await headerResponse.text();
    
    // Thay thế các đường dẫn trong header
    headerHtml = headerHtml.replace(/\${window\.APP_CONFIG\.BASE_PATH}/g, basePath);
    document.getElementById('header').innerHTML = headerHtml;

    // Load footer
    const footerResponse = await fetch(basePath + 'Pages/Components/Layouts/footer.html');
    let footerHtml = await footerResponse.text();
    
    // Thay thế các đường dẫn trong footer
    footerHtml = footerHtml.replace(/\${window\.APP_CONFIG\.BASE_PATH}/g, basePath);
    document.getElementById('footer').innerHTML = footerHtml;

    // Update UI based on user info
    if (userInfo && userInfo.group_user_id) {
        // User đã đăng nhập
        document.querySelectorAll('.guest-only').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.user-only').forEach(el => el.style.display = '');
        // Gán tên, avatar
        const userNameSpan = document.getElementById('userName');
        if (userNameSpan) userNameSpan.textContent = userInfo.name || 'User';
        const avatarImg = document.querySelector('.user-info .avatar');
        if (avatarImg && userInfo.avatar) avatarImg.src = userInfo.avatar;
    } else {
        // Guest
        document.querySelectorAll('.guest-only').forEach(el => el.style.display = '');
        document.querySelectorAll('.user-only').forEach(el => el.style.display = 'none');
    }
});

// Xử lý đăng xuất
function logOut() {
    localStorage.clear();
    const basePath = window.APP_CONFIG.BASE_PATH || './';
    window.location.href = basePath + 'Pages/Components/Login_Register_ForgotPW/login.html';
}

// Xử lý form đăng ký
document.addEventListener('DOMContentLoaded', function() {
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
});

// Đánh dấu active cho nút login/register
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    const loginBtn = document.querySelector('.login-button');
    const registerBtn = document.querySelector('.register-button');
    if (loginBtn && path.includes('login.html')) {
        loginBtn.classList.add('active');
    }
    if (registerBtn && path.includes('register.html')) {
        registerBtn.classList.add('active');
    }
});
