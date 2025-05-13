// document.addEventListener('DOMContentLoaded', function() {
//     // Get user role and name from localStorage
//     const role = localStorage.getItem('role');
//     const userName = localStorage.getItem('name');
    
//     // Update welcome message and role badge
//     document.getElementById('user-name').textContent = userName || 'User';
//     document.getElementById('role-badge').textContent = role === '1' ? 'Admin' : 'Staff';
    
//     // Show/hide admin section
//     if (role === '1') {
//         document.getElementById('admin-section').style.display = 'block';
//     }

//     // Initialize charts
//     initializeActivityChart();
//     initializeCourseChart();

//     // Load dashboard data
//     loadDashboardData();
// });

function initializeActivityChart() {
    const ctx = document.getElementById('activityChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
            datasets: [{
                label: 'Lượt học',
                data: [65, 59, 80, 81, 56, 55, 40],
                fill: false,
                borderColor: '#4a90e2',
                tension: 0.1
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

function initializeCourseChart() {
    const ctx = document.getElementById('courseChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Khóa A', 'Khóa B', 'Khóa C', 'Khóa D'],
            datasets: [{
                label: 'Số học viên',
                data: [12, 19, 3, 5],
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
        // Dữ liệu test
        const testData = {
            students: '150',
            courses: '8',
            vocabulary: '1,200',
            completionRate: '75%',
            staff: '5',
            topStudents: [
                { name: 'Nguyễn Văn A', progress: '95%' },
                { name: 'Trần Thị B', progress: '92%' },
                { name: 'Lê Văn C', progress: '88%' }
            ],
            recentStaff: [
                { name: 'Nguyễn Văn Nhân', lastActive: '5 phút trước' },
                { name: 'Trần Thị Nhân', lastActive: '10 phút trước' },
                { name: 'Lê Văn Nhân', lastActive: '15 phút trước' }
            ]
        };

        // Cập nhật các số liệu
        document.getElementById('total-students').textContent = testData.students;
        document.getElementById('total-courses').textContent = testData.courses;
        document.getElementById('total-vocabulary').textContent = testData.vocabulary;
        document.getElementById('completion-rate').textContent = testData.completionRate;
        
        if (localStorage.getItem('Role') === '1') {
            document.getElementById('total-staff').textContent = testData.staff;
            // Hiển thị danh sách nhân viên gần đây
            const staffList = document.getElementById('recent-staff-list');
            staffList.innerHTML = testData.recentStaff.map(staff => `
                <div class="staff-card">
                    <h3>${staff.name}</h3>
                    <p>Hoạt động: ${staff.lastActive}</p>
                </div>
            `).join('');
        }
        
        // Hiển thị danh sách học viên nổi bật
        const studentsList = document.getElementById('top-students-list');
        studentsList.innerHTML = testData.topStudents.map(student => `
            <div class="student-card">
                <h3>${student.name}</h3>
                <p>Tiến độ: ${student.progress}</p>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

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

