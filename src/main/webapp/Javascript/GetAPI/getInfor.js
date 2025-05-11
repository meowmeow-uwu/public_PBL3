const API_getIF_URL = 'http://localhost:2005/PBL3/api/user/me';

/**
 * Lấy thông tin user từ API dựa trên token trong localStorage
 * @returns {Promise<object|null>} Trả về object user hoặc null nếu lỗi/không có token
 */
async function fetchUserInfo() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
        const response = await fetch(API_getIF_URL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
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
