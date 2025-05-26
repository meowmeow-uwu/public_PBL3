const API_ACCOUNT_URL = window.APP_CONFIG.API_BASE_URL +'/user/';

// Lấy thông tin tài khoản
async function getAccountInfo() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Không tìm thấy token');
    }

    try {
        const response = await fetch(`${API_ACCOUNT_URL}me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Không thể lấy thông tin tài khoản');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi lấy thông tin tài khoản:', error);
        throw error;
    }
}

// Cập nhật mật khẩu
async function updatePassword(oldPassword, newPassword) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Không tìm thấy token');
    }

    try {
        const formData = new URLSearchParams();
        formData.append('oldpassword', oldPassword);
        formData.append('newpassword', newPassword);

        const response = await fetch(`${API_ACCOUNT_URL}update/password`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Không thể cập nhật mật khẩu');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi cập nhật mật khẩu:', error);
        throw error;
    }
}
// Cập nhật toàn bộ thông tin người dùng (name, avatar, email)
async function updateProfile({ name, avatar, email }) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Không tìm thấy token');
    }

    try {
        const formData = new URLSearchParams();
        if (name) formData.append('name', name);
        if (avatar) formData.append('avatar', avatar);
        if (email) formData.append('email', email);

        const response = await fetch(`${API_ACCOUNT_URL}me/update`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Không thể cập nhật thông tin');
        }

        return await response.json();
    } catch (error) {
        console.error('Lỗi khi cập nhật thông tin:', error);
        throw error;
    }
}
