// API functions for user management (admin)
const USER_BASE_URL = 'http://localhost:2005/PBL3/api/admin/users';

function getToken() {
    return localStorage.getItem('token');
}

// Helper: convert JS object to x-www-form-urlencoded string
function toFormUrlEncoded(obj) {
    return Object.keys(obj)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
        .join('&');
}

// 1. Tạo người dùng mới
async function createUser(data) {
    try {
        const response = await fetch(`${USER_BASE_URL}/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: toFormUrlEncoded(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

// 2. Cập nhật thông tin người dùng
async function updateUserInfo(data) {
    try {
        const response = await fetch(`${USER_BASE_URL}/change-info`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: toFormUrlEncoded(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating user info:', error);
        throw error;
    }
}

// 3. Đổi mật khẩu người dùng
async function changeUserPassword(data) {
    try {
        const response = await fetch(`${USER_BASE_URL}/change-password`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: toFormUrlEncoded(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Error changing user password:', error);
        throw error;
    }
}

// 4. Lấy danh sách người dùng theo role_id, trả về cả user và account (có thể account=null)
async function getUserListByRole(roleId) {
    try {
        const response = await fetch(`${USER_BASE_URL}/list/${roleId}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Không thể lấy danh sách người dùng');
        }
        const data = await response.json();
        // Đảm bảo data là mảng, mỗi phần tử có user và account (account có thể null)
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error getting user list:', error);
        throw error;
    }
}

// 5. Xóa người dùng
async function deleteUser(userId) {
    try {
        const response = await fetch(`${USER_BASE_URL}/delete/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
} 