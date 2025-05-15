// File: ../../Javascript/Admin/staffuserManagerment.js

// Định nghĩa các vai trò người dùng
const ROLE_MAP = {
    1: "Admin",
    3: "Nhân viên",
    2: "User" // Hoặc "Người dùng" tùy theo hiển thị mong muốn
};

// Biến cục bộ cho việc phân trang và tìm kiếm
let currentPage = 1;
const pageSize = 10; // Số lượng người dùng trên mỗi trang
let totalPages = 1;
let currentRoleFilter = 0; // 0 nghĩa là tất cả vai trò
let currentKeyword = "";

// DOM Elements
const searchInput = document.getElementById('searchInput');
const roleFilterSelect = document.getElementById('roleFilter'); // Đổi tên biến để rõ ràng hơn
const searchBtn = document.getElementById('searchBtn');
const addUserBtn = document.getElementById('addUserBtn');
const userTableBody = document.getElementById('userTableBody');
const paginationContainer = document.getElementById('pagination'); // Đổi tên biến để rõ ràng hơn
const changePasswordModal = document.getElementById('changePasswordModal');
const editUserModal = document.getElementById('editUserModal');

// Khởi tạo khi DOM đã tải xong
document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra xem staffUserAPI đã được nạp từ staffuserManagermentAPI.js chưa
    if (typeof staffUserAPI === 'undefined') {
        console.error('LỖI: staffUserAPI chưa được nạp. Kiểm tra thứ tự script trong HTML.');
        alert('Lỗi nghiêm trọng: Không thể tải module API. Vui lòng kiểm tra console.');
        return;
    }
    if (typeof window.APP_CONFIG === 'undefined' || typeof window.APP_CONFIG.API_BASE_URL === 'undefined') {
        console.error('LỖI: APP_CONFIG hoặc API_BASE_URL chưa được định nghĩa. Kiểm tra config.js.');
        alert('Lỗi cấu hình: API base URL không được tìm thấy.');
        return;
    }
    loadUsers();
    setupEventListeners();
});

/**
 * Thiết lập các trình nghe sự kiện cho các element trên trang.
 */
function setupEventListeners() {
    // Nút tìm kiếm
    searchBtn.addEventListener('click', () => {
        currentPage = 1;
        currentKeyword = searchInput.value.trim();
        currentRoleFilter = parseInt(roleFilterSelect.value);
        loadUsers();
    });

    // Tìm kiếm khi nhấn Enter trong ô input
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchBtn.click();
        }
    });

    // Thay đổi bộ lọc vai trò
    roleFilterSelect.addEventListener('change', () => {
        currentPage = 1;
        currentRoleFilter = parseInt(roleFilterSelect.value);
        loadUsers();
    });

    // Nút thêm người dùng mới
    addUserBtn.addEventListener('click', () => {
        // Giả sử bạn có một trang addStaffUser.html để thêm người dùng
        // Đường dẫn này cần khớp với cấu trúc thư mục của bạn
        window.location.href = '../Admin/addStaffUser.html'; 
    });

    // Nút đóng cho các modal
    document.querySelectorAll('.modal .close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Đóng modal khi nhấp chuột bên ngoài nội dung modal
    window.addEventListener('click', (e) => {
        if (e.target === changePasswordModal) changePasswordModal.style.display = 'none';
        if (e.target === editUserModal) editUserModal.style.display = 'none';
    });

    // Xử lý submit form đổi mật khẩu
    document.getElementById('changePasswordForm').addEventListener('submit', handleChangePassword);
    // Xử lý submit form sửa thông tin người dùng
    document.getElementById('editUserForm').addEventListener('submit', handleEditUser);
}

/**
 * Tải danh sách người dùng từ API và hiển thị lên bảng.
 */
