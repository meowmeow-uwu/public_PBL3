// Javascript/GetAPI/questionAPI.js
const QUESTION_API_BASE_URL = `${window.APP_CONFIG.API_BASE_URL}/questions`;

// Lấy danh sách câu hỏi và câu trả lời theo exam_id
const getQuestionsByExamId = async (examId) => {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) {
            throw new Error('Chưa đăng nhập');
        }

        const response = await fetch(`${QUESTION_API_BASE_URL}/exam/${examId}`, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            }
            if (response.status === 404) {
                console.log("404");
                return []; // Trả về mảng rỗng nếu không tìm thấy câu hỏi
            }
            if (response.status === 403) {
                throw new Error('Bạn không có quyền truy cập bài kiểm tra này.');
            }
            throw new Error(`Có lỗi xảy ra khi lấy danh sách câu hỏi (Mã lỗi: ${response.status})`);
        }

        const result = await response.text();
        try {
            return JSON.parse(result);
        } catch (e) {
            return result;
        }
    } catch (error) {
        
        console.error('Lỗi khi lấy danh sách câu hỏi:', error);
        throw error;
    }
};

window.QUESTION_API = {
    getQuestionsByExamId
};