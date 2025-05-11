let courses = [
    {
        id: 1,
        name: "Tiếng Anh A1",
        level: "A1",
        desc: "Khóa cơ bản cho người mới",
        lessons: 12,
        status: "active",
        students: 30,
        completionRate: 85,
        created: "2024-01-01",
        updated: "2024-04-01",
        detail: "Đây là khóa học A1 cho người mới bắt đầu.",
        vocabulary: ["Hello", "Goodbye", "Thank you", "Please"],
        lessonList: [
            { id: 1, title: "Bài 1: Chào hỏi", duration: "45 phút" },
            { id: 2, title: "Bài 2: Giới thiệu bản thân", duration: "60 phút" }
        ]
    },
    // Thêm dữ liệu mẫu khác...
];

function renderTable(data) {
    const tbody = document.querySelector('#lessonTable tbody');
    tbody.innerHTML = data.map((c, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td>${c.name}</td>
            <td>${c.level}</td>
            <td>${c.desc}</td>
            <td>${c.lessons}</td>
            <td>${c.status === 'active' ? 'Hoạt động' : 'Ẩn'}</td>
            <td>
                <button class="action-btn" title="Xem chi tiết" onclick="showDetail(${c.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn" title="Chỉnh sửa" onclick="showEdit(${c.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn" title="Xóa" onclick="deleteCourse(${c.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function searchCourse() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const level = document.getElementById('levelFilter').value;
    const status = document.getElementById('statusFilter').value;
    
    let filtered = courses.filter(c =>
        c.name.toLowerCase().includes(keyword) &&
        (level === "" || c.level === level) &&
        (status === "" || c.status === status)
    );
    
    renderTable(filtered);
}

function showDetail(id) {
    const c = courses.find(x => x.id === id);
    document.getElementById('detailContent').innerHTML = `
        <h2>${c.name} (${c.level})</h2>
        <div class="stats-container">
            <div class="stat-card">
                <h3>Số học viên</h3>
                <p>${c.students}</p>
            </div>
            <div class="stat-card">
                <h3>Tỷ lệ hoàn thành</h3>
                <p>${c.completionRate}%</p>
            </div>
            <div class="stat-card">
                <h3>Số bài học</h3>
                <p>${c.lessons}</p>
            </div>
        </div>
        <div class="form-group">
            <label>Mô tả:</label>
            <p>${c.detail}</p>
        </div>
        <div class="form-group">
            <label>Danh sách bài học:</label>
            <ul>
                ${c.lessonList.map(l => `
                    <li>${l.title} (${l.duration})</li>
                `).join('')}
            </ul>
        </div>
        <div class="form-group">
            <label>Từ vựng:</label>
            <ul>
                ${c.vocabulary.map(v => `<li>${v}</li>`).join('')}
            </ul>
        </div>
        <div class="form-group">
            <label>Ngày tạo:</label>
            <p>${c.created}</p>
        </div>
        <div class="form-group">
            <label>Cập nhật gần nhất:</label>
            <p>${c.updated}</p>
        </div>
    `;
    document.getElementById('detailModal').style.display = 'flex';
}

function showEdit(id) {
    let c = courses.find(x => x.id === id);
    document.getElementById('editContent').innerHTML = `
        <h2>Chỉnh sửa khóa học</h2>
        <form onsubmit="saveEdit(event,${c.id})">
            <div class="form-group">
                <label>Tên khóa học:</label>
                <input type="text" id="editName" value="${c.name}" required>
            </div>
            <div class="form-group">
                <label>Cấp độ:</label>
                <select id="editLevel" required>
                    <option value="A1" ${c.level === 'A1' ? 'selected' : ''}>A1</option>
                    <option value="A2" ${c.level === 'A2' ? 'selected' : ''}>A2</option>
                    <option value="B1" ${c.level === 'B1' ? 'selected' : ''}>B1</option>
                </select>
            </div>
            <div class="form-group">
                <label>Mô tả ngắn:</label>
                <input type="text" id="editDesc" value="${c.desc}" required>
            </div>
            <div class="form-group">
                <label>Số bài học:</label>
                <input type="number" id="editLessons" value="${c.lessons}" required>
            </div>
            <div class="form-group">
                <label>Trạng thái:</label>
                <select id="editStatus" required>
                    <option value="active" ${c.status === 'active' ? 'selected' : ''}>Hoạt động</option>
                    <option value="hidden" ${c.status === 'hidden' ? 'selected' : ''}>Ẩn</option>
                </select>
            </div>
            <div class="form-group">
                <label>Mô tả đầy đủ:</label>
                <textarea id="editDetail" required>${c.detail}</textarea>
            </div>
            <button type="submit" class="add-btn">Lưu thay đổi</button>
        </form>
    `;
    document.getElementById('editModal').style.display = 'flex';
}

function saveEdit(e, id) {
    e.preventDefault();
    let c = courses.find(x => x.id === id);
    c.name = document.getElementById('editName').value;
    c.level = document.getElementById('editLevel').value;
    c.desc = document.getElementById('editDesc').value;
    c.lessons = document.getElementById('editLessons').value;
    c.status = document.getElementById('editStatus').value;
    c.detail = document.getElementById('editDetail').value;
    c.updated = new Date().toISOString().slice(0,10);
    closeModal('editModal');
    renderTable(courses);
}

function showAdd() {
    document.getElementById('editContent').innerHTML = `
        <h2>Thêm khóa học mới</h2>
        <form onsubmit="saveAdd(event)">
            <div class="form-group">
                <label>Tên khóa học:</label>
                <input type="text" id="addName" required>
            </div>
            <div class="form-group">
                <label>Cấp độ:</label>
                <select id="addLevel" required>
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                </select>
            </div>
            <div class="form-group">
                <label>Mô tả ngắn:</label>
                <input type="text" id="addDesc" required>
            </div>
            <div class="form-group">
                <label>Số bài học:</label>
                <input type="number" id="addLessons" required>
            </div>
            <div class="form-group">
                <label>Trạng thái:</label>
                <select id="addStatus" required>
                    <option value="active">Hoạt động</option>
                    <option value="hidden">Ẩn</option>
                </select>
            </div>
            <div class="form-group">
                <label>Mô tả đầy đủ:</label>
                <textarea id="addDetail" required></textarea>
            </div>
            <button type="submit" class="add-btn">Thêm khóa học</button>
        </form>
    `;
    document.getElementById('editModal').style.display = 'flex';
}

function saveAdd(e) {
    e.preventDefault();
    const newCourse = {
        id: courses.length + 1,
        name: document.getElementById('addName').value,
        level: document.getElementById('addLevel').value,
        desc: document.getElementById('addDesc').value,
        lessons: document.getElementById('addLessons').value,
        status: document.getElementById('addStatus').value,
        detail: document.getElementById('addDetail').value,
        students: 0,
        completionRate: 0,
        created: new Date().toISOString().slice(0,10),
        updated: new Date().toISOString().slice(0,10),
        vocabulary: [],
        lessonList: []
    };
    courses.push(newCourse);
    closeModal('editModal');
    renderTable(courses);
}

function deleteCourse(id) {
    if (confirm('Bạn chắc chắn muốn xóa khóa học này?')) {
        const idx = courses.findIndex(x => x.id === id);
        if (idx > -1) courses.splice(idx, 1);
        renderTable(courses);
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Khởi tạo bảng khi load trang
document.addEventListener('DOMContentLoaded', () => {
    renderTable(courses);
});
