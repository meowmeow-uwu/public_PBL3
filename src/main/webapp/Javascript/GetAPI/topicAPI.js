// Javascript/GetAPI/topicAPI.js
const TOPIC_API_BASE_URL = `${window.APP_CONFIG.API_BASE_URL}/topic`;

// Hàm getToken nên được định nghĩa ở một file chung (ví dụ: utils.js hoặc auth.js)
// Giả sử bạn đã có hàm getToken() global hoặc import nó.
// Nếu chưa, bạn có thể thêm lại ở đây hoặc tốt nhất là tạo file utils.js
// const getToken = () => `Bearer ${localStorage.getItem('token')}`;

async function fetchAPI(url, options = {}) {
    const token = getToken(); // Đảm bảo hàm getToken() đã được định nghĩa và có sẵn
    const headers = {
        'Authorization': token,
        'Content-Type': 'application/json',
        ...options.headers,
    };
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Lỗi không xác định từ máy chủ." }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.status === 204 ? null : response.json();
}

window.topicAPI = {
    getAll: () => fetchAPI(`${TOPIC_API_BASE_URL}/`),
    getById: (id) => fetchAPI(`${TOPIC_API_BASE_URL}/${id}`),
    getSubTopics: (topicId) => fetchAPI(`${TOPIC_API_BASE_URL}/${topicId}/subtopics`),
    create: (data) => fetchAPI(`${TOPIC_API_BASE_URL}/`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => {
        const updateData = { ...data, topic_id: id }; // Đảm bảo topic_id được gửi đi cho backend
        return fetchAPI(`${TOPIC_API_BASE_URL}/${id}`, { method: 'PUT', body: JSON.stringify(updateData) });
    },
    delete: (id) => fetchAPI(`${TOPIC_API_BASE_URL}/${id}`, { method: 'DELETE' }),
};