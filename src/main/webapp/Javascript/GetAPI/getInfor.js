//const API_LgRgt_URL = window.APP_CONFIG.API_BASE_URL + '/auth/';
const API_getIF_URL = window.APP_CONFIG.API_BASE_URL + '/user/me';

function getToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
}

/**
 * Lấy thông tin user từ API dựa trên token trong localStorage
 * @returns {Promise<object|null>} Trả về object user hoặc null nếu lỗi/không có token
 */
async function fetchUserInfo() {
    const token = getToken();
    if (!token) return null;
    try {
        const response = await fetch(API_getIF_URL, {
            method: "GET",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        return null;
    }
}

// Cho phép import vào các file khác
window.fetchUserInfo = fetchUserInfo;
