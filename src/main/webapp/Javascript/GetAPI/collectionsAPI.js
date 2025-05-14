const USER_BASE_URL = window.APP_CONFIG.API_BASE_URL +'/collections';

function getToken() {
    return localStorage.getItem('token');
}
// lấy danh sách bộ sưu tập của người dùng hiện tại
async function getUserCollections() {
    try {
        const response = await fetch(`${USER_BASE_URL}/user`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            }
            throw new Error('Có lỗi xảy ra khi lấy danh sách bộ sưu tập');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bộ sưu tập:', error);
        throw error;
    }
}

// Xóa bộ sưu tập theo ID
async function deleteCollection(collectionId) {
    try {
        const response = await fetch(`${USER_BASE_URL}/${collectionId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            }
            if (response.status === 403) {
                throw new Error('Forbidden: Bạn không có quyền xóa bộ sưu tập này');
            }
            throw new Error('Có lỗi xảy ra khi xóa bộ sưu tập');
        }

        return true;
    } catch (error) {
        console.error('Lỗi khi xóa bộ sưu tập:', error);
        throw error;
    }
}

// Tạo bộ sưu tập mới
async function createCollection(name) {
    try {
        const formData = new URLSearchParams();
        formData.append('name', name);

        const response = await fetch(`${USER_BASE_URL}/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            }
            throw new Error('Có lỗi xảy ra khi tạo bộ sưu tập');
        }

        const data = await response.json();
        return data.collectionId;
    } catch (error) {
        console.error('Lỗi khi tạo bộ sưu tập:', error);
        throw error;
    }
}

// Thêm từ vào bộ sưu tập
async function addWordToCollection(collectionId, wordId) {
    try {
        const response = await fetch(`${USER_BASE_URL}/${collectionId}/words/${wordId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            }
            if (response.status === 403) {
                throw new Error('Forbidden: Bạn không có quyền thêm từ vào bộ sưu tập này');
            }
            throw new Error('Có lỗi xảy ra khi thêm từ vào bộ sưu tập');
        }

        return true;
    } catch (error) {
        console.error('Lỗi khi thêm từ vào bộ sưu tập:', error);
        throw error;
    }
}

// Lấy danh sách từ trong bộ sưu tập
async function getWordsInCollection(collectionId) {
    if (!collectionId) {
        throw new Error('ID bộ sưu tập không hợp lệ');
    }

    try {
        const response = await fetch(`${USER_BASE_URL}/${collectionId}/words`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            }
            if (response.status === 403) {
                throw new Error('Forbidden: Bạn không có quyền xem bộ sưu tập này');
            }
            throw new Error('Có lỗi xảy ra khi lấy danh sách từ');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách từ:', error);
        throw error;
    }
}

// Cập nhật bộ sưu tập
async function updateCollection(collectionId, name) {
    try {
        const formData = new FormData();
        formData.append('name', name);

        const response = await fetch(`${USER_BASE_URL}/${collectionId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            body: formData
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            }
            if (response.status === 403) {
                throw new Error('Forbidden: Bạn không có quyền cập nhật bộ sưu tập này');
            }
            throw new Error('Có lỗi xảy ra khi cập nhật bộ sưu tập');
        }

        return true;
    } catch (error) {
        console.error('Lỗi khi cập nhật bộ sưu tập:', error);
        throw error;
    }
}

// Xóa từ khỏi bộ sưu tập
async function deleteWordFromCollection(collectionId, wordId) {
    try {
        const formData = new FormData();
        formData.append('wordId', wordId);

        const response = await fetch(`${USER_BASE_URL}/${collectionId}/delete-word`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            body: formData
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            }
            if (response.status === 403) {
                throw new Error('Forbidden: Bạn không có quyền xóa từ khỏi bộ sưu tập này');
            }
            throw new Error('Có lỗi xảy ra khi xóa từ khỏi bộ sưu tập');
        }

        return true;
    } catch (error) {
        console.error('Lỗi khi xóa từ khỏi bộ sưu tập:', error);
        throw error;
    }
}


