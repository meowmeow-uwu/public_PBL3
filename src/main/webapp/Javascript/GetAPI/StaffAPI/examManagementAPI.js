const EXAM_API_BASE = window.APP_CONFIG.API_BASE_URL + '/exam';

async function apiClient(endpoint, {method = 'GET', body = null} = {}) {
    const token = window.USER_API.getBearerToken();
    if(!token){
        throw new Error('Unauthorized: Vui lòng đăng nhập lại');
    }

    const config = {
        method: method,
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
        }
    };

    if(body){
        config.body = JSON.stringify(body);
    }

    try{
        const response = await fetch(`${EXAM_API_BASE}${endpoint}`, config);
        if(!response.ok){
            if(response.status == 401) throw new Error('Unauthorized');
            if(response.status == 403) throw new Error('Forbidden');
            if(response.status == 400) throw new Error('Unvalid data');
            throw new Error('Lỗi máy chủ: ' + response.status);
        }

        const result = await response.text();
        if(!result){
            return {success: true};
        }

        try{
            return JSON.parse(result);
        } catch(e){
            return result;
        }
    }catch (er){
        console.error(`Lỗi khi gọi API: ${endpoint}`);
        throw er;
    }

}

async function fetchExamList({ page, pageSize, subTopicId, keyword }) {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const _page = page || 1;
        const _pageSize = pageSize || 10;
        const _keyword = keyword || '';
        const _subTopicId = subTopicId || 1;

        const url = `/list/${_page}/${_pageSize}/${_subTopicId}?keyword=${encodeURIComponent(_keyword)}`;

        const data = await apiClient(url);
        return {
            exams: Array.isArray(data.exams) ? data.exams : [],
            totalPages: data.totalPages
        };
}
// Lấy chi tiết bài kiểm tra theo ID
async function getExamById(id) {
    return apiClient(`/${id}`);
}

// Tạo bài kiểm tra mới
async function createExam(data) {
   return apiClient('/', {method: 'POST', body: data});
}

// Cập nhật bài kiểm tra
async function updateExam(id, data) {
    return apiClient(`/${id}`, {method: 'PUT', body: data});
}

// Xóa bài kiểm tra
async function deleteExam(id) {
    return apiClient(`/delete/${id}`, {method: 'PUT'});
}

window.EXAM_MANAGEMENT_API = {
    getExamById,
    createExam,
    updateExam,
    deleteExam,
    fetchExamList
}; 