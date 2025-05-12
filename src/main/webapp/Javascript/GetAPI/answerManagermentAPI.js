const API_ANSWER_URL = 'http://localhost:2005/PBL3/api/answers/';

// Lấy danh sách câu trả lời
async function getAnswers(type = null) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Không tìm thấy token');
    }

    try {
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        if (type !== null) {
            headers['type'] = type;
        }

        const response = await fetch(API_ANSWER_URL, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            throw new Error('Không thể lấy danh sách câu trả lời');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách câu trả lời:', error);
        throw error;
    }
}

// Lấy câu trả lời theo ID
async function getAnswerById(id, type = null) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Không tìm thấy token');
    }

    try {
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        if (type !== null) {
            headers['type'] = type;
        }

        const response = await fetch(`${API_ANSWER_URL}${id}`, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            throw new Error('Không thể lấy câu trả lời');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi lấy câu trả lời:', error);
        throw error;
    }
}

// Tạo câu trả lời mới
async function createAnswer(answer, type = null) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Không tìm thấy token');
    }

    try {
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        if (type !== null) {
            headers['type'] = type;
        }

        const response = await fetch(API_ANSWER_URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(answer)
        });

        if (!response.ok) {
            throw new Error('Không thể tạo câu trả lời');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi tạo câu trả lời:', error);
        throw error;
    }
}

// Cập nhật câu trả lời
async function updateAnswer(id, answer, type = null) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Không tìm thấy token');
    }

    try {
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        if (type !== null) {
            headers['type'] = type;
        }

        const response = await fetch(`${API_ANSWER_URL}${id}`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(answer)
        });

        if (!response.ok) {
            throw new Error('Không thể cập nhật câu trả lời');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi cập nhật câu trả lời:', error);
        throw error;
    }
}

// Xóa câu trả lời
async function deleteAnswer(id, type = null) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Không tìm thấy token');
    }

    try {
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        if (type !== null) {
            headers['type'] = type;
        }

        const response = await fetch(`${API_ANSWER_URL}${id}`, {
            method: 'DELETE',
            headers: headers
        });

        if (!response.ok) {
            throw new Error('Không thể xóa câu trả lời');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi xóa câu trả lời:', error);
        throw error;
    }
}
