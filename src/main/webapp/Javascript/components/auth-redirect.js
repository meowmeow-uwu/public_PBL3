async function checkAuthAndRedirect() {
    try {
        const user = await window.fetchUserInfo();
        const path = window.location.pathname;

console.log(path);
        if (!user) {
            alert("Không thể tải dữ liệu của tài khoản, vui lòng đăng nhập lại.");
            localStorage.clear();
            window.location.href = window.APP_CONFIG.BASE_PATH + 'Pages/Components/Login_Register_ForgotPW/login.html';
            return;
        }

        if (path.startsWith('/PBL3/Pages/Staff') && user.group_user_id === 2) {
            window.location.href = window.APP_CONFIG.BASE_PATH + 'Pages/User/home.html';
            return;
        }

        if (path.startsWith('/PBL3/Pages/Admin') && user.group_user_id !== 1) {
            if (user.group_user_id === 2) {
                window.location.href = window.APP_CONFIG.BASE_PATH + 'Pages/User/home.html';
            } else if (user.group_user_id === 3) {
                window.location.href = window.APP_CONFIG.BASE_PATH + 'Pages/Staff/home.html';
            }
            return;
        }

        if (path.startsWith('/PBL3/Pages/User') && (user.group_user_id === 1 || user.group_user_id === 3)) {
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
