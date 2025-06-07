
async function checkAuthAndRedirect() {
    const ADMIN = window.APP_CONFIG.ROLES.ADMIN;
    const USER = window.APP_CONFIG.ROLES.USER;
    const STAFF = window.APP_CONFIG.ROLES.STAFF;
    try {
        const user = await window.USER_API.fetchUserInfo();
        const path = window.location.pathname;

        console.log(path);
        console.log(USER);
        if (!user) {
            showToast('error', 'Lỗi',"Không thể tải dữ liệu của tài khoản, vui lòng đăng nhập lại.");
            localStorage.clear();
            window.location.href = window.APP_CONFIG.BASE_PATH + 'Pages/Components/Login_Register_ForgotPW/login.html';
            return;
        }

        const role = user.group_user_id;
        if (path == '/PBL3/Pages/Components/Html/translate.html' && (role == ADMIN || role == STAFF)) {
            window.location.href = window.APP_CONFIG.BASE_PATH + 'Pages/Staff/home.html';
            return;
        }
        if (path == '/PBL3/Pages/index.html' && (role == ADMIN || role == USER || role == STAFF)) {
            if (role == ADMIN || role == STAFF) {
                window.location.href = window.APP_CONFIG.BASE_PATH + 'Pages/Staff/home.html';
            } else if (role === USER) {
                window.location.href = window.APP_CONFIG.BASE_PATH + 'Pages/User/home.html';
            }
            return;
        }
        if (path.startsWith('/PBL3/Pages/Components/Login_Register_ForgotPW') && (role == ADMIN || role == USER || role == STAFF)) {
            if (role == ADMIN || role == STAFF) {
                window.location.href = window.APP_CONFIG.BASE_PATH + 'Pages/Staff/home.html';
            } else if (role === USER) {
                window.location.href = window.APP_CONFIG.BASE_PATH + 'Pages/User/home.html';
            }
            return;
        }
        if (path.startsWith('/PBL3/Pages/Staff') && role == USER) {
            window.location.href = window.APP_CONFIG.BASE_PATH + 'Pages/User/home.html';
            return;
        }

        if (path.startsWith('/PBL3/Pages/Admin') && role !== ADMIN) {
            if (role === USER) {
                window.location.href = window.APP_CONFIG.BASE_PATH + 'Pages/User/home.html';
            } else if (role === STAFF) {
                window.location.href = window.APP_CONFIG.BASE_PATH + 'Pages/Staff/home.html';
            }
            return;
        }

        if (path.startsWith('/PBL3/Pages/User') && (role === ADMIN || role === STAFF)) {
            window.location.href = window.APP_CONFIG.BASE_PATH + 'Pages/Staff/home.html';
            return;
        }

        // Thêm các xử lý khác nếu cần

    } catch (error) {
        console.error('Lỗi khi kiểm tra xác thực:', error);
        window.location.href = window.APP_CONFIG.BASE_PATH + 'Pages/Components/Login_Register_ForgotPW/login.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndRedirect();
});
