function initializeActivityChart() {
//    const ctx = document.getElementById('activityChart').getContext('2d');
//    new Chart(ctx, {
//        type: 'line',
//        data: {
//            labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
//            datasets: [{
//                label: 'Lượt học',
//                data: [65, 59, 80, 81, 56, 55, 40],
//                fill: false,
//                borderColor: '#4a90e2',
//                tension: 0.1
//            }]
//        },
//        options: {
//            responsive: true,
//            plugins: {
//                legend: {
//                    position: 'top',
//                }
//            }
//        }
//    });
}

function initializeCourseChart(stats) {
    const ctx = document.getElementById('courseChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Tất cả','Quản trị viên', 'Nhân viên', 'Người dùng'],
            datasets: [{
                label: 'Số học viên',
                data: [stats.totalAlls, stats.totalAdmins, stats.totalStaffs, stats.totalUsers],
                backgroundColor: '#4a90e2'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
}

async function loadDashboardData() {
    try {
        // Lấy thông tin người dùng hiện tại
        const userInfo = await window.USER_API.fetchUserInfo();
        if (!userInfo) {
            throw new Error('Không thể lấy thông tin người dùng');
        }

        // Cập nhật tên người dùng và vai trò
        document.getElementById('user-name').textContent = userInfo.name || 'User';
        document.getElementById('role-badge').textContent = userInfo.group_user_id === 1 ? 'Admin' : 'Staff';

        // Lấy tất cả thống kê
        const stats = await homeAPI.getAllStatistics();
        
        // Cập nhật các số liệu
        document.getElementById('total-students').textContent = stats.totalUsers;
        document.getElementById('total-courses').textContent = stats.totalPosts;
        document.getElementById('total-vocabularyV').textContent = stats.totalWordsVi;
        document.getElementById('total-vocabularyE').textContent = stats.totalWordsEn;
        
        // Nếu là admin, hiển thị thêm thông tin
        if (userInfo.group_user_id === 1) {
            document.getElementById('admin-section').style.display = 'block';
            document.getElementById('total-staff').textContent = stats.totalStaffs;
        } else {
            document.getElementById('admin-section').style.display = 'none';
        }

        // Khởi tạo biểu đồ
        initializeActivityChart();
        initializeCourseChart(stats);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('error', 'Lỗi',  'Có lỗi xảy ra khi tải dữ liệu: ' + error.message);
    }
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
});

function switchRole(role) {
    localStorage.setItem('role', role);

    // Cập nhật giao diện dashboard
    const roleBadge = document.getElementById('role-badge');
    const adminSection = document.getElementById('admin-section');
    if (role === '1') {
        roleBadge.textContent = 'Admin';
        adminSection.style.display = 'block';
    } else if (role === '3') {
        roleBadge.textContent = 'Staff';
        adminSection.style.display = 'none';
    }

    // Gọi lại loadSidebar để cập nhật sidebar ngay lập tức
    if (window.loadSidebar) window.loadSidebar();
}

