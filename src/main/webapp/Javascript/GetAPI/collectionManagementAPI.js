<<<<<<< HEAD
/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/JavaScript.js to edit this template
 */

const COLLECTION_BASE_URL = window.APP_CONFIG.API_BASE_URL + '/admin/collections';
=======
const API_BASE =  window.APP_CONFIG.API_BASE_URL +'/admin/collections';
>>>>>>> 0952e51 (đăng ký user/staff/admin thanh cong)

function getToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
}

<<<<<<< HEAD
// Lấy danh sách bộ sưu tập công khai
async function getAllPublicCollections() {
    try {
        console.log('Đang gọi API lấy danh sách bộ sưu tập công khai...');
        
        const token = getToken();
        if (!token) {
            throw new Error('Unauthorized: Vui lòng đăng nhập lại');
        }

        console.log('Token gửi đi trong header:', token);
        const response = await fetch(`${COLLECTION_BASE_URL}/all`, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error:', errorText);

            if (response.status === 401) {
                throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            }
            if (response.status === 404) {
                throw new Error('Không tìm thấy bộ sưu tập công khai');
            }
            throw new Error(`Có lỗi xảy ra khi lấy danh sách bộ sưu tập: ${errorText}`);
=======
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
>>>>>>> 0952e51 (đăng ký user/staff/admin thanh cong)
        }
    }
    return text ? JSON.parse(text) : {};
}

<<<<<<< HEAD
        const data = await response.json();
        console.log('Danh sách bộ sưu tập:', data);
        return data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bộ sưu tập:', error);
        throw error;
    }
}

// Export các hàm để sử dụng ở các file khác
window.collectionManagementAPI = {
    getAllPublicCollections
=======
// 1. Tạo bộ sưu tập mới
async function createCollection(name) {
    const res = await fetch(`${API_BASE}/create`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: toFormUrlEncoded({ name })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Lỗi tạo bộ sưu tập");
    return data;
}

// 2. Thêm từ vào bộ sưu tập
async function addWordToCollection(collectionId, wordId) {
    const res = await fetch(`${API_BASE}/${collectionId}/words/${wordId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Lỗi thêm từ vào bộ sưu tập");
    return data;
}

// 3. Lấy danh sách bộ sưu tập công khai
async function getAllCollections() {
    const res = await fetch(`${API_BASE}/all`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return await safeJsonResponse(res, "Lỗi lấy danh sách bộ sưu tập");
}

// 4. Cập nhật bộ sưu tập
async function updateCollection(collectionId, { name, isPublic }) {
    const res = await fetch(`${API_BASE}/${collectionId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: toFormUrlEncoded({ name, isPublic })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Lỗi cập nhật bộ sưu tập");
    return data;
}

// 5. Xóa bộ sưu tập
async function deleteCollection(collectionId) {
    if (!confirm("Bạn chắc chắn muốn xoá bộ sưu tập này?")) return;
    try {
        await collectionAPI.deleteCollection(collectionId);
        alert('Xóa thành công!');
        loadCollections();
    } catch (err) {
        alert(err.message);
    }
}

// 6. Xóa từ khỏi bộ sưu tập
async function deleteWordFromCollection(collectionId, wordId) {
    const res = await fetch(`${API_BASE}/${collectionId}/delete-word`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: toFormUrlEncoded({ wordId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Lỗi xóa từ khỏi bộ sưu tập");
    return data;
}

window.collectionAPI = {
    createCollection,
    addWordToCollection,
    getAllCollections,
    updateCollection,
    deleteCollection,
    deleteWordFromCollection
>>>>>>> 0952e51 (đăng ký user/staff/admin thanh cong)
};
