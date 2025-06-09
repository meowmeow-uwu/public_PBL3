// Sử dụng APP_CONFIG cho các đường dẫn
const API_LgRgt_URL = window.APP_CONFIG.API_BASE_URL + '/auth/';

const ADMIN = window.APP_CONFIG.ROLES.ADMIN;
const USER = window.APP_CONFIG.ROLES.USER;
const STAFF = window.APP_CONFIG.ROLES.STAFF;
// Constants for redirect paths - sử dụng BASE_PATH
const REDIRECT_PATHS = {
    [ADMIN]: window.APP_CONFIG.BASE_PATH + 'Pages/Staff/home.html',
    [USER]: window.APP_CONFIG.BASE_PATH + 'Pages/User/home.html',
    [STAFF]: window.APP_CONFIG.BASE_PATH + 'Pages/Staff/home.html'
};

async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_LgRgt_URL}login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                username: username,
                password: password
            })
        });

        const text = await response.text();
        let data;

        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            console.warn("Phản hồi không phải JSON:", text);
            throw new Error("Server trả về dữ liệu không hợp lệ");
        }

        if (!response.ok) {
            throw new Error(data.message || "Đăng nhập thất bại");
            localStorage.removeItem("token");

        }

        // Lưu token và thời gian hết hạn
        localStorage.setItem("token", data.token);
        if (data.expiresIn) {
            const expiresAt = new Date().getTime() + (data.expiresIn * 1000);
            localStorage.setItem("tokenExpiresAt", expiresAt);
        }

        console.log("Đăng nhập thành công");

        // Lấy thông tin user và chuyển hướng
        const user = await window.USER_API.fetchUserInfo();
        if (user) {
            const role = user.group_user_id;
            const redirectPath = REDIRECT_PATHS[role];

            if (redirectPath) {
                window.location.href = redirectPath;
            } else {
                console.error("Role không hợp lệ:", role);
                localStorage.removeItem("token");
                showToast('error', 'Lỗi',"Không thể xác định quyền truy cập. Vui lòng liên hệ admin.");
            }
        } else {
            localStorage.removeItem("token");
            showToast('error', 'Lỗi',"Không thể lấy thông tin người dùng");
            window.location.href = window.APP_CONFIG.BASE_PATH + 'Pages/Components/Login_Register_ForgotPW/login.html';
        }
        console.log(user);
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        localStorage.clear();
        showToast('error', 'Lỗi',"Lỗi: " + error.message);
    }
}


async function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const name = document.getElementById('name').value;

    if (!/^[a-z0-9_]+$/.test(username) || username.includes(' ')) {
        showToast('warning', 'Cảnh báo', 'Username chỉ được chứa chữ thường, số và dấu gạch dưới, không được chứa dấu cách!');
        return;
    }

    if (password !== confirmPassword) {
        showToast('warning', 'Cảnh báo', 'Mật khẩu không khớp!');
        return;
    }

    try {
        const response = await fetch(`${API_LgRgt_URL}register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                username,
                email,
                password,
                name
            })
        });

        const data = await response.json();

        if (response.ok) {
            showToast('success', 'Thành công!', data.message || 'Đăng ký thành công! Vui lòng đăng nhập.');
            window.location.href = window.APP_CONFIG.BASE_PATH + 'Pages/Components/Login_Register_ForgotPW/login.html';
        } else {
            if (data && data.error) {
                showToast('warning', 'Đăng ký không thành công', data.error);
            } else {
                showToast('error', 'Lỗi', 'Đăng ký thất bại. Vui lòng thử lại.');
            }
        }
    } catch (error) {
        console.error('Lỗi đăng ký:', error);
        showToast('error', 'Lỗi hệ thống', 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền.');
    }
}

async function handleForgotPassword(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;

    try {
        const response = await fetch(`${API_LgRgt_URL}forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                email: email
            })
        });

        const text = await response.text();
        let data = {};
        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            console.warn("Phản hồi không phải JSON:", text);
        }

        if (!response.ok) {
            throw new Error(data?.error || 'Không thể gửi yêu cầu đặt lại mật khẩu');
        }

        showToast('success', 'Thành công!',  'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.');
        window.location.href = window.APP_CONFIG.BASE_PATH + 'Pages/Components/Login_Register_ForgotPW/login.html';
    } catch (error) {
        console.error('Lỗi quên mật khẩu:', error);
        showToast('error', 'Lỗi','Lỗi: ' + error.message);
    }
}

async function handleResetPassword(event) {
    event.preventDefault();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Lấy token từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        showToast('warning', 'Cảnh báo', 'Token không hợp lệ');
        window.location.href = window.APP_CONFIG.BASE_PATH + 'Pages/Components/Login_Register_ForgotPW/login.html';
        return;
    }

    if (newPassword !== confirmPassword) {
        showToast('warning', 'Cảnh báo', 'Mật khẩu không khớp!');
        return;
    }

    try {
        const response = await fetch(`${API_LgRgt_URL}reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                token: token,
                newPassword: newPassword
            })
        });

        const text = await response.text();
        let data = {};
        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            console.warn("Phản hồi không phải JSON:", text);
        }

        if (!response.ok) {
            throw new Error(data?.error || 'Không thể đặt lại mật khẩu');
        }

        showToast('success', 'Thành công!',  'Mật khẩu đã được đặt lại thành công!');
        window.location.href = window.APP_CONFIG.BASE_PATH + 'Pages/Components/Login_Register_ForgotPW/login.html';
    } catch (error) {
        console.error('Lỗi đặt lại mật khẩu:', error);
        showToast('error', 'Lỗi','Lỗi: ' + error.message);
    }
}

// Kiểm tra token khi trang reset password được mở
async function checkResetToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        localStorage.removeItem("token");
        showToast('warning', 'Cảnh báo', 'Token không hợp lệ hoặc đã hết hạn');
        window.location.href = window.APP_CONFIG.BASE_PATH + 'Pages/Components/Login_Register_ForgotPW/login.html';
        return;
    }

    try {
        const response = await fetch(`${API_LgRgt_URL}verify-reset-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                token: token
            })
        });

        if (!response.ok) {
            localStorage.removeItem("token");
            throw new Error('Token không hợp lệ hoặc đã hết hạn');
        }
    } catch (error) {
        localStorage.removeItem("token");
        console.error('Lỗi xác thực token:', error);
        showToast('error', 'Lỗi',error.message);
        window.location.href = window.APP_CONFIG.BASE_PATH + 'Pages/Components/Login_Register_ForgotPW/login.html';
    }
}

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Add event listener for login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        // Thêm xử lý username chữ thường và không cho phép dấu cách
        const usernameInput = document.getElementById('username');
        if (usernameInput) {
            usernameInput.addEventListener('input', function () {
                this.value = this.value.toLowerCase().replace(/\s+/g, '');
            });
        }
    }

    // Add event listener for registration form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        // Thêm xử lý username chữ thường và không cho phép dấu cách
        const usernameInput = document.getElementById('username');
        if (usernameInput) {
            usernameInput.addEventListener('input', function () {
                this.value = this.value.toLowerCase().replace(/\s+/g, '');
            });
        }
    }

    // Thêm event listener cho form quên mật khẩu
    const forgotPWForm = document.getElementById('forgotPWForm');
    if (forgotPWForm) {
        forgotPWForm.addEventListener('submit', handleForgotPassword);
    }

    // Thêm event listener cho form đặt lại mật khẩu
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', handleResetPassword);
    }

    // Kiểm tra token nếu đang ở trang reset password
    if (window.location.pathname.includes('resetPassword.html')) {
        checkResetToken();
    }
});
