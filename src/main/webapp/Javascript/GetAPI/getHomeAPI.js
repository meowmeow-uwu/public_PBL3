// Định nghĩa API endpoints
const API_BASE = window.APP_CONFIG.API_BASE_URL;

function getToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
}

// Định nghĩa homeAPI object
const homeAPI = {
    // Lấy số từ theo ngôn ngữ
    async getNumberWord(languageId) {
        try {
            const response = await fetch(`${API_BASE}/admin/words/getNumber/${languageId}`, {
                method: 'GET',
                headers: {
                    'Authorization': getToken(),
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Không thể lấy số từ');
            }
            return await response.json();
        } catch (error) {
            console.error('Lỗi khi lấy số từ:', error);
            throw error;
        }
    },

    // Lấy số người dùng theo nhóm
    async getNumberUser(groupUserId) {
        try {
            const response = await fetch(`${API_BASE}/admin/users/getNumber/${groupUserId}`, {
                method: 'GET',
                headers: {
                    'Authorization': getToken(),
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Không thể lấy số người dùng');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Lỗi khi lấy số người dùng:', error);
            throw error;
        }
    },

    // Lấy số bài đăng
    async getNumberPost() {
        try {
            const response = await fetch(`${API_BASE}/post/getNumber`, {
                method: 'GET',
                headers: {
                    'Authorization': getToken(),
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Không thể lấy số bài đăng');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Lỗi khi lấy số bài đăng:', error);
            throw error;
        }
    },

    // Lấy tất cả thống kê
    async getAllStatistics() {
        try {
            const [wordsEn, wordsVi, all, admin, user, staff, posts] = await Promise.all([
                this.getNumberWord(1), // Tiếng Anh
                this.getNumberWord(2), // Tiếng Việt
                this.getNumberUser(0), // 0 để lấy tất cả người dùng
                this.getNumberUser(1), // 0 để lấy tất cả người dùng
                this.getNumberUser(2), // 0 để lấy tất cả người dùng
                this.getNumberUser(3), // 0 để lấy tất cả người dùng
                this.getNumberPost()
            ]);

            return {
                totalWordsEn: wordsEn.number,
                totalWordsVi: wordsVi.number,
                totalAlls: all.number,
                totalAdmins: admin.number,
                totalUsers: user.number,
                totalStaffs: staff.number,
                totalPosts: posts.number
            };
        } catch (error) {
            console.error('Lỗi khi lấy thống kê:', error);
            throw error;
        }
    }
};

// Export homeAPI để sử dụng ở các file khác
window.homeAPI = homeAPI;
