// Định nghĩa các vai trò người dùng
const ROLE_MAP = {
    1: "Admin",
    3: "Nhân viên",
    2: "User" // Hoặc "Người dùng" tùy theo hiển thị mong muốn
};

// Định nghĩa API endpoints
const API_BASE = window.APP_CONFIG.API_BASE_URL + '/admin/users';

function getToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
}

// Định nghĩa staffUserAPI object
const staffUserAPI = {
    // Lấy danh sách người dùng
    async fetchUserList({ page, pageSize, groupUserId, keyword }) {
        try {
            const token = getToken();
            if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

            const _page = page || 1;
            const _pageSize = pageSize || 10;
            const _groupUserId = groupUserId || 1;
            const _keyword = keyword || '';

            const url = `${API_BASE}/list/${_page}/${_pageSize}/${_groupUserId}?keyword=${encodeURIComponent(_keyword)}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: { 
                    'Authorization': token
                },
                credentials: 'include',
                mode: 'cors'
            });

            if (!response.ok) {
                if (response.status === 401) throw new Error('Unauthorized: Vui lòng đăng nhập lại');
                throw new Error('Có lỗi xảy ra khi lấy danh sách người dùng');
            }

            const data = await response.json();
            console.log('Response data:', data); // Log để debug
            // Chuyển đổi cấu trúc dữ liệu từ backend sang frontend
            return {
                users: Array.isArray(data.users) ? data.users : [],
                totalPages: data.total || 0
            };
        } catch (error) {
            console.error('Lỗi khi lấy danh sách người dùng:', error);
            throw error;
        }
    },

    // Cập nhật thông tin người dùng
    async updateUser(userData) {
        try {
            const token = getToken();
            if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

            // Tạo body dạng form-urlencoded
            const body = new URLSearchParams();
            body.append('user_id', userData.id);
            body.append('username', userData.username);
            body.append('email', userData.email);
            body.append('name', userData.name);
            body.append('role_id', userData.role_id);
            body.append('avatar', userData.avatar);

            const response = await fetch(`${API_BASE}/change-info`, {
                method: 'PUT',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: body.toString(),
                credentials: 'include',
                mode: 'cors'
            });

            if (!response.ok) {
                if (response.status === 401) throw new Error('Unauthorized: Vui lòng đăng nhập lại');
                throw new Error('Có lỗi xảy ra khi cập nhật thông tin người dùng');
            }

            return await response.json();
        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin người dùng:', error);
            throw error;
        }
    },

    // Đổi mật khẩu người dùng
    async changePassword(userId, newPassword) {
        try {
            const token = getToken();
            if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

            // Tạo body dạng form-urlencoded
            const body = new URLSearchParams();
            body.append('userId', userId);
            body.append('password', newPassword);

            const response = await fetch(`${API_BASE}/change-password`, {
                method: 'PUT',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: body.toString(),
                credentials: 'include',
                mode: 'cors'
            });

            if (!response.ok) {
                if (response.status === 401) throw new Error('Unauthorized: Vui lòng đăng nhập lại');
                throw new Error('Có lỗi xảy ra khi đổi mật khẩu');
            }

            return await response.json();
        } catch (error) {
            console.error('Lỗi khi đổi mật khẩu:', error);
            throw error;
        }
    },

    // Xóa người dùng
    async deleteUser(userId) {
        try {
            const token = getToken();
            if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

            const response = await fetch(`${API_BASE}/delete/${userId}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': token,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                mode: 'cors'
            });

            if (!response.ok) {
                if (response.status === 401) throw new Error('Unauthorized: Vui lòng đăng nhập lại');
                throw new Error('Có lỗi xảy ra khi xóa người dùng');
            }

            return await response.json();
        } catch (error) {
            console.error('Lỗi khi xóa người dùng:', error);
            throw error;
        }
    }
};




// Export staffUserAPI để sử dụng ở các file khác
window.staffUserAPI = staffUserAPI;