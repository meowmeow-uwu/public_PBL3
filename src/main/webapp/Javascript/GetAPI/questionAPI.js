// Javascript/GetAPI/questionAPI.js
const QUESTION_API_BASE_URL = `${window.APP_CONFIG.API_BASE_URL}/questions`;

// Giả sử fetchAPI và getToken đã được định nghĩa

window.questionAPI = {
    getByExamId: (examId) => fetchAPI(`${QUESTION_API_BASE_URL}/exam/${examId}`),
    getById: (id) => fetchAPI(`${QUESTION_API_BASE_URL}/${id}`),
    // QuestionController.createQuestion nhận Question object, trong đó cần có exam_id
    // Để liên kết, backend QuestionService.insert có thể cần xử lý thêm bảng QuestionOfExam
    // Hoặc QuestionDTO cần thêm trường exam_id để QuestionController biết.
    // Hiện tại QuestionDTO không có exam_id.
    // Giả sử backend QuestionController.createQuestion tự động liên kết nếu có trường exam_id trong JSON payload.
    create: (data) => fetchAPI(`${QUESTION_API_BASE_URL}/`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => {
        const updateData = { ...data, question_id: id };
        return fetchAPI(`${QUESTION_API_BASE_URL}/${id}`, { method: 'PUT', body: JSON.stringify(updateData) });
    },
    delete: (id) => fetchAPI(`${QUESTION_API_BASE_URL}/${id}`, { method: 'DELETE' }),
};