const WORD_API_BASE = 'http://localhost:2005/PBL3/api/admin/words';

function getToken() {
    return localStorage.getItem('token');
}

// 1. Lấy một từ theo ID
async function getWordById(id) {
    const res = await fetch(`${WORD_API_BASE}/${id}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error('Không tìm thấy từ vựng');
    return await res.json();
}

// 2. Lấy danh sách từ có phân trang, lọc theo ngôn ngữ và từ khóa
async function getWordList({ page = 1, size = 20, language_id = 1, keyword = '' }) {
    let url = `${WORD_API_BASE}/list/${page}/${size}/${language_id}`;
    if (keyword) url += `?keyword=${encodeURIComponent(keyword)}`;
    const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error('Không thể lấy danh sách từ vựng');
    return await res.json();
}

// 3. Thêm từ mới (POST /search/{id})
async function createWord(language_id, wordData) {
    // wordData là object: { word, meaning, ... }
    const formData = new URLSearchParams();
    for (const key in wordData) {
        formData.append(key, wordData[key]);
    }
    const res = await fetch(`${WORD_API_BASE}/search/${language_id}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
    });
    if (!res.ok) throw new Error('Thêm từ mới thất bại');
    return await res.json();
}

// 4. Cập nhật từ (PUT /update)
async function updateWord(wordData) {
    // wordData phải có id và các trường cần cập nhật
    const formData = new URLSearchParams();
    for (const key in wordData) {
        formData.append(key, wordData[key]);
    }
    const res = await fetch(`${WORD_API_BASE}/update`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
    });
    if (!res.ok) throw new Error('Cập nhật từ thất bại');
    return await res.json();
}

// 5. Xóa từ (DELETE /delete/{id})
async function deleteWord(id) {
    const res = await fetch(`${WORD_API_BASE}/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error('Xóa từ thất bại');
    return await res.json();
}
