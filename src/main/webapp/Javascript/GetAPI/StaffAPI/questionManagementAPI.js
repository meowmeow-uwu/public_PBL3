const QUESTION_API_BASE = window.APP_CONFIG.API_BASE_URL + '/questions';

// Lấy danh sách câu hỏi của bài kiểm tra
async function getQuestionsByExamId(examId) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(`${QUESTION_API_BASE}/exam/${examId}`, {
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
            if (response.status === 404) return [];
            throw new Error('Có lỗi xảy ra khi lấy danh sách câu hỏi');
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
}

// Lấy chi tiết câu hỏi theo ID
async function getQuestionById(id) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(`${QUESTION_API_BASE}/${id}`, {
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
            throw new Error('Có lỗi xảy ra khi lấy thông tin câu hỏi');
        }

        const result = await response.text();
        try {
            return JSON.parse(result);
        } catch (e) {
            return result;
        }
    } catch (error) {
        console.error('Lỗi khi lấy thông tin câu hỏi:', error);
        throw error;
    }
}

// Tạo câu hỏi mới
async function createQuestion(examId, data) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(`${QUESTION_API_BASE}/${examId}`, {
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
            throw new Error('Có lỗi xảy ra khi tạo câu hỏi mới');
        }

        const result = await response.text();
        try {
            const jsonResult = JSON.parse(result);
            return {
                status: response.status,
                message: jsonResult.message || 'Tạo câu hỏi thành công',
                data: jsonResult
            };
        } catch (e) {
            return {
                status: response.status,
                message: result || 'Tạo câu hỏi thành công'
            };
        }
    } catch (error) {
        console.error('Lỗi khi tạo câu hỏi mới:', error);
        throw error;
    }
}

// Cập nhật câu hỏi
async function updateQuestion(id, data) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(`${QUESTION_API_BASE}/${id}`, {
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
            throw new Error('Có lỗi xảy ra khi cập nhật câu hỏi');
        }

        const result = await response.text();
        try {
            const jsonResult = JSON.parse(result);
            return {
                status: response.status,
                message: jsonResult.message || 'Cập nhật câu hỏi thành công',
                data: jsonResult
            };
        } catch (e) {
            return {
                status: response.status,
                message: result || 'Cập nhật câu hỏi thành công'
            };
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật câu hỏi:', error);
        throw error;
    }
}

// Xóa câu hỏi
async function deleteQuestion(id) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(`${QUESTION_API_BASE}/${id}`, {
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
            throw new Error('Có lỗi xảy ra khi xóa câu hỏi');
        }

        const result = await response.text();
        try {
            const jsonResult = JSON.parse(result);
            return {
                status: response.status,
                message: jsonResult.message || 'Xóa câu hỏi thành công',
                data: jsonResult
            };
        } catch (e) {
            return {
                status: response.status,
                message: result || 'Xóa câu hỏi thành công'
            };
        }
    } catch (error) {
        console.error('Lỗi khi xóa câu hỏi:', error);
        throw error;
    }
}

window.QUESTION_MANAGEMENT_API = {
    getQuestionsByExamId,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion
}; 