const API_LgRgt_URL = 'http://localhost:2005/PBL3/api/auth/';
const API_getIF_URL = 'http://localhost:2005/PBL3/api/user/me';

// Constants for user roles
const ROLES = {
    ADMIN: 1,
    USER: 2,
    STAFF: 3
};

// Constants for redirect paths
const REDIRECT_PATHS = {
    [ROLES.ADMIN]: '/Pages/Staff/home.html',
    [ROLES.USER]: '/Pages/User/home.html',
    [ROLES.STAFF]: '/Pages/Staff/home.html'
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
        }

        // Lưu token và thời gian hết hạn
        localStorage.setItem("token", data.token);
        if (data.expiresIn) {
            const expiresAt = new Date().getTime() + (data.expiresIn * 1000);
            localStorage.setItem("tokenExpiresAt", expiresAt);
        }

        console.log("Đăng nhập thành công");
        
        // Lấy thông tin user và chuyển hướng
        await fetchUserInfo();
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        alert("Lỗi: " + error.message);
    }
}

async function fetchUserInfo() {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("Không tìm thấy token trong localStorage.");
        alert("Bạn chưa đăng nhập hoặc token đã hết hạn.");
        window.location.href = '/Pages/Components/Layouts/login.html';
        return;
    }

    // // Kiểm tra token hết hạn
    // const expiresAt = localStorage.getItem("tokenExpiresAt");
    // if (expiresAt && new Date().getTime() > parseInt(expiresAt)) {
    //     console.error("Token đã hết hạn");
    //     localStorage.removeItem("token");
    //     localStorage.removeItem("tokenExpiresAt");
    //     alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    //     window.location.href = '/Pages/Components/Layouts/login.html';
    //     return;
    // }

    try {
        const response = await fetch(API_getIF_URL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        // {"name":"pcta","avatar":"https://imgur.com/a/Ne5GWsq.png","group_user_id":2}
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.warn("Phản hồi không phải JSON hợp lệ:", text);
            throw new Error("Server trả về dữ liệu không hợp lệ");
        }

        if (!response.ok) {
            throw new Error(data?.error || `Lỗi HTTP ${response.status}`);
        }

        // Lưu thông tin user vào localStorage
        // Chuyển hướng dựa trên role
        const role = data.group_user_id;
        const redirectPath = REDIRECT_PATHS[role];
        
        if (redirectPath) {
            window.location.href = redirectPath;
        } else {
            console.error("Role không hợp lệ:", role);
            alert("Không thể xác định quyền truy cập. Vui lòng liên hệ admin.");
        }

    } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error.message);
        alert("Lỗi khi lấy thông tin người dùng: " + error.message);
        // Nếu lỗi 401 (Unauthorized), chuyển về trang login
        if (error.message.includes("401")) {
            window.location.href = '/Pages/Components/Layouts/login.html';
        }
    }
}

async function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const name = document.getElementById('name').value;

    // Kiểm tra định dạng username - không cho phép dấu cách
    if (!/^[a-z0-9_]+$/.test(username) || username.includes(' ')) {
        alert('Username chỉ được chứa chữ thường, số và dấu gạch dưới, không được chứa dấu cách!');
        return;
    }

    // Kiểm tra mật khẩu khớp
    if (password !== confirmPassword) {
        alert('Mật khẩu không khớp!');
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

        const text = await response.text();
        let data = {};
        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            console.warn("Phản hồi không phải JSON:", text);
        }

        if (!response.ok) {
            throw new Error(data?.error || 'Đăng ký thất bại');
        }

        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        window.location.href = '/Pages/Components/Login_Register_ForgotPW/login.html';
    } catch (error) {
        console.error('Lỗi đăng ký:', error);
        alert('Lỗi: ' + error.message);
    }
}


// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener for login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        // Thêm xử lý username chữ thường và không cho phép dấu cách
        const usernameInput = document.getElementById('username');
        if (usernameInput) {
            usernameInput.addEventListener('input', function() {
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
            usernameInput.addEventListener('input', function() {
                this.value = this.value.toLowerCase().replace(/\s+/g, '');
            });
        }
    }
});
