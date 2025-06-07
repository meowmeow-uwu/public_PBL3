const EXAM_API_BASE = window.APP_CONFIG.API_BASE_URL + '/exam';

// Lấy chi tiết bài kiểm tra theo ID
async function getExamById(id) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(`${EXAM_API_BASE}/${id}`, {
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
            throw new Error('Có lỗi xảy ra khi lấy thông tin bài kiểm tra');
        }

        const result = await response.text();
        try {
            return JSON.parse(result);
        } catch (e) {
            return result;
        }
    } catch (error) {
        console.error('Lỗi khi lấy thông tin bài kiểm tra:', error);
        throw error;
    }
}

// Tạo bài kiểm tra mới
async function createExam(data) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(EXAM_API_BASE, {
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
            throw new Error('Có lỗi xảy ra khi tạo bài kiểm tra mới');
        }

        const result = await response.text();
        try {
            const jsonResult = JSON.parse(result);
            return {
                status: response.status,
                message: jsonResult.message || 'Tạo bài kiểm tra thành công',
                data: jsonResult
            };
        } catch (e) {
            return {
                status: response.status,
                message: result || 'Tạo bài kiểm tra thành công'
            };
        }
    } catch (error) {
        console.error('Lỗi khi tạo bài kiểm tra mới:', error);
        throw error;
    }
}

// Cập nhật bài kiểm tra
async function updateExam(id, data) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(`${EXAM_API_BASE}/${id}`, {
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
            throw new Error('Có lỗi xảy ra khi cập nhật bài kiểm tra');
        }

        const result = await response.text();
        try {
            const jsonResult = JSON.parse(result);
            return {
                status: response.status,
                message: jsonResult.message || 'Cập nhật bài kiểm tra thành công',
                data: jsonResult
            };
        } catch (e) {
            return {
                status: response.status,
                message: result || 'Cập nhật bài kiểm tra thành công'
            };
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật bài kiểm tra:', error);
        throw error;
    }
}

// Xóa bài kiểm tra
async function deleteExam(id) {
    try {
        const token = window.USER_API.getBearerToken();
        if (!token) throw new Error('Unauthorized: Vui lòng đăng nhập lại');

        const response = await fetch(`${EXAM_API_BASE}/delete/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            if (response.status === 403) throw new Error('Bạn không có quyền thực hiện thao tác này');
            if (response.status === 400) throw new Error('Dữ liệu không hợp lệ');
            throw new Error('Có lỗi xảy ra khi xóa bài kiểm tra');
        }

        const result = await response.text();
        try {
            const jsonResult = JSON.parse(result);
            return {
                status: response.status,
                message: jsonResult.message || 'Xóa bài kiểm tra thành công',
                data: jsonResult
            };
        } catch (e) {
            return {
                status: response.status,
                message: result || 'Xóa bài kiểm tra thành công'
            };
        }
    } catch (error) {
        console.error('Lỗi khi xóa bài kiểm tra:', error);
        throw error;
    }
}

window.EXAM_MANAGEMENT_API = {
    getExamById,
    createExam,
    updateExam,
    deleteExam
}; 