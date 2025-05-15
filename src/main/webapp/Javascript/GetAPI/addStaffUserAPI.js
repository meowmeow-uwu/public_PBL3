// API functions for user management (admin)
const USER_BASE_URL = window.APP_CONFIG.API_BASE_URL + '/admin/users';

function getToken() {
    return localStorage.getItem('token');
}

// Helper: convert JS object to x-www-form-urlencoded string
function toFormUrlEncoded(obj) {
    return Object.keys(obj)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
        .join('&');
}

// Tạo người dùng mới
async function createUser({ username, password, email, name, role_id, avatar }) {
    try {
        const response = await fetch(`${USER_BASE_URL}/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: toFormUrlEncoded({ username, password, email, name, role_id, avatar })
        });
        const resJson = await response.json();
        if (!response.ok) {
            throw new Error(resJson.error || 'Có lỗi xảy ra khi tạo người dùng');
        }
        return resJson;
    } catch (error) {
        throw error;
    }
}

window.addStaffUserAPI = { createUser };
