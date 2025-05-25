<<<<<<< HEAD
<<<<<<< HEAD

const staffUserAPI = {
    /**
     * Lấy Authorization header từ localStorage.
     * @returns {string} Chuỗi Authorization header hoặc chuỗi rỗng.
     */
    getAuthHeader() {
        const token = localStorage.getItem('token');
        return token ? `Bearer ${token}` : '';
    },

    /**
     * Gọi API để lấy danh sách người dùng theo trang, vai trò và từ khóa.
     * @param {object} params - Tham số bao gồm page, pageSize, groupUserId, keyword.
     * @returns {Promise<object>} Promise chứa danh sách người dùng và tổng số trang.
     */
    async fetchUserList({ page, pageSize, groupUserId, keyword }) {
        const baseUrl = window.APP_CONFIG.API_BASE_URL;
        let url = `${baseUrl}/admin/users/list/${page}/${pageSize}/${groupUserId}`;
        if (keyword) {
            url += `?keyword=${encodeURIComponent(keyword)}`;
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': this.getAuthHeader()
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Lỗi không xác định khi parse JSON response' }));
            console.error('API Error Response:', errorData);
            throw new Error(errorData.error || `Lỗi ${response.status} khi tải danh sách người dùng`);
        }
        
        const data = await response.json();
        // Backend trả về { _user: [ {user: {...}}, ... ], totalPages: X }
        return {
            users: data._user ? data._user.map(item => ({
                id: item.user.user_id,
                username: item.user.username,
                name: item.user.name,
                email: item.user.email,
                avatar: item.user.avatar,
                group_user_id: item.user.group_user_id
            })) : [], // Trả về mảng rỗng nếu _user không tồn tại
            totalPages: data.totalPages || 0 // Trả về 0 nếu totalPages không tồn tại
        };
    },

    /**
     * Gọi API để cập nhật thông tin người dùng.
     * @param {object} userData - Dữ liệu người dùng cần cập nhật.
     * @returns {Promise<object>} Promise chứa kết quả từ API.
     */
    async updateUser(userData) {
        const baseUrl = window.APP_CONFIG.API_BASE_URL;
        const formData = new FormData();
        formData.append('user_id', userData.id); // Backend Java mong đợi user_id
        formData.append('username', userData.username);
        formData.append('email', userData.email);
        formData.append('name', userData.name);
        formData.append('role_id', userData.role_id); // Backend Java mong đợi role_id
        formData.append('avatar', userData.avatar || '');

        const response = await fetch(`${baseUrl}/admin/users/change-info`, {
            method: 'PUT',
            headers: {
                'Authorization': this.getAuthHeader()
                // 'Content-Type' sẽ được tự động thiết lập bởi browser khi dùng FormData
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Lỗi không xác định khi parse JSON response' }));
            console.error('API Error Response:', errorData);
            throw new Error(errorData.error || `Lỗi ${response.status} khi cập nhật người dùng`);
        }
        return await response.json();
    },

    /**
     * Gọi API để xóa người dùng.
     * @param {number|string} userId - ID của người dùng cần xóa.
     * @returns {Promise<object>} Promise chứa kết quả từ API.
     */
    async deleteUser(userId) {
        const baseUrl = window.APP_CONFIG.API_BASE_URL;
        const response = await fetch(`${baseUrl}/admin/users/delete/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': this.getAuthHeader()
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Lỗi không xác định khi parse JSON response' }));
            console.error('API Error Response:', errorData);
            throw new Error(errorData.error || `Lỗi ${response.status} khi xóa người dùng`);
        }
        return await response.json();
    },

    /**
     * Gọi API để thay đổi mật khẩu người dùng.
     * @param {number|string} userId - ID của người dùng.
     * @param {string} password - Mật khẩu mới.
     * @returns {Promise<object>} Promise chứa kết quả từ API.
     */
    async changePassword(userId, password) {
        const baseUrl = window.APP_CONFIG.API_BASE_URL;
        const formData = new FormData();
        formData.append('userId', userId); // Backend Java mong đợi userId
        formData.append('password', password);

        const response = await fetch(`${baseUrl}/admin/users/change-password`, {
            method: 'PUT',
            headers: {
                'Authorization': this.getAuthHeader()
                // 'Content-Type' sẽ được tự động thiết lập bởi browser khi dùng FormData
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Lỗi không xác định khi parse JSON response' }));
            console.error('API Error Response:', errorData);
            throw new Error(errorData.error || `Lỗi ${response.status} khi đổi mật khẩu`);
        }
        return await response.json();
    }
};
=======
const API_BASE = window.APP_CONFIG.API_URL + '/admin/users';
=======
>>>>>>> aa76187 (fix bug giao diện)

const staffUserAPI = {
    /**
     * Lấy Authorization header từ localStorage.
     * @returns {string} Chuỗi Authorization header hoặc chuỗi rỗng.
     */
    getAuthHeader() {
        const token = localStorage.getItem('token');
        return token ? `Bearer ${token}` : '';
    },

    /**
     * Gọi API để lấy danh sách người dùng theo trang, vai trò và từ khóa.
     * @param {object} params - Tham số bao gồm page, pageSize, groupUserId, keyword.
     * @returns {Promise<object>} Promise chứa danh sách người dùng và tổng số trang.
     */
    async fetchUserList({ page, pageSize, groupUserId, keyword }) {
        const baseUrl = window.APP_CONFIG.API_BASE_URL;
        let url = `${baseUrl}/admin/users/list/${page}/${pageSize}/${groupUserId}`;
        if (keyword) {
            url += `?keyword=${encodeURIComponent(keyword)}`;
        }

<<<<<<< HEAD
window.staffUserAPI = { fetchUserList };
>>>>>>> 0952e51 (đăng ký user/staff/admin thanh cong)
=======
        const response = await fetch(url, {
            headers: {
                'Authorization': this.getAuthHeader()
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Lỗi không xác định khi parse JSON response' }));
            console.error('API Error Response:', errorData);
            throw new Error(errorData.error || `Lỗi ${response.status} khi tải danh sách người dùng`);
        }
        
        const data = await response.json();
        // Backend trả về { _user: [ {user: {...}}, ... ], totalPages: X }
        return {
            users: data._user ? data._user.map(item => ({
                id: item.user.user_id,
                username: item.user.username,
                name: item.user.name,
                email: item.user.email,
                avatar: item.user.avatar,
                group_user_id: item.user.group_user_id
            })) : [], // Trả về mảng rỗng nếu _user không tồn tại
            totalPages: data.totalPages || 0 // Trả về 0 nếu totalPages không tồn tại
        };
    },

    /**
     * Gọi API để cập nhật thông tin người dùng.
     * @param {object} userData - Dữ liệu người dùng cần cập nhật.
     * @returns {Promise<object>} Promise chứa kết quả từ API.
     */
    async updateUser(userData) {
        const baseUrl = window.APP_CONFIG.API_BASE_URL;
        const formData = new FormData();
        formData.append('user_id', userData.id); // Backend Java mong đợi user_id
        formData.append('username', userData.username);
        formData.append('email', userData.email);
        formData.append('name', userData.name);
        formData.append('role_id', userData.role_id); // Backend Java mong đợi role_id
        formData.append('avatar', userData.avatar || '');

        const response = await fetch(`${baseUrl}/admin/users/change-info`, {
            method: 'PUT',
            headers: {
                'Authorization': this.getAuthHeader()
                // 'Content-Type' sẽ được tự động thiết lập bởi browser khi dùng FormData
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Lỗi không xác định khi parse JSON response' }));
            console.error('API Error Response:', errorData);
            throw new Error(errorData.error || `Lỗi ${response.status} khi cập nhật người dùng`);
        }
        return await response.json();
    },

    /**
     * Gọi API để xóa người dùng.
     * @param {number|string} userId - ID của người dùng cần xóa.
     * @returns {Promise<object>} Promise chứa kết quả từ API.
     */
    async deleteUser(userId) {
        const baseUrl = window.APP_CONFIG.API_BASE_URL;
        const response = await fetch(`${baseUrl}/admin/users/delete/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': this.getAuthHeader()
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Lỗi không xác định khi parse JSON response' }));
            console.error('API Error Response:', errorData);
            throw new Error(errorData.error || `Lỗi ${response.status} khi xóa người dùng`);
        }
        return await response.json();
    },

    /**
     * Gọi API để thay đổi mật khẩu người dùng.
     * @param {number|string} userId - ID của người dùng.
     * @param {string} password - Mật khẩu mới.
     * @returns {Promise<object>} Promise chứa kết quả từ API.
     */
    async changePassword(userId, password) {
        const baseUrl = window.APP_CONFIG.API_BASE_URL;
        const formData = new FormData();
        formData.append('userId', userId); // Backend Java mong đợi userId
        formData.append('password', password);

        const response = await fetch(`${baseUrl}/admin/users/change-password`, {
            method: 'PUT',
            headers: {
                'Authorization': this.getAuthHeader()
                // 'Content-Type' sẽ được tự động thiết lập bởi browser khi dùng FormData
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Lỗi không xác định khi parse JSON response' }));
            console.error('API Error Response:', errorData);
            throw new Error(errorData.error || `Lỗi ${response.status} khi đổi mật khẩu`);
        }
        return await response.json();
    }
};
>>>>>>> aa76187 (fix bug giao diện)
