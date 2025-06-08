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
                throw new Error('Phiên đăng nhập đã hết hạn');
            }
            if (response.status === 404) {
                throw new Error('Không tìm thấy bài kiểm tra');
            }
            throw new Error('Có lỗi xảy ra khi lấy danh sách câu hỏi');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách câu hỏi:', error);
        throw error;
    }
};

window.QUESTION_API = {
    getQuestionsByExamId
};