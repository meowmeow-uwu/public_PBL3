const BASE_URL = 'http://localhost:2005/PBL3/api';

function getToken() {
    return localStorage.getItem('token');
}

// Lấy tất cả lịch sử theo loại (type: 1-word, 2-post, 3-exam)
async function getHistories(type) {
    const res = await fetch(`${BASE_URL}/history?type=${type}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error('Không thể lấy lịch sử');
    return await res.json();
}

// Lấy chi tiết 1 lịch sử
async function getHistoryById(id, type) {
    const res = await fetch(`${BASE_URL}/history/${id}?type=${type}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error('Không tìm thấy lịch sử');
    return await res.json();
}

// Thêm mới lịch sử
async function createHistory(type, data) {
    const res = await fetch(`${BASE_URL}/history?type=${type}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Tạo mới thất bại');
    return await res.json();
}

// Cập nhật lịch sử
async function updateHistory(id, type, data) {
    const res = await fetch(`${BASE_URL}/history/${id}?type=${type}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Cập nhật thất bại');
    return await res.json();
}

// Xóa lịch sử
async function deleteHistory(id, type) {
    const res = await fetch(`${BASE_URL}/history/${id}?type=${type}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error('Xóa thất bại');
    return await res.json();
}
