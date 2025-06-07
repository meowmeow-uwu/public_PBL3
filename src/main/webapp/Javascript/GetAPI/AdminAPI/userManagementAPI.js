const API_BASE = window.APP_CONFIG.API_BASE_URL + '/admin/users';

const ROLE_MAP = {
    1: "Admin",
    3: "Nhân viên",
    2: "User" // Hoặc "Người dùng" tùy theo hiển thị mong muốn
};
// Tạo người dùng mới
async function createUser({ username, password, email, name, role_id, avatar }) {
    try {
        const response = await fetch(`${API_BASE}/create`, {
            method: 'POST',
            headers: {
                'Authorization': `${window.USER_API.getBearerToken()}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: window.HELPER_UTIL.toFormUrlEncoded({ username, password, email, name, role_id, avatar })
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

// Lấy danh sách người dùng
async function fetchUserList({ page, pageSize, groupUserId, keyword }) {
    try {
        const token = window.USER_API.getBearerToken();
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
            }
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            throw new Error('Có lỗi xảy ra khi lấy danh sách người dùng');
        }

        const data = await response.json();
        console.log('Response data:', data);
        return {
            users: Array.isArray(data.users) ? data.users : [],
            totalPages: data.total
        };
    } catch (error) {
        console.error('Lỗi khi lấy danh sách người dùng:', error);
        throw error;
    }
}

// Cập nhật thông tin người dùng
async function updateUser(userData) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

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
            body: body.toString()
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
}

// Đổi mật khẩu người dùng
async function changePassword(userId, newPassword) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const body = new URLSearchParams();
        body.append('userId', userId);
        body.append('password', newPassword);

        const response = await fetch(`${API_BASE}/change-password`, {
            method: 'PUT',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body.toString()
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
}

// Xóa người dùng
async function deleteUser(userId) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(`${API_BASE}/delete/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
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

window.USER_MANAGEMENT_API = {
    ROLE_MAP,
    createUser,
    deleteUser,
    changePassword,
    updateUser,
    fetchUserList
};
