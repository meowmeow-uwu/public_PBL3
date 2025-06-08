/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/JavaScript.js to edit this template
 */

const TOPIC_API_BASE = window.APP_CONFIG.API_BASE_URL + '/topic';

// Lấy danh sách 
async function fetchTopicList({ page, pageSize, keyword }) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const _page = page || 1;
        const _pageSize = pageSize || 10;
        const _keyword = keyword || '';

        const url = `${TOPIC_API_BASE}/list/${_page}/${_pageSize}?keyword=${encodeURIComponent(_keyword)}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            throw new Error('Có lỗi xảy ra khi lấy danh sách topic');
        }

        const data = await response.json();
        console.log('Response data:', data);
        return {
            topics: Array.isArray(data.topics) ? data.topics : [],
            totalPages: data.totalPages
        };
    } catch (error) {
        console.error('Lỗi khi lấy danh sách topic:', error);
        throw error;
    }
}

// Lấy chi tiết topic theo ID
async function getTopicById(id) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(`${TOPIC_API_BASE}/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            throw new Error('Có lỗi xảy ra khi lấy thông tin topic');
        }

        return await response.json();
    } catch (error) {
        console.error('Lỗi khi lấy thông tin topic:', error);
        throw error;
    }
}

// Tạo topic mới
async function createTopic(data) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(TOPIC_API_BASE, {
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
            if (response.status === 400) throw new Error('Không thể tạo chủ đề');
            throw new Error('Có lỗi xảy ra khi tạo topic');
        }

        // Trả về object chứa status và message
        return {
            status: response.status,
            message: await response.text()
        };
    } catch (error) {
        console.error('Lỗi khi tạo topic mới:', error);
        throw error;
    }
}

// Cập nhật topic
async function updateTopic(id, data) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(`${TOPIC_API_BASE}/${id}`, {
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
            if (response.status === 400) throw new Error('Không thể cập nhật chủ đề');
            throw new Error('Có lỗi xảy ra khi cập nhật topic');
        }

        // Trả về object chứa status và message
        return {
            status: response.status,
            message: await response.text()
        };
    } catch (error) {
        console.error('Lỗi khi cập nhật topic:', error);
        throw error;
    }
}

// Xóa topic
async function deleteTopic(id) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(`${TOPIC_API_BASE}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            if (response.status === 403) throw new Error('Bạn không có quyền thực hiện thao tác này');
            if (response.status === 400) throw new Error('Không thể xóa chủ đề');
            throw new Error('Có lỗi xảy ra khi xóa topic');
        }

        // Trả về object chứa status và message
        return {
            status: response.status,
            message: await response.text()
        };
    } catch (error) {
        console.error('Lỗi khi xóa topic:', error);
        throw error;
    }
}

window.TOPIC_MANAGEMENT_API = {
    fetchTopicList,
    getTopicById,
    createTopic,
    updateTopic,
    deleteTopic
};