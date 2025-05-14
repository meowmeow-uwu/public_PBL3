document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = window.APP_CONFIG.BASE_PATH + 'Pages/Components/Login_Register_ForgotPW/login.html';
        return;
    }

    // Lấy thông tin user
    const userInfo = await window.fetchUserInfo();
    if (!userInfo) return;

    // Xử lý hiển thị sidebar/header dựa trên role
    const headerDiv = document.getElementById('header');
    const footerDiv = document.getElementById('footer');
    const sidebarDiv = document.getElementById('sidebar');
    const profileContainer = document.querySelector('.profile-container');

    if (userInfo.group_user_id === 1 || userInfo.group_user_id === 3) {
        // Admin hoặc Staff - chỉ hiển thị sidebar, xóa header
        if (headerDiv) headerDiv.remove(); // XÓA HẲN header khỏi DOM
        if (footerDiv) footerDiv.remove(); // XÓA HẲN footer khỏi DOM
        if (sidebarDiv) sidebarDiv.style.display = '';
        if (profileContainer) profileContainer.classList.add('profile-has-sidebar');
    } else {
        // User thường - hiển thị header/footer, ẩn sidebar
        if (headerDiv) headerDiv.style.display = '';
        if (sidebarDiv) sidebarDiv.style.display = 'none';
        if (profileContainer) profileContainer.classList.remove('profile-has-sidebar');
    }

    // Cập nhật thông tin profile
    updateProfileInfo(userInfo);

    // Xử lý form đổi mật khẩu
    document.getElementById('changePasswordForm').onsubmit = async function(e) {
        e.preventDefault();
        const oldPassword = this.querySelector('input[placeholder="Mật khẩu hiện tại"]').value;
        const newPassword = this.querySelector('input[placeholder="Mật khẩu mới"]').value;
        const confirmPassword = this.querySelector('input[placeholder="Nhập lại mật khẩu mới"]').value;

        if (newPassword !== confirmPassword) {
            alert('Mật khẩu mới không khớp!');
            return;
        }

        try {
            await updatePassword(oldPassword, newPassword);
            alert('Đổi mật khẩu thành công!');
            closeChangePassword();
        } catch (error) {
            alert(error.message || 'Có lỗi xảy ra khi đổi mật khẩu');
        }
    };

    // Xử lý form cập nhật email
    document.getElementById('profileForm').onsubmit = async function(e) {
        e.preventDefault();
        const newEmail = document.getElementById('email').value;

        try {
            await updateEmail(newEmail);
            alert('Cập nhật email thành công!');
        } catch (error) {
            alert(error.message || 'Có lỗi xảy ra khi cập nhật email');
        }
    };
});

function updateProfileInfo(userInfo) {
    // Cập nhật avatar
    const avatarImg = document.getElementById('avatarImg');
    if (avatarImg) {
        avatarImg.src = userInfo.avatar || window.APP_CONFIG.BASE_PATH + 'Assets/Images/default-avatar.png';
    }

    // Cập nhật các thông tin khác
    // ... (phần code cập nhật thông tin khác)
}

// Hàm mở/đóng modal đổi mật khẩu
function openChangePassword() {
    document.getElementById('changePasswordModal').style.display = 'block';
}

function closeChangePassword() {
    document.getElementById('changePasswordModal').style.display = 'none';
}
