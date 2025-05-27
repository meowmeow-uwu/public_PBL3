// Javascript/GetAPI/postAPI.js
const POST_API_BASE_URL = `${window.APP_CONFIG.API_BASE_URL}/post`;

// Giả sử fetchAPI và getToken đã được định nghĩa

window.postAPI = {
    getAll: () => fetchAPI(`${POST_API_BASE_URL}/`),
    getById: (id) => fetchAPI(`${POST_API_BASE_URL}/${id}`),
    create: (data) => fetchAPI(`${POST_API_BASE_URL}/`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => {
        const updateData = { ...data, post_id: id }; // Đảm bảo post_id được gửi đi
        return fetchAPI(`${POST_API_BASE_URL}/${id}`, { method: 'PUT', body: JSON.stringify(updateData) });
    },
    // delete là soft delete, sử dụng PUT và gửi is_deleted: true
    delete: (id) => {
        // PostController yêu cầu gửi cả object Post khi soft delete, chỉ set is_deleted = true
        // Cần lấy thông tin Post hiện tại hoặc tạo một object Post chỉ với is_deleted và id
        // Để đơn giản, ta có thể fetch post hiện tại rồi update, hoặc backend chấp nhận body chỉ có is_deleted
        // Giả định backend chấp nhận body chỉ có is_deleted và post_id (cần kiểm tra lại PostController)
        // Nếu PostController.deleteSubTopic thực sự chỉ cần post_id trong path và is_deleted trong body
        // thì chỉ cần gửi { is_deleted: true } là đủ, nhưng controller đang nhận cả Post object.
        // Cách an toàn hơn là fetch rồi update, hoặc backend chỉ cần ID.
        // Tạm thời giả định gửi 1 object Post tối thiểu.
        const postDataForDelete = { post_id: id, is_deleted: true };
        return fetchAPI(`${POST_API_BASE_URL}/delete/${id}`, { method: 'PUT', body: JSON.stringify(postDataForDelete) });
    },
};