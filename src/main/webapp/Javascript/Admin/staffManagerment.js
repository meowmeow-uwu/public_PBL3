let staff = [];
let staffPerPage = 10;
let currentStaffPage = 1;

// Lấy danh sách nhân viên từ API (role_id = 3)
async function loadStaff() {
    try {
        const data = await getUserListByRole(3); // 3 là role_id của nhân viên
        staff = data.map((item, idx) => ({
            id: item.user.user_id,
            code: item.user.code || `NV${String(idx + 1).padStart(3, '0')}`,
            name: item.user.name,
            email: item.account ? item.account.email : '(chưa có tài khoản)',
            username: item.account ? item.account.username : '(chưa có tài khoản)',
            phone: item.user.phone || '',
            role: 'Nhân viên', // hoặc lấy từ item.user.role nếu có
            status: item.user.status || 'active',
            created: item.user.created || '',
            createdBy: item.user.createdBy || ''
        }));
        renderStaffTable();
        renderStaffPagination();
    } catch (err) {
        alert('Không thể tải danh sách nhân viên!');
    }
}

function renderStaffTable() {
    const tbody = document.querySelector('#staffTable tbody');
    const start = (currentStaffPage - 1) * staffPerPage;
    const end = start + staffPerPage;
    const pageData = staff.slice(start, end);

    tbody.innerHTML = pageData.map((s, idx) => `
        <tr>
            <td>${start + idx + 1}</td>
            <td>${s.code}</td>
            <td>${s.name}</td>
            <td>${s.email}</td>
            <td>${s.role}</td>
            <td>
                <span class="status-badge ${s.status === 'active' ? 'status-active' : 'status-locked'}">
                    ${s.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                </span>
            </td>
            <td>
                <button class="action-btn" title="Chỉnh sửa" onclick="showEdit(${s.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn ${s.status === 'active' ? 'lock' : 'unlock'}" 
                        title="${s.status === 'active' ? 'Khóa' : 'Mở khóa'}" 
                        onclick="toggleLock(${s.id})">
                    <i class="fas fa-${s.status === 'active' ? 'lock' : 'unlock'}"></i>
                </button>
                <button class="action-btn delete" title="Xóa" onclick="deleteStaff(${s.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function searchStaff() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;
    const role = document.getElementById('roleFilter').value;

    const filtered = staff.filter(s =>
        (s.name.toLowerCase().includes(keyword) ||
         s.email.toLowerCase().includes(keyword) ||
         s.code.toLowerCase().includes(keyword)) &&
        (status === "" || s.status === status) &&
        (role === "" || s.role === role)
    );

    renderTable(filtered);
}

function showAdd() {
    document.getElementById('editContent').innerHTML = `
        <h2>Thêm nhân viên mới</h2>
        <form onsubmit="saveAdd(event)">
            <div class="form-group">
                <label>Họ tên:</label>
                <input type="text" id="addName" required>
            </div>
            <div class="form-group">
                <label>Email:</label>
                <input type="email" id="addEmail" required>
            </div>
            <div class="form-group">
                <label>Số điện thoại:</label>
                <input type="tel" id="addPhone" required>
            </div>
            <div class="form-group">
                <label>Mật khẩu:</label>
                <input type="password" id="addPassword" required>
            </div>
            <button type="submit" class="add-btn">Thêm nhân viên</button>
        </form>
    `;
    document.getElementById('editModal').style.display = 'flex';
}

async function saveAdd(e) {
    e.preventDefault();
    const data = {
        username: document.getElementById('addEmail').value,
        password: document.getElementById('addPassword').value,
        email: document.getElementById('addEmail').value,
        name: document.getElementById('addName').value,
        role_id: 3, // role_id nhân viên
        avatar: '',
        phone: document.getElementById('addPhone').value
    };
    try {
        const res = await createUser(data);
        if (res.message) {
            closeModal('editModal');
            loadStaff();
            alert('Thêm nhân viên thành công!');
        } else {
            alert(res.error || 'Có lỗi xảy ra!');
        }
    } catch (err) {
        alert('Lỗi khi thêm nhân viên!');
    }
}

function showEdit(id) {
    const s = staff.find(x => x.id === id);
    if (!s) return;

    document.getElementById('editContent').innerHTML = `
        <h2>Chỉnh sửa thông tin nhân viên</h2>
        <form onsubmit="saveEdit(event, ${id})">
            <div class="form-group">
                <label>Mã nhân viên:</label>
                <input type="text" value="${s.code}" disabled>
            </div>
            <div class="form-group">
                <label>Họ tên:</label>
                <input type="text" id="editName" value="${s.name}" required>
            </div>
            <div class="form-group">
                <label>Email:</label>
                <input type="email" id="editEmail" value="${s.email}" required>
            </div>
            <div class="form-group">
                <label>Số điện thoại:</label>
                <input type="tel" id="editPhone" value="${s.phone}" required>
            </div>
            <div class="form-group">
                <label>Quyền:</label>
                <select id="editRole" required>
                    <option value="Nhân viên" ${s.role === 'Nhân viên' ? 'selected' : ''}>Nhân viên</option>
                    <option value="Quản lý" ${s.role === 'Quản lý' ? 'selected' : ''}>Quản lý</option>
                </select>
            </div>
            <div class="form-group">
                <label>Trạng thái:</label>
                <select id="editStatus" required>
                    <option value="active" ${s.status === 'active' ? 'selected' : ''}>Hoạt động</option>
                    <option value="locked" ${s.status === 'locked' ? 'selected' : ''}>Đã khóa</option>
                </select>
            </div>
            <button type="submit" class="add-btn">Lưu thay đổi</button>
        </form>
    `;
    document.getElementById('editModal').style.display = 'flex';
}

function saveEdit(e, id) {
    e.preventDefault();
    const s = staff.find(x => x.id === id);
    if (!s) return;

    s.name = document.getElementById('editName').value;
    s.email = document.getElementById('editEmail').value;
    s.phone = document.getElementById('editPhone').value;
    s.role = document.getElementById('editRole').value;
    s.status = document.getElementById('editStatus').value;

    closeModal('editModal');
    renderTable();
}

function toggleLock(id) {
    const s = staff.find(x => x.id === id);
    if (!s) return;

    if (confirm(`Bạn chắc chắn muốn ${s.status === 'active' ? 'khóa' : 'mở khóa'} tài khoản này?`)) {
        s.status = s.status === 'active' ? 'locked' : 'active';
        renderTable();
    }
}

function deleteStaff(id) {
    if (confirm('Bạn chắc chắn muốn xóa nhân viên này? Hành động này không thể hoàn tác.')) {
        // Nếu muốn gọi API xóa thì gọi ở đây, ví dụ: await deleteStaffAPI(id);
        const idx = staff.findIndex(x => x.id === id);
        if (idx > -1) staff.splice(idx, 1);
        // Nếu xóa hết trang hiện tại thì lùi về trang trước
        if ((currentStaffPage - 1) * staffPerPage >= staff.length && currentStaffPage > 1) {
            currentStaffPage--;
        }
        renderStaffTable();
        renderStaffPagination();
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function renderStaffPagination() {
    const totalPages = Math.ceil(staff.length / staffPerPage);
    const pagination = document.getElementById('staffPagination');
    if (!pagination) return;

    let html = '';
    html += `<button onclick="changeStaffPage(-1)" ${currentStaffPage === 1 ? 'disabled' : ''}>Trước</button>`;
    html += ` Trang ${currentStaffPage} / ${totalPages} `;
    html += `<button onclick="changeStaffPage(1)" ${currentStaffPage === totalPages ? 'disabled' : ''}>Sau</button>`;
    pagination.innerHTML = html;
}

function changeStaffPage(delta) {
    const totalPages = Math.ceil(staff.length / staffPerPage);
    currentStaffPage += delta;
    if (currentStaffPage < 1) currentStaffPage = 1;
    if (currentStaffPage > totalPages) currentStaffPage = totalPages;
    renderStaffTable();
    renderStaffPagination();
}

// Khởi tạo bảng khi load trang
document.addEventListener('DOMContentLoaded', () => {
    loadStaff();
});
