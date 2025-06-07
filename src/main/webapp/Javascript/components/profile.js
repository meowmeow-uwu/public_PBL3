document.addEventListener('DOMContentLoaded', async function() {
    
    // Lấy thông tin user qua API đã chuẩn hóa
    let userInfo = null;
    try {
        userInfo = await window.USER_API.fetchUserInfo();
    } catch (error) {
        showToast('error', 'Lỗi',error.message || 'Không thể lấy thông tin người dùng');
        return;
    }

    // Xử lý hiển thị sidebar/header dựa trên role
    const headerDiv = document.getElementById('header');
    const footerDiv = document.getElementById('footer');
    const sidebarDiv = document.getElementById('sidebar');
    const profileContainer = document.querySelector('.profile-container');

    if (userInfo.group_user_id === 1 || userInfo.group_user_id === 3) {
        // Admin hoặc Staff - chỉ hiển thị sidebar, xóa header/footer
        if (headerDiv) headerDiv.remove();
        if (footerDiv) footerDiv.remove();
        if (sidebarDiv) sidebarDiv.style.display = '';
        if (profileContainer) profileContainer.classList.add('profile-has-sidebar');
    } else {
        // User thường - hiển thị header/footer, ẩn sidebar
        if (headerDiv) headerDiv.style.display = '';
        if (sidebarDiv) sidebarDiv.style.display = 'none';
        if (profileContainer) profileContainer.classList.remove('profile-has-sidebar');
    }

    // Hiển thị thông tin user lên form
    updateProfileInfo(userInfo);

    // Thêm event listener để cập nhật avatar preview khi URL thay đổi
    document.getElementById('avatar').addEventListener('input', function(e) {
        const avatarImg = document.getElementById('avatarImg');
        if (e.target.value) {
            avatarImg.src = e.target.value;
        } else {
            avatarImg.src = window.APP_CONFIG.BASE_PATH + 'Assets/Imgs/avatarUser.jpg';
        }
    });

    // Đổi mật khẩu
    document.getElementById('changePasswordForm').onsubmit = async function(e) {
        e.preventDefault();
        const oldPassword = document.getElementById('oldpassword').value;
        const newPassword = document.getElementById('newpassword').value;
        const confirmPassword = document.getElementById('renewpassword').value;
        // alert(oldPassword+'-'+newPassword+'-'+confirmPassword);
        if (newPassword !== confirmPassword) {
            showToast('warning', 'Cảnh báo', 'Mật khẩu mới không khớp!');
            return;
        }

        try {
            await window.USER_API.updatePassword(oldPassword, newPassword);
            showToast('success', 'Thành công!',  'Đổi mật khẩu thành công!');
            closeChangePassword();
        } catch (error) {
            showToast('error', 'Lỗi',error.message || 'Có lỗi xảy ra khi đổi mật khẩu');
        }
    };

    // Cập nhật thông tin cá nhân
    document.getElementById('profileForm').onsubmit = async function(e) {
        e.preventDefault();
        const name = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const avatar = document.getElementById('avatar').value;
        try {
            await window.USER_API.updateProfile({ name, avatar, email });
            showToast('success', 'Thành công!',  'Cập nhật thông tin thành công!');
        } catch (error) {
            showToast('error', 'Lỗi',error.message || 'Có lỗi xảy ra khi cập nhật thông tin cá nhân');
        }
    };
    setupPasswordVisibilityToggle();
});

function updateProfileInfo(userInfo) {
    // Cập nhật avatar
    const avatarImg = document.getElementById('avatarImg');
    if (userInfo.avatar) {
        avatarImg.src = userInfo.avatar;
    } else {
        avatarImg.src = window.APP_CONFIG.BASE_PATH + 'Assets/Imgs/avatarUser.jpg';
    }
    
    // Cập nhật các thông tin khác
    document.getElementById('username').value = userInfo.username || '';
    document.getElementById('fullName').value = userInfo.name || '';
    document.getElementById('email').value = userInfo.email || '';
    document.getElementById('avatar').value = userInfo.avatar || '';
}

// Hàm mở/đóng modal đổi mật khẩu
function openChangePassword() {
    document.getElementById('changePasswordModal').style.display = 'block';
}

function closeChangePassword() {
    document.getElementById('changePasswordModal').style.display = 'none';
}
function setupPasswordVisibilityToggle() {
    const togglePasswordText = document.getElementById('togglePasswordText');
    // Lấy đúng ID của INPUT mật khẩu từ HTML
    const oldpassword = document.getElementById('oldpassword');
    const newpassword = document.getElementById('newpassword');
    const renewpassword = document.getElementById('renewpassword');

    if (togglePasswordText && newpassword && renewpassword && oldpassword) {
        togglePasswordText.addEventListener('click', function () {
            const type = oldpassword.getAttribute('type') === 'password' ? 'text' : 'password';
            const type1 = newpassword.getAttribute('type') === 'password' ? 'text' : 'password';
            const type2 = renewpassword.getAttribute('type') === 'password' ? 'text' : 'password';
            oldpassword.setAttribute('type', type);
            newpassword.setAttribute('type', type1);
            renewpassword.setAttribute('type', type2);
            this.textContent = type === 'password' ? 'Hiện mật khẩu' : 'Ẩn mật khẩu';
        });
    } else {
        // Nếu một trong hai phần tử không tìm thấy, thông báo lỗi trong console
        if (!togglePasswordText) {
            console.error("Lỗi: Không tìm thấy phần tử với ID 'togglePasswordText'. Hãy kiểm tra lại HTML.");
        }
        if (!oldpassword) {
            console.error("Lỗi: Không tìm thấy phần tử với ID 'password'. Hãy kiểm tra lại HTML.");
        }
        if (!renewpassword) {
            console.error("Lỗi: Không tìm thấy phần tử với ID 'repassword'. Hãy kiểm tra lại HTML.");
        }
    }
}