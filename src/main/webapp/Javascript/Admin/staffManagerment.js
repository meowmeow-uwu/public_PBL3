let staff = [
    {
        id: 1,
        code: "NV001",
        name: "Nguyễn Văn A",
        email: "nv.a@example.com",
        phone: "0123456789",
        role: "Nhân viên",
        status: "active",
        created: "2024-12-10",
        createdBy: "Admin1"
    },
    {
        id: 2,
        code: "NV002",
        name: "Trần Thị B",
        email: "tran.b@example.com",
        phone: "0987654321",
        role: "Nhân viên",
        status: "locked",
        created: "2024-12-11",
        createdBy: "Admin1"
    }
];

function renderTable(data = staff) {
    const tbody = document.querySelector('#staffTable tbody');
    tbody.innerHTML = data.map((s, idx) => `
        <tr>
            <td>${idx + 1}</td>
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
                <label>Quyền:</label>
                <select id="addRole" required>
                    <option value="Nhân viên">Nhân viên</option>
                    <option value="Quản lý">Quản lý</option>
                </select>
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

function saveAdd(e) {
    e.preventDefault();
    const newStaff = {
        id: staff.length + 1,
        code: `NV${String(staff.length + 1).padStart(3, '0')}`,
        name: document.getElementById('addName').value,
        email: document.getElementById('addEmail').value,
        phone: document.getElementById('addPhone').value,
        role: document.getElementById('addRole').value,
        status: "active",
        created: new Date().toISOString().slice(0,10),
        createdBy: "Admin1" // Thay bằng tên admin đang đăng nhập
    };
    staff.push(newStaff);
    closeModal('editModal');
    renderTable();
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
        const idx = staff.findIndex(x => x.id === id);
        if (idx > -1) staff.splice(idx, 1);
        renderTable();
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Khởi tạo bảng khi load trang
document.addEventListener('DOMContentLoaded', () => {
    renderTable();
});
