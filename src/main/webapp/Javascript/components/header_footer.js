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

    fetch('/Pages/Components/Layouts/header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header').innerHTML = data;
            setTimeout(function() {
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
            }, 10);
        });

    fetch('/Pages/Components/Layouts/footer.html')
        .then(response => response.text())
        .then(data => document.getElementById('footer').innerHTML = data);
});

// Xử lý đăng xuất
function logOut() {
    localStorage.clear();
    window.location.href = '/Pages/Components/Login_Register_ForgotPW/login.html';
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
