const API_BASE = window.APP_CONFIG.API_BASE_URL;

// Lấy danh sách đáp án của một câu hỏi
async function getAnswersByQuestionId(questionId) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(`${API_BASE}/questions/${questionId}/answers`, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            if (response.status === 403) throw new Error('Bạn không có quyền thực hiện thao tác này');
            if (response.status === 400) throw new Error('Dữ liệu không hợp lệ');
            throw new Error('Có lỗi xảy ra khi lấy danh sách đáp án');
        }

        const result = await response.text();
        try {
            return JSON.parse(result);
        } catch (e) {
            return result;
        }
    } catch (error) {
        console.error('Lỗi khi lấy danh sách đáp án:', error);
        throw error;
    }
}

// Lấy chi tiết đáp án theo ID
async function getAnswerById(id) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(`${API_BASE}/answers/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            if (response.status === 403) throw new Error('Bạn không có quyền thực hiện thao tác này');
            if (response.status === 400) throw new Error('Dữ liệu không hợp lệ');
            throw new Error('Có lỗi xảy ra khi lấy thông tin đáp án');
        }

        const result = await response.text();
        try {
            return JSON.parse(result);
        } catch (e) {
            return result;
        }
    } catch (error) {
        console.error('Lỗi khi lấy thông tin đáp án:', error);
        throw error;
    }
}

// Tạo đáp án mới
async function createAnswer(data) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(`${API_BASE}/answers/`, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            if (response.status === 403) throw new Error('Bạn không có quyền thực hiện thao tác này');
            if (response.status === 400) throw new Error('Dữ liệu không hợp lệ');
            throw new Error('Có lỗi xảy ra khi tạo đáp án mới');
        }

        const result = await response.text();
        try {
            const jsonResult = JSON.parse(result);
            return {
                status: response.status,
                message: jsonResult.message || 'Tạo đáp án thành công',
                data: jsonResult
            };
        } catch (e) {
            return {
                status: response.status,
                message: result || 'Tạo đáp án thành công'
            };
        }
    } catch (error) {
        console.error('Lỗi khi tạo đáp án mới:', error);
        throw error;
    }
}

// Cập nhật đáp án
async function updateAnswer(id, data) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(`${API_BASE}/answers/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            if (response.status === 403) throw new Error('Bạn không có quyền thực hiện thao tác này');
            if (response.status === 400) throw new Error('Dữ liệu không hợp lệ');
            throw new Error('Có lỗi xảy ra khi cập nhật đáp án');
        }

        const result = await response.text();
        try {
            const jsonResult = JSON.parse(result);
            return {
                status: response.status,
                message: jsonResult.message || 'Cập nhật đáp án thành công',
                data: jsonResult
            };
        } catch (e) {
            return {
                status: response.status,
                message: result || 'Cập nhật đáp án thành công'
            };
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật đáp án:', error);
        throw error;
    }
}

// Xóa đáp án
async function deleteAnswer(id) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(`${API_BASE}/answers/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            if (response.status === 403) throw new Error('Bạn không có quyền thực hiện thao tác này');
            if (response.status === 400) throw new Error('Dữ liệu không hợp lệ');
            throw new Error('Có lỗi xảy ra khi xóa đáp án');
        }

        const result = await response.text();
        try {
            const jsonResult = JSON.parse(result);
            return {
                status: response.status,
                message: jsonResult.message || 'Xóa đáp án thành công',
                data: jsonResult
            };
        } catch (e) {
            return {
                status: response.status,
                message: result || 'Xóa đáp án thành công'
            };
        }
    } catch (error) {
        console.error('Lỗi khi xóa đáp án:', error);
        throw error;
    }
}

window.ANSWER_MANAGEMENT_API = {
    getAnswersByQuestionId,
    getAnswerById,
    createAnswer,
    updateAnswer,
    deleteAnswer
};