async function loadUsers() {
    try {
        console.log('Đang tải người dùng với các tham số:', { page: currentPage, pageSize, groupUserId: currentRoleFilter, keyword: currentKeyword });
        // Gọi hàm từ staffUserAPI (được nạp từ staffuserManagermentAPI.js)
        const data = await staffUserAPI.fetchUserList({
            page: currentPage,
            pageSize: pageSize,
            groupUserId: currentRoleFilter,
            keyword: currentKeyword
        });
        
        if (!data || !data.users) {
            console.warn('Không có dữ liệu người dùng trả về từ API hoặc cấu trúc dữ liệu không đúng.');
            userTableBody.innerHTML = '<tr><td colspan="6">Không tìm thấy người dùng.</td></tr>';
            totalPages = 0;
        } else {
            renderUserTable(data.users);
            totalPages = data.totalPages;
        }
        renderPagination(totalPages);

    } catch (error) {
        console.error('Lỗi khi tải danh sách người dùng:', error);
        userTableBody.innerHTML = `<tr><td colspan="6">Lỗi khi tải dữ liệu: ${error.message}. Vui lòng thử lại.</td></tr>`;
        renderPagination(0); // Không có trang nào nếu lỗi
        // Không nên dùng alert ở đây vì có thể gây khó chịu, log lỗi là đủ
    }
}

/**
 * Hiển thị dữ liệu người dùng lên bảng.
 * @param {Array<object>} users - Mảng các đối tượng người dùng.
 */
function renderUserTable(users) {
    if (!users || users.length === 0) {
        userTableBody.innerHTML = '<tr><td colspan="6">Không có người dùng nào phù hợp.</td></tr>';
        return;
    }

    userTableBody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.username || "N/A"}</td>
            <td>${user.name || "N/A"}</td>
            <td>${user.email || "N/A"}</td>
            <td>${ROLE_MAP[user.group_user_id] || "Không xác định"}</td>
            <td class="action-buttons">
                <button class="action-btn edit" title="Sửa" onclick='openEditModal(${JSON.stringify(user)})'>
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn password" title="Đổi mật khẩu" onclick="openChangePasswordModal(${user.id})">
                    <i class="fas fa-key"></i>
                </button>
                <button class="action-btn delete" title="Xóa" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join("");
}

/**
 * Hiển thị các nút phân trang.
 * @param {number} totalPagesParam - Tổng số trang.
 */
function renderPagination(totalPagesParam) {
    totalPages = totalPagesParam; // Cập nhật biến global totalPages
    let paginationHTML = '';

    if (totalPages <= 0) {
        paginationContainer.innerHTML = ''; // Xóa phân trang nếu không có trang nào
        return;
    }

    // Nút Previous
    paginationHTML += `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} title="Trang trước">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    // Logic hiển thị các nút số trang (có thể cải thiện để hiển thị dấu "...")
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
        endPage = Math.min(totalPages, 5);
    }
    if (currentPage > totalPages - 3) {
        startPage = Math.max(1, totalPages - 4);
    }
    
    if (startPage > 1) {
        paginationHTML += `<button onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<button disabled>...</button>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button onclick="changePage(${i})" class="${i === currentPage ? 'active' : ''}">
                ${i}
            </button>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<button disabled>...</button>`;
        }
        paginationHTML += `<button onclick="changePage(${totalPages})">${totalPages}</button>`;
    }
    

    // Nút Next
    paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} title="Trang sau">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    paginationContainer.innerHTML = paginationHTML;
}

/**
 * Chuyển trang khi người dùng nhấp vào nút phân trang.
 * @param {number} pageNumber - Số trang muốn chuyển đến.
 */
function changePage(pageNumber) {
    if (pageNumber < 1 || pageNumber > totalPages || pageNumber === currentPage) return;
    currentPage = pageNumber;
    loadUsers();
}

/**
 * Mở modal đổi mật khẩu.
 * @param {number|string} userId - ID của người dùng.
 */
function openChangePasswordModal(userId) {
    document.getElementById('changePasswordUserId').value = userId;
    document.getElementById('newPassword').value = ''; // Xóa mật khẩu cũ
    changePasswordModal.style.display = 'block';
    document.getElementById('newPassword').focus();
}

/**
 * Xử lý sự kiện submit form đổi mật khẩu.
 * @param {Event} e - Sự kiện submit.
 */
async function handleChangePassword(e) {
    e.preventDefault();
    const userId = document.getElementById('changePasswordUserId').value;
    const newPassword = document.getElementById('newPassword').value;

    if (!newPassword || newPassword.length < 6) { // Ví dụ: yêu cầu mật khẩu tối thiểu 6 ký tự
        alert('Mật khẩu mới phải có ít nhất 6 ký tự.');
        return;
    }

    try {
        // Gọi hàm từ staffUserAPI
        const result = await staffUserAPI.changePassword(userId, newPassword);
        alert(result.message || 'Đổi mật khẩu thành công!');
        changePasswordModal.style.display = 'none';
        document.getElementById('changePasswordForm').reset();
    } catch (error) {
        console.error('Lỗi khi đổi mật khẩu:', error);
        alert('Lỗi khi đổi mật khẩu: ' + error.message);
    }
}

/**
 * Mở modal sửa thông tin người dùng và điền dữ liệu.
 * @param {object} user - Đối tượng người dùng chứa thông tin chi tiết.
 */
function openEditModal(user) { // Nhận toàn bộ đối tượng user
    if (!user) {
        alert('Không thể tải thông tin người dùng để sửa.');
        return;
    }
    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUsername').value = user.username || '';
    document.getElementById('editEmail').value = user.email || '';
    document.getElementById('editName').value = user.name || '';
    document.getElementById('editRole').value = user.group_user_id; // group_user_id từ API
    document.getElementById('editAvatar').value = user.avatar || '';

    editUserModal.style.display = 'block';
}

/**
 * Xử lý sự kiện submit form sửa thông tin người dùng.
 * @param {Event} e - Sự kiện submit.
 */
async function handleEditUser(e) {
    e.preventDefault();
    const userData = {
        id: document.getElementById('editUserId').value,
        username: document.getElementById('editUsername').value.trim(),
        email: document.getElementById('editEmail').value.trim(),
        name: document.getElementById('editName').value.trim(),
        role_id: parseInt(document.getElementById('editRole').value), // role_id cho API
        avatar: document.getElementById('editAvatar').value.trim()
    };

    if (!userData.username || !userData.email || !userData.name) {
        alert('Username, Email và Tên không được để trống.');
        return;
    }

    try {
        console.log('Đang cập nhật người dùng với dữ liệu:', userData);
        // Gọi hàm từ staffUserAPI
        const result = await staffUserAPI.updateUser(userData);
        alert(result.message || 'Cập nhật thông tin người dùng thành công!');
        editUserModal.style.display = 'none';
        await loadUsers(); // Tải lại danh sách người dùng sau khi cập nhật
    } catch (error) {
        console.error('Lỗi khi cập nhật thông tin người dùng:', error);
        alert('Lỗi khi cập nhật thông tin: ' + error.message);
    }
}

/**
 * Xóa người dùng sau khi xác nhận.
 * @param {number|string} userId - ID của người dùng cần xóa.
 */
async function deleteUser(userId) {
    if (!confirm(`Bạn có chắc chắn muốn xóa người dùng có ID: ${userId}?`)) return;

    try {
        // Gọi hàm từ staffUserAPI
        const result = await staffUserAPI.deleteUser(userId);
        alert(result.message || 'Xóa người dùng thành công!');
        // Tải lại danh sách người dùng, có thể cần điều chỉnh currentPage nếu trang hiện tại trống sau khi xóa
        if (userTableBody.rows.length === 1 && currentPage > 1) {
             currentPage--; // Nếu xóa item cuối cùng của trang và không phải trang đầu, lùi về trang trước
        }
        await loadUsers();
    } catch (error) {
        console.error('Lỗi khi xóa người dùng:', error);
        alert('Lỗi khi xóa người dùng: ' + error.message);
    }
}

// Các hàm global (nếu có) để các inline onclick có thể gọi được
window.openEditModal = openEditModal;
window.openChangePasswordModal = openChangePasswordModal;
window.deleteUser = deleteUser;
window.changePage = changePage;
