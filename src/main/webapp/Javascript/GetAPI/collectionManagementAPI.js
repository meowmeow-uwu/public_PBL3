/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/JavaScript.js to edit this template
 */

const API_BASE = window.APP_CONFIG.API_BASE_URL + '/admin/collections';

function getToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
}

function toFormUrlEncoded(obj) {
    return Object.keys(obj)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
        .join('&');
}

async function safeJsonResponse(res, defaultError) {
    const text = await res.text();
    if (!res.ok) {
        try {
            const err = JSON.parse(text);
            throw new Error(err.error || defaultError);
        } catch {
            throw new Error(defaultError);
        }
    }
    return text ? JSON.parse(text) : {};
}

// 1. Tạo bộ sưu tập mới
async function createCollection(name) {
    const res = await fetch(`${API_BASE}/create`, {
        method: 'POST',
        headers: {
            'Authorization': getToken(),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: toFormUrlEncoded({ name })
    });
    return await safeJsonResponse(res, "Lỗi tạo bộ sưu tập");
}

// 2. Thêm từ vào bộ sưu tập
async function addWordToCollection(collectionId, wordId) {
    const res = await fetch(`${API_BASE}/${collectionId}/words/${wordId}`, {
        method: 'POST',
        headers: { 'Authorization': getToken() }
    });
    return await safeJsonResponse(res, "Lỗi thêm từ vào bộ sưu tập");
}

// 3. Lấy danh sách bộ sưu tập công khai
async function getAllCollections() {
    try {
        console.log('Đang gọi API lấy danh sách bộ sưu tập...');
        const token = getToken();
        if (!token) {
            throw new Error('Unauthorized: Vui lòng đăng nhập lại');
        }

        const res = await fetch(`${API_BASE}/all`, {
            headers: { 'Authorization': token }
        });

        if (!res.ok) {
            if (res.status === 401) {
                throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            }
            if (res.status === 404) {
                throw new Error('Không tìm thấy bộ sưu tập');
            }
            throw new Error('Có lỗi xảy ra khi lấy danh sách bộ sưu tập');
        }

        const data = await res.json();
        console.log('Danh sách bộ sưu tập:', data);
        return data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bộ sưu tập:', error);
        throw error;
    }
}

// 4. Cập nhật bộ sưu tập
async function updateCollection(collectionId, { name, isPublic }) {
    const res = await fetch(`${API_BASE}/${collectionId}`, {
        method: 'PUT',
        headers: {
            'Authorization': getToken(),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: toFormUrlEncoded({ name, isPublic })
    });
    return await safeJsonResponse(res, "Lỗi cập nhật bộ sưu tập");
}

// 5. Xóa bộ sưu tập
async function deleteCollection(collectionId) {
    if (!confirm("Bạn chắc chắn muốn xoá bộ sưu tập này?")) return;
    
    const res = await fetch(`${API_BASE}/${collectionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': getToken() }
    });
    return await safeJsonResponse(res, "Lỗi xóa bộ sưu tập");
}

// 6. Xóa từ khỏi bộ sưu tập
async function deleteWordFromCollection(collectionId, wordId) {
    const res = await fetch(`${API_BASE}/${collectionId}/delete-word`, {
        method: 'DELETE',
        headers: {
            'Authorization': getToken(),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: toFormUrlEncoded({ wordId })
    });
    return await safeJsonResponse(res, "Lỗi xóa từ khỏi bộ sưu tập");
}

// Export các hàm để sử dụng ở các file khác
window.collectionManagementAPI = {
    createCollection,
    addWordToCollection,
    getAllCollections,
    updateCollection,
    deleteCollection,
    deleteWordFromCollection
};
