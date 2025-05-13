const USER_BASE_URL = window.APP_CONFIG.API_BASE_URL +'/user/collections';

function getToken() {
    return localStorage.getItem('token');
}
// lấy danh sách bộ sưu tập của người dùng hiện tại
async function getUserCollections() {
    try {
        const response = await fetch(`${API_BASE_URL}/user`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            }
            throw new Error('Có lỗi xảy ra khi lấy danh sách bộ sưu tập');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bộ sưu tập:', error);
        throw error;
    }
}


