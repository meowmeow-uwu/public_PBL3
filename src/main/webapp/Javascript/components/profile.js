document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Lấy thông tin tài khoản
        const accountInfo = await getAccountInfo();
        
        // Cập nhật thông tin lên form
        document.getElementById('email').value = accountInfo.email || '';
        document.getElementById('username').value = accountInfo.username || '';

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

    } catch (error) {
        console.error('Lỗi khi khởi tạo trang profile:', error);
        alert('Có lỗi xảy ra khi tải thông tin tài khoản');
    }
});

// Hàm mở/đóng modal đổi mật khẩu
function openChangePassword() {
    document.getElementById('changePasswordModal').style.display = 'block';
}

function closeChangePassword() {
    document.getElementById('changePasswordModal').style.display = 'none';
}
