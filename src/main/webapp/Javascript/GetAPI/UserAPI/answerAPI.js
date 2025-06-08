// Javascript/GetAPI/answerAPI.js
const ANSWER_API_BASE_URL = `${window.APP_CONFIG.API_BASE_URL}/answers`;

// Giả sử fetchAPI và getToken đã được định nghĩa

// Kiểm tra đáp án và lưu lịch sử bài kiểm tra
const checkAnswers = async (examId, type, submissions) => {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) {
            throw new Error('Chưa đăng nhập');
        }

        const response = await fetch(`${ANSWER_API_BASE_URL}/check/${examId}`, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
                'type': type
            },
            body: JSON.stringify(submissions)
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Phiên đăng nhập đã hết hạn');
            }
            if (response.status === 400) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Dữ liệu gửi đi không hợp lệ');
            }
            throw new Error('Có lỗi xảy ra khi kiểm tra đáp án');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi kiểm tra đáp án:', error);
        throw error;
    }
};

window.ANSWER_API = {
    checkAnswers
};