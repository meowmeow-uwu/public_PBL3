const POST_API_BASE = window.APP_CONFIG.API_BASE_URL + '/post';

// Lấy danh sách bài học theo trang
async function fetchPostList({ page, pageSize, subTopicId, keyword }) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const _page = page || 1;
        const _pageSize = pageSize || 10;
        const _keyword = keyword || '';
        const _subTopicId = subTopicId || 1;

        const url = `${POST_API_BASE}/list/${_page}/${_pageSize}/${_subTopicId}?keyword=${encodeURIComponent(_keyword)}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            throw new Error('Có lỗi xảy ra khi lấy danh sách bài học');
        }

        const data = await response.json();
        console.log('Response data:', data);
        return {
            posts: Array.isArray(data.posts) ? data.posts : [],
            totalPages: data.totalPages
        };
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bài học:', error);
        throw error;
    }
}

// Lấy chi tiết bài học theo ID
async function getPostById(id) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(`${POST_API_BASE}/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            throw new Error('Có lỗi xảy ra khi lấy thông tin bài học');
        }

        return await response.json();
    } catch (error) {
        console.error('Lỗi khi lấy thông tin bài học:', error);
        throw error;
    }
}

// Tạo bài học mới
async function createPost(data) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(`${POST_API_BASE}/`, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            if (response.status === 403) throw new Error('Bạn không có quyền thực hiện thao tác này');
            if (response.status === 400) throw new Error('Dữ liệu không hợp lệ');
            throw new Error('Có lỗi xảy ra khi tạo bài học');
        }

        const result = await response.text();
        return {
            status: response.status,
            message: result || 'Tạo bài học thành công'
        };
    } catch (error) {
        console.error('Lỗi khi tạo bài học:', error);
        throw error;
    }
}

// Cập nhật bài học
async function updatePost(id, data) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(`${POST_API_BASE}/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            if (response.status === 403) throw new Error('Bạn không có quyền thực hiện thao tác này');
            if (response.status === 400) throw new Error('Dữ liệu không hợp lệ');
            throw new Error('Có lỗi xảy ra khi cập nhật bài học');
        }

        const result = await response.text();
        return {
            status: response.status,
            message: result || 'Cập nhật bài học thành công'
        };
    } catch (error) {
        console.error('Lỗi khi cập nhật bài học:', error);
        throw error;
    }
}

// Xóa bài học
async function deletePost(id) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(`${POST_API_BASE}/delete/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            if (response.status === 403) throw new Error('Bạn không có quyền thực hiện thao tác này');
            if (response.status === 400) throw new Error('Dữ liệu không hợp lệ');
            throw new Error('Có lỗi xảy ra khi xóa bài học');
        }

        const result = await response.text();
        return {
            status: response.status,
            message: result || 'Xóa bài học thành công'
        };
    } catch (error) {
        console.error('Lỗi khi xóa bài học:', error);
        throw error;
    }
}

window.POST_MANAGEMENT_API = {
    fetchPostList,
    getPostById,
    createPost,
    updatePost,
    deletePost
}; 