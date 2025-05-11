document.addEventListener('DOMContentLoaded', function() {
    const sidebarDiv = document.getElementById('sidebar');
    if (!sidebarDiv) return;
    const token = localStorage.getItem('token');
    if (!token) {
        sidebarDiv.style.display = 'none';
        return;
    }
    // Đảm bảo fetchUserInfo đã có trên window
    function waitForFetchUserInfo(cb, tries = 10) {
        if (typeof window.fetchUserInfo === 'function') {
            cb();
        } else if (tries > 0) {
            setTimeout(() => waitForFetchUserInfo(cb, tries - 1), 100);
        } else {
            sidebarDiv.style.display = 'none';
        }
    }
    waitForFetchUserInfo(async () => {
        const userInfo = await window.fetchUserInfo();
        if (!userInfo || !userInfo.group_user_id) {
            sidebarDiv.style.display = 'none';
            return;
        }
        // Chỉ load sidebar cho admin (1) và staff (3)
        if (userInfo.group_user_id === 1 || userInfo.group_user_id === 3) {
            fetch('/Pages/Components/Layouts/sideBar.html')
                .then(response => response.text())
                .then(data => {
                    sidebarDiv.innerHTML = data;
                    updateSidebarContent(userInfo);
                    sidebarDiv.style.display = '';
                });
        } else {
            sidebarDiv.style.display = 'none';
        }
    });
});

function updateSidebarContent(userInfo) {
    // Update user profile section
    const sidebarUserName = document.getElementById('sidebar-user-name');
    if (sidebarUserName) sidebarUserName.textContent = userInfo.name || 'User';
    const avatarImg = document.getElementById('user-avatar');
    if (avatarImg && userInfo.avatar) avatarImg.src = userInfo.avatar;
    // Update menu visibility
    const staffSection = document.querySelector('.staff-only');
    const adminSection = document.querySelector('.admin-only');
    if (staffSection && adminSection) {
        if (userInfo.group_user_id === 1) {
            staffSection.style.display = 'block';
            adminSection.style.display = 'block';
        } else if (userInfo.group_user_id === 3) {
            staffSection.style.display = 'block';
            adminSection.style.display = 'none';
        } else {
            staffSection.style.display = 'none';
            adminSection.style.display = 'none';
        }
    }
}

function logOut() {
    localStorage.clear();
    window.location.href = '/Pages/Components/Login_Register_ForgotPW/login.html';
}