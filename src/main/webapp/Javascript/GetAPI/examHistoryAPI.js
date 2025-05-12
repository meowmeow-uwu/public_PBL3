const EXAM_HISTORY_BASE_URL = 'http://localhost:2005/PBL3/api/exam-history';

function getToken() {
    return localStorage.getItem('token');
}

// Lấy tất cả lịch sử làm bài của user hiện tại
async function getExamHistories() {
    const res = await fetch(EXAM_HISTORY_BASE_URL, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error('Không thể lấy lịch sử');
    return await res.json();
}

// Lấy chi tiết 1 lịch sử
async function getExamHistoryById(id) {
    const res = await fetch(`${EXAM_HISTORY_BASE_URL}/${id}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error('Không tìm thấy lịch sử');
    return await res.json();
}

// Xóa lịch sử
async function deleteExamHistory(id) {
    const res = await fetch(`${EXAM_HISTORY_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error('Xóa thất bại');
    return await res.json();
}

