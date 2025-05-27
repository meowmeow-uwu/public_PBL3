// Javascript/GetAPI/examAPI.js
const EXAM_API_BASE_URL = `${window.APP_CONFIG.API_BASE_URL}/exam`;

// Giả sử fetchAPI và getToken đã được định nghĩa

window.examAPI = {
    getAll: () => fetchAPI(`${EXAM_API_BASE_URL}/`),
    getById: (id) => fetchAPI(`${EXAM_API_BASE_URL}/${id}`),
    getBySubTopicId: (subTopicId) => fetchAPI(`${EXAM_API_BASE_URL}/subtopic/${subTopicId}`),
    create: (data) => fetchAPI(`${EXAM_API_BASE_URL}/`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => {
        const updateData = { ...data, exam_id: id };
        return fetchAPI(`${EXAM_API_BASE_URL}/${id}`, { method: 'PUT', body: JSON.stringify(updateData) });
    },
    // delete là soft delete, sử dụng PUT
    delete: (id) => {
        const examDataForDelete = { exam_id: id, is_deleted: true };
        return fetchAPI(`${EXAM_API_BASE_URL}/delete/${id}`, { method: 'PUT', body: JSON.stringify(examDataForDelete) });
    },
};