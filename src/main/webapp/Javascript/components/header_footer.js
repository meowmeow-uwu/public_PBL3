// Load header and footer
document.addEventListener('DOMContentLoaded', function() {
    fetch('/Pages/Components/Layouts/header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header').innerHTML = data;
            // Sau khi header đã load xong, kiểm tra trạng thái đăng nhập
            setTimeout(function() {
                const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
                document.querySelectorAll('.guest-only').forEach(el => {
                    el.style.display = isLoggedIn ? 'none' : '';
                });
                document.querySelectorAll('.user-only').forEach(el => {
                    el.style.display = isLoggedIn ? '' : 'none';
                });
                // Hiển thị tên user nếu có
                if (isLoggedIn && localStorage.getItem('userName')) {
                    const userNameSpan = document.getElementById('userName');
                    if (userNameSpan) userNameSpan.textContent = localStorage.getItem('userName');
                }
            }, 10);
        });
    fetch('/Pages/Components/Layouts/footer.html')
        .then(response => response.text())
        .then(data => document.getElementById('footer').innerHTML = data);
});
document.getElementById('registerForm').addEventListener('submit', function(e) {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        e.preventDefault();
        showMessage('Passwords do not match!', 'error');
    }
});
//
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
function LogOut() {
    localStorage.clear();
}