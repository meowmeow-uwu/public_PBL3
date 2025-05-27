// Javascript/GetAPI/subTopicAPI.js
const SUBTOPIC_API_BASE_URL = `${window.APP_CONFIG.API_BASE_URL}/subtopic`;

// Giả sử fetchAPI và getToken đã được định nghĩa ở file chung và import, hoặc định nghĩa lại ở đây
// const getToken = () => `Bearer ${localStorage.getItem('token')}`;
// async function fetchAPI(url, options = {}) { ... } // Copy từ topicAPI.js nếu cần

window.subTopicAPI = {
    getAll: () => fetchAPI(`${SUBTOPIC_API_BASE_URL}/`),
    getById: (id) => fetchAPI(`${SUBTOPIC_API_BASE_URL}/${id}`),
    getPosts: (subTopicId) => fetchAPI(`${SUBTOPIC_API_BASE_URL}/${subTopicId}/posts`),
    getExams: (subTopicId) => fetchAPI(`${SUBTOPIC_API_BASE_URL}/${subTopicId}/exams`),
    create: (data) => fetchAPI(`${SUBTOPIC_API_BASE_URL}/`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => {
        const updateData = { ...data, sub_topic_id: id };
        return fetchAPI(`${SUBTOPIC_API_BASE_URL}/${id}`, { method: 'PUT', body: JSON.stringify(updateData) });
    },
    delete: (id) => fetchAPI(`${SUBTOPIC_API_BASE_URL}/${id}`, { method: 'DELETE' }),
};