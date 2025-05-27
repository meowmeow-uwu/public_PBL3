// Javascript/GetAPI/answerAPI.js
const ANSWER_API_BASE_URL = `${window.APP_CONFIG.API_BASE_URL}/answers`;

// Giả sử fetchAPI và getToken đã được định nghĩa

window.answerAPI = {
    // AnswerController dùng header 'type' để phân biệt, '0' cho câu trả lời Question thường
    getByQuestionId: (questionId) => fetchAPI(`${QUESTION_API_BASE_URL}/${questionId}/answers`, { headers: { 'type': '0' } }), // Gọi qua QuestionController
    getById: (id) => fetchAPI(`${ANSWER_API_BASE_URL}/${id}`, { headers: { 'type': '0' } }),
    create: (data) => fetchAPI(`${ANSWER_API_BASE_URL}/`, { method: 'POST', body: JSON.stringify(data), headers: { 'type': '0' } }),
    update: (id, data) => {
        const updateData = { ...data, answer_id: id };
        return fetchAPI(`${ANSWER_API_BASE_URL}/${id}`, { method: 'PUT', body: JSON.stringify(updateData), headers: { 'type': '0' } });
    },
    delete: (id) => fetchAPI(`${ANSWER_API_BASE_URL}/${id}`, { method: 'DELETE', headers: { 'type': '0' } }),
};