// Hàm lấy tất cả lịch sử
async function getAllHistories(type) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/history/?type=${type}`, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch histories');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Hàm lấy lịch sử theo ID
async function getHistoryById(id, type) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/history/${id}?type=${type}`, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch history');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Hàm tạo lịch sử mới
async function createHistory(history, type) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/history/?type=${type}`, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(history)
        });
        if (!response.ok) {
            throw new Error('Failed to create history');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Hàm cập nhật lịch sử
async function updateHistory(id, history, type) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/history/${id}?type=${type}`, {
            method: 'PUT',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(history)
        });
        if (!response.ok) {
            throw new Error('Failed to update history');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Hàm xóa lịch sử
async function deleteHistory(id, type) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/history/${id}?type=${type}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to delete history');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Export các hàm để sử dụng ở các file khác
export {
    getAllHistories,
    getHistoryById,
    createHistory,
    updateHistory,
    deleteHistory
}; 