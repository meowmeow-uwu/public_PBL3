const WORD_API_BASE = window.APP_CONFIG.API_BASE_URL +'/admin/words';

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

// 3. Thêm từ mới (POST /create)
async function createWord(wordData) {
    // wordData là object: { word_name, pronunciation, image, sound, language_id }
    const formData = new FormData();
    
    // Thêm các trường dữ liệu cơ bản
    formData.append('word_name', wordData.word_name);
    formData.append('pronunciation', wordData.pronunciation);
    formData.append('language_id', wordData.language_id);
    
    // Thêm file hình ảnh nếu có
    if (wordData.image instanceof File) {
        formData.append('image', wordData.image);
    } else if (wordData.image) {
        formData.append('image', wordData.image);
    }
    
    // Thêm file âm thanh nếu có
    if (wordData.sound instanceof File) {
        formData.append('sound', wordData.sound);
    } else if (wordData.sound) {
        formData.append('sound', wordData.sound);
    }

    const res = await fetch(`${WORD_API_BASE}/create`, {
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
    const formData = new FormData();
    
    // Thêm ID và các trường dữ liệu cơ bản
    formData.append('id', wordData.id);
    formData.append('word_name', wordData.word_name);
    formData.append('pronunciation', wordData.pronunciation);
    formData.append('language_id', wordData.language_id);
    
    // Thêm file hình ảnh nếu có
    if (wordData.image instanceof File) {
        formData.append('image', wordData.image);
    } else if (wordData.image) {
        formData.append('image', wordData.image);
    }
    
    // Thêm file âm thanh nếu có
    if (wordData.sound instanceof File) {
        formData.append('sound', wordData.sound);
    } else if (wordData.sound) {
        formData.append('sound', wordData.sound);
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
