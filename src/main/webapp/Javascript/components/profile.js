document.addEventListener('DOMContentLoaded', async function() {
    // Đảm bảo đã load getInfor.js
    function waitForFetchUserInfo(cb, tries = 10) {
        if (typeof window.fetchUserInfo === 'function') {
            cb();
        } else if (tries > 0) {
            setTimeout(() => waitForFetchUserInfo(cb, tries - 1), 100);
        }
    }
    waitForFetchUserInfo(async () => {
        const userInfo = await window.fetchUserInfo();
        if (!userInfo || !userInfo.group_user_id) return;
        // Gán thông tin lên form
        document.getElementById('avatarImg').src = userInfo.avatar || '/assets/images/default-avatar.png';
        document.getElementById('fullName').value = userInfo.name || '';
        document.getElementById('email').value = userInfo.email || '';
        document.getElementById('phone').value = userInfo.phone || '';
        document.getElementById('dob').value = userInfo.dob || '';
        document.getElementById('gender').value = userInfo.gender || '';
        // Ẩn/hiện các trường chỉ dành cho user
        document.querySelectorAll('.only-user').forEach(el => {
            el.style.display = (userInfo.group_user_id === 2) ? '' : 'none';
        });
        // Nếu là user (2): chỉ hiện header/footer, ẩn sidebar
        if (userInfo.group_user_id === 2) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.style.display = 'none';
        } else {
            // Nếu là admin/staff: hiện sidebar, ẩn header/footer nếu muốn
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.style.display = '';
        }
        if (userInfo.group_user_id !== 2) {
            document.getElementById('header').style.display = 'none';
            document.getElementById('footer').style.display = 'none';
        }
    });

    // Đổi ảnh đại diện (giả lập preview)
    document.getElementById('avatarInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                document.getElementById('avatarImg').src = evt.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Đổi mật khẩu modal
    window.openChangePassword = function() {
        document.getElementById('changePasswordModal').style.display = 'block';
    }
    window.closeChangePassword = function() {
        document.getElementById('changePasswordModal').style.display = 'none';
    }
    document.getElementById('changePasswordForm').onsubmit = function(e) {
        e.preventDefault();
        alert('Đổi mật khẩu thành công (giả lập)');
        window.closeChangePassword();
    };
});
