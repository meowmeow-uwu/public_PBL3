let histories = [];
let perPage = 10;
let currentPage = 1;
let currentType = 1;

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('typeFilter').addEventListener('change', function() {
        currentType = parseInt(this.value);
        loadHistories();
    });
    document.getElementById('historyForm').addEventListener('submit', saveHistory);
    loadHistories();
});

async function loadHistories() {
    try {
        histories = await getHistories(currentType);
        currentPage = 1;
        renderHistoryTable();
        renderHistoryPagination();
    } catch (e) {
        alert(e.message);
    }
}

function renderHistoryTable() {
    const tbody = document.querySelector('#historyTable tbody');
    const start = (currentPage - 1) * perPage;
    const pageData = histories.slice(start, start + perPage);

    tbody.innerHTML = pageData.map((h, idx) => `
        <tr>
            <td>${start + idx + 1}</td>
            <td>${h.user_id}</td>
            <td>${typeName(currentType)}</td>
            <td>${h.title || h.exam_name || ''}</td>
            <td>${h.date || ''}</td>
            <td>${h.result || h.score || ''}</td>
            <td>
                <button onclick="openEditModal(${h.id})">Sửa</button>
                <button onclick="deleteHistoryHandler(${h.id})">Xóa</button>
            </td>
        </tr>
    `).join('');
}

function renderHistoryPagination() {
    const totalPages = Math.ceil(histories.length / perPage);
    const pag = document.getElementById('historyPagination');
    let html = '';
    html += `<button onclick="changeHistoryPage(-1)" ${currentPage === 1 ? 'disabled' : ''}>Trước</button>`;
    html += ` Trang ${currentPage} / ${totalPages} `;
    html += `<button onclick="changeHistoryPage(1)" ${currentPage === totalPages ? 'disabled' : ''}>Sau</button>`;
    pag.innerHTML = html;
}

function changeHistoryPage(delta) {
    const totalPages = Math.ceil(histories.length / perPage);
    currentPage += delta;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    renderHistoryTable();
    renderHistoryPagination();
}

function openAddModal() {
    document.getElementById('historyId').value = '';
    document.getElementById('userId').value = '';
    document.getElementById('title').value = '';
    document.getElementById('date').value = '';
    document.getElementById('result').value = '';
    document.getElementById('historyModal').style.display = 'block';
}

async function openEditModal(id) {
    try {
        const h = await getHistoryById(id, currentType);
        document.getElementById('historyId').value = h.id;
        document.getElementById('userId').value = h.user_id;
        document.getElementById('title').value = h.title || h.exam_name || '';
        document.getElementById('date').value = h.date || '';
        document.getElementById('result').value = h.result || h.score || '';
        document.getElementById('historyModal').style.display = 'block';
    } catch (e) {
        alert(e.message);
    }
}

function closeModal() {
    document.getElementById('historyModal').style.display = 'none';
}

async function saveHistory(e) {
    e.preventDefault();
    const id = document.getElementById('historyId').value;
    const data = {
        user_id: document.getElementById('userId').value,
        title: document.getElementById('title').value,
        date: document.getElementById('date').value,
        result: document.getElementById('result').value
    };
    try {
        if (id) {
            await updateHistory(id, currentType, data);
        } else {
            await createHistory(currentType, data);
        }
        closeModal();
        await loadHistories();
    } catch (e) {
        alert(e.message);
    }
}

async function deleteHistoryHandler(id) {
    if (!confirm('Bạn chắc chắn muốn xóa lịch sử này?')) return;
    try {
        await deleteHistory(id, currentType);
        await loadHistories();
    } catch (e) {
        alert(e.message);
    }
}

function typeName(type) {
    if (type === 1) return 'Từ vựng';
    if (type === 2) return 'Bài viết';
    if (type === 3) return 'Làm bài';
    return '';
}

