const USER_BASE_URL = window.APP_CONFIG.API_BASE_URL +'/collections';

function getToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
}
// lấy danh sách bộ sưu tập của người dùng hiện tại
async function getUserCollections() {
    try {
        const token = getToken();
        if (!token) {
            throw new Error('Unauthorized: Vui lòng đăng nhập lại');
        }

        const response = await fetch(`${USER_BASE_URL}/user`, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            }
            throw new Error('Có lỗi xảy ra khi lấy danh sách bộ sưu tập');
        }

        const data = await response.json();
        console.log('Dữ liệu bộ sưu tập từ API:', data); // Debug log
        return data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bộ sưu tập:', error);
        throw error;
    }
}

// Xóa bộ sưu tập theo ID
async function deleteCollection(collectionId) {
    if (!collectionId) {
        throw new Error('ID bộ sưu tập không hợp lệ');
    }

    try {
        const token = getToken();
        if (!token) {
            throw new Error('Unauthorized: Vui lòng đăng nhập lại');
        }

        console.log('Đang gọi API xóa bộ sưu tập với ID:', collectionId); // Debug log
        const response = await fetch(`${USER_BASE_URL}/${collectionId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
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
        const token = getToken();
        if (!token) {
            throw new Error('Unauthorized: Vui lòng đăng nhập lại');
        }

        const formData = new URLSearchParams();
        formData.append('name', name);

        const response = await fetch(`${USER_BASE_URL}/create`, {
            method: 'POST',
            headers: {
                'Authorization': token,
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
        const token = getToken();
        if (!token) {
            throw new Error('Unauthorized: Vui lòng đăng nhập lại');
        }

        console.log('Thêm từ vào bộ sưu tập:', { collectionId, wordId });

        const response = await fetch(`${USER_BASE_URL}/${collectionId}/words/${wordId}`, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error:', errorText);

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
        const token = getToken();
        if (!token) {
            throw new Error('Unauthorized: Vui lòng đăng nhập lại');
        }

        console.log('Gọi API với token:', token);

        const response = await fetch(`${USER_BASE_URL}/${collectionId}/words`, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error:', errorText);

            if (response.status === 401) {
                throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            }
            if (response.status === 403) {
                throw new Error('Forbidden: Bạn không có quyền xem bộ sưu tập này');
            }
            throw new Error('Có lỗi xảy ra khi lấy danh sách từ');
        }

        const data = await response.json();
        console.log('Danh sách từ nhận được:', data);
        return data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách từ:', error);
        throw error;
    }
}

// Cập nhật bộ sưu tập
async function updateCollection(collectionId, name) {
    try {
        console.log('Đang cập nhật bộ sưu tập:', { collectionId, name }); // Debug log

        const token = getToken();
        if (!token) {
            throw new Error('Unauthorized: Vui lòng đăng nhập lại');
        }

        const formData = new URLSearchParams();
        formData.append('name', name);

        const url = `${USER_BASE_URL}/${collectionId}`;
        console.log('URL cập nhật:', url); // Debug log
        console.log('Dữ liệu gửi đi:', formData.toString()); // Debug log

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });

        console.log('Response status:', response.status); // Debug log

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error:', errorText); // Debug log

            if (response.status === 401) {
                throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            }
            if (response.status === 403) {
                throw new Error('Forbidden: Bạn không có quyền cập nhật bộ sưu tập này');
            }
            throw new Error(`Có lỗi xảy ra khi cập nhật bộ sưu tập: ${errorText}`);
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
        const token = getToken();
        if (!token) {
            throw new Error('Unauthorized: Vui lòng đăng nhập lại');
        }

        const formData = new URLSearchParams();
        formData.append('wordId', wordId);

        const response = await fetch(`${USER_BASE_URL}/${collectionId}/delete-word`, {
            method: 'DELETE',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
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

// Thêm người dùng vào bộ sưu tập
async function addUserToCollection(collectionId) {
    try {
        console.log('Đang thêm người dùng vào bộ sưu tập:', collectionId); // Debug log

        const token = getToken();
        if (!token) {
            throw new Error('Unauthorized: Vui lòng đăng nhập lại');
        }

        const formData = new URLSearchParams();
        formData.append('collectionId', collectionId);

        const response = await fetch(`${USER_BASE_URL}/Add/${collectionId}`, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });

        console.log('Response status:', response.status); // Debug log

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error:', errorText); // Debug log

            if (response.status === 401) {
                throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            }
            if (response.status === 403) {
                throw new Error('Forbidden: Bạn không có quyền thêm vào bộ sưu tập này');
            }
            throw new Error(`Có lỗi xảy ra khi thêm vào bộ sưu tập: ${errorText}`);
        }

        return true;
    } catch (error) {
        console.error('Lỗi khi thêm vào bộ sưu tập:', error);
        throw error;
    }
}

// Export các hàm để sử dụng ở các file khác
window.collectionsAPI = {
    getUserCollections,
    deleteCollection,
    createCollection,
    addWordToCollection,
    getWordsInCollection,
    updateCollection,
    deleteWordFromCollection,
    addUserToCollection
};


