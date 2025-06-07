/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/JavaScript.js to edit this template
 */

const SUB_TOPIC_API_BASE = window.APP_CONFIG.API_BASE_URL + '/subtopic';

// Lấy danh sách 
async function fetchSubTopicList({ page, pageSize, topicId, keyword }) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const _page = page || 1;
        const _pageSize = pageSize || 10;
        const _keyword = keyword || '';
        const _topicId = topicId || 1;

        const url = `${SUB_TOPIC_API_BASE}/list/${_page}/${_pageSize}/${_topicId}?keyword=${encodeURIComponent(_keyword)}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            throw new Error('Có lỗi xảy ra khi lấy danh sách subtopic');
        }

        const data = await response.json();
        console.log('Response data:', data);
        return {
            subTopics: Array.isArray(data.subTopics) ? data.subTopics : [],
            totalPages: data.totalPages
        };
    } catch (error) {
        console.error('Lỗi khi lấy danh sách subtopic:', error);
        throw error;
    }
}

// Lấy chi tiết subtopic theo ID
async function getSubTopicById(id) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(`${SUB_TOPIC_API_BASE}/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            throw new Error('Có lỗi xảy ra khi lấy thông tin subtopic');
        }

        return await response.json();
    } catch (error) {
        console.error('Lỗi khi lấy thông tin subtopic:', error);
        throw error;
    }
}

// Lấy danh sách bài học của subtopic
async function getSubTopicPosts(subTopicId) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(`${SUB_TOPIC_API_BASE}/${subTopicId}/posts`, {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            throw new Error('Có lỗi xảy ra khi lấy danh sách bài học');
        }

        return await response.json();
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bài học:', error);
        throw error;
    }
}

// Lấy danh sách bài kiểm tra của subtopic
async function getSubTopicExams(subTopicId) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(`${SUB_TOPIC_API_BASE}/${subTopicId}/exams`, {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            throw new Error('Có lỗi xảy ra khi lấy danh sách bài kiểm tra');
        }

        return await response.json();
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bài kiểm tra:', error);
        throw error;
    }
}

// Tạo subtopic mới
async function createSubTopic(data) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(SUB_TOPIC_API_BASE, {
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
            if (response.status === 400) throw new Error('Không thể tạo chủ đề con');
            throw new Error('Có lỗi xảy ra khi tạo chủ đề con');
        }

        // Trả về object chứa status và message
        return {
            status: response.status,
            message: await response.text()
        };
    } catch (error) {
        console.error('Lỗi khi tạo chủ đề con:', error);
        throw error;
    }
}

// Cập nhật subtopic
async function updateSubTopic(id, data) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(`${SUB_TOPIC_API_BASE}/${id}`, {
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
            if (response.status === 400) throw new Error('Không thể cập nhật chủ đề con');
            throw new Error('Có lỗi xảy ra khi cập nhật chủ đề con');
        }

        // Trả về object chứa status và message
        return {
            status: response.status,
            message: await response.text()
        };
    } catch (error) {
        console.error('Lỗi khi cập nhật chủ đề con:', error);
        throw error;
    }
}

// Xóa subtopic
async function deleteSubTopic(id) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(`${SUB_TOPIC_API_BASE}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            if (response.status === 403) throw new Error('Bạn không có quyền thực hiện thao tác này');
            if (response.status === 400) throw new Error('Không thể xóa chủ đề con');
            throw new Error('Có lỗi xảy ra khi xóa chủ đề con');
        }

        // Trả về object chứa status và message
        return {
            status: response.status,
            message: await response.text()
        };
    } catch (error) {
        console.error('Lỗi khi xóa chủ đề con:', error);
        throw error;
    }
}

window.SUB_TOPIC_MANAGEMENT_API = {
    fetchSubTopicList,
    getSubTopicById,
    getSubTopicPosts,
    getSubTopicExams,
    createSubTopic,
    updateSubTopic,
    deleteSubTopic
};
