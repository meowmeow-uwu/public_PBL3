const API_ACCOUNT_URL = 'http://localhost:2005/PBL3/api/account/';

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

// Cập nhật email
async function updateEmail(newEmail) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Không tìm thấy token');
    }

    try {
        const formData = new URLSearchParams();
        formData.append('email', newEmail);

        const response = await fetch(`${API_ACCOUNT_URL}update/email`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Không thể cập nhật email');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi cập nhật email:', error);
        throw error;
    }
}
