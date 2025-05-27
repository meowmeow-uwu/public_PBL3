const API_BASE_URL = window.APP_CONFIG.API_BASE_URL + '/admin/collections';

function getToken() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Vui lòng đăng nhập lại');
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
}

// 1. Tạo bộ sưu tập (luôn công khai)
async function createCollection(name) {
    const token = getToken();
    const formData = new URLSearchParams();
    formData.append('name', name);

    const response = await fetch(`${API_BASE_URL}/create`, {
        method: 'POST',
        headers: {
            'Authorization': token,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
    });
    if (!response.ok) throw new Error('Không thể tạo bộ sưu tập');
    return await response.json();
}

// 2. Thêm từ vào bộ sưu tập
async function addWordToCollection(collectionId, wordId) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/${collectionId}/words/${wordId}`, {
        method: 'POST',
        headers: { 'Authorization': token }
    });
    if (!response.ok) throw new Error('Không thể thêm từ vào bộ sưu tập');
    return true;
}

// 3. Lấy tất cả bộ sưu tập công khai
async function getAllCollections() {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/all`, {
        method: 'GET',
        headers: { 'Authorization': token }
    });
    if (!response.ok) throw new Error('Không thể lấy danh sách bộ sưu tập');
    return await response.json();
}

// 4. Cập nhật bộ sưu tập
async function updateCollection(collectionId, name, isPublic = true) {
    const token = getToken();
    const formData = new URLSearchParams();
    formData.append('name', name);
    formData.append('isPublic', isPublic);

    const response = await fetch(`${API_BASE_URL}/${collectionId}`, {
        method: 'PUT',
        headers: {
            'Authorization': token,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
    });
    if (!response.ok) throw new Error('Không thể cập nhật bộ sưu tập');
    return true;
}

// 5. Xoá bộ sưu tập
async function deleteCollection(collectionId) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/${collectionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
    });
    if (!response.ok) throw new Error('Không thể xoá bộ sưu tập');
    return true;
}

// 6. Xoá 1 từ khỏi bộ sưu tập
async function deleteWordFromCollection(collectionId, wordId) {
    const token = getToken();
    const formData = new URLSearchParams();
    formData.append('wordId', wordId);
    alert(API_BASE_URL);
    const response = await fetch(`${API_BASE_URL}/${collectionId}/delete-word`, {
        method: 'DELETE',
        headers: {
            'Authorization': token,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
    });
    if (!response.ok) throw new Error('Không thể xoá từ khỏi bộ sưu tập');
    return true;
}

// API lấy danh sách từ theo page, language, keyword
async function getWordsByPageLanguageKeyword(page = 1, pageSize = 10, languageId = 1, keyword = '') {
    const token = localStorage.getItem('token');
    const url = `${window.APP_CONFIG.API_BASE_URL}/admin/words/list/${page}/${pageSize}/${languageId}?keyword=${encodeURIComponent(keyword)}`;
    const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Không thể lấy danh sách từ');
    return await response.json();
}


// Export
window.collectionManagementAPI = {
    createCollection,
    addWordToCollection,
    getAllCollections,
    updateCollection,
    deleteCollection,
    deleteWordFromCollection,
    getWordsByPageLanguageKeyword,
};
