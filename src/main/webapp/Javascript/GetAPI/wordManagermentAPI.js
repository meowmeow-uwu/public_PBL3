const WORD_API_BASE = window.APP_CONFIG.API_BASE_URL + '/admin/words';

function getToken() {
    const token = localStorage.getItem('token');
    if (!token)
        return null;
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
}

// 1. Lấy một từ theo ID
async function getWordById(id) {
    const token = getToken();
    if (!token) throw new Error('Unauthorized');
    
    const res = await fetch(`${WORD_API_BASE}/${id}`, {
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
        }
    });
    if (!res.ok)
        throw new Error('Không tìm thấy từ vựng');
    return await res.json();
}

// 2. Lấy danh sách từ có phân trang, lọc theo ngôn ngữ và từ khóa
async function getWordList({ page = 1, size = 20, language_id = 1, keyword = '' }) {
    const token = getToken();
    if (!token) throw new Error('Unauthorized');
    
    let url = `${WORD_API_BASE}/list/${page}/${size}/${language_id}`;
    if (keyword)
        url += `?keyword=${encodeURIComponent(keyword)}`;
    
    console.log('Request URL:', url);
    
    try {
        const res = await fetch(url, {
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error('API Error:', {
                status: res.status,
                statusText: res.statusText,
                body: errorText
            });
            throw new Error(`Không thể lấy danh sách từ vựng: ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log('API Response:', data);
        
        // Kiểm tra và chuẩn hóa dữ liệu
        if (!data) {
            console.error('Invalid response format:', data);
            throw new Error('Định dạng dữ liệu không hợp lệ');
        }
        
        // Nếu data là mảng, chuyển đổi thành object có cấu trúc chuẩn
        const words = Array.isArray(data) ? data : (data.words || []);
        
        return {
            words: (data.words || []).map(item => ({
                word_id: item.word.word_id,
                word_name: item.word.word_name,
                pronunciation: item.word.pronunciation,
                image: item.word.image,
                sound: item.word.sound,
                language_id: item.word.language_id
            })),
            totalPages: data.totalPages || 1
        };
    } catch (error) {
        console.error('Error in getWordList:', error);
        throw error;
    }
}

// 3. Thêm từ mới (POST /create)
async function createWord(wordData) {
    const token = getToken();
    if (!token) throw new Error('Unauthorized');
    
    const formData = new FormData();
    formData.append('word_name', wordData.word_name);
    formData.append('pronunciation', wordData.pronunciation || '');
    formData.append('language_id', wordData.language_id);

    if (wordData.image instanceof File) {
        formData.append('image', wordData.image);
    } else if (wordData.image) {
        formData.append('image', wordData.image);
    }

    if (wordData.sound instanceof File) {
        formData.append('sound', wordData.sound);
    } else if (wordData.sound) {
        formData.append('sound', wordData.sound);
    }

    const res = await fetch(`${WORD_API_BASE}/create`, {
        method: 'POST',
        headers: {
            'Authorization': token
        },
        body: formData
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error('Create word error:', errorText);
        throw new Error('Thêm từ mới thất bại');
    }
    return await res.json();
}

// 4. Cập nhật từ (PUT /update)
async function updateWord(wordData) {
    const token = getToken();
    if (!token) throw new Error('Unauthorized');
    
    const formData = new FormData();
    formData.append('id', wordData.id);
    formData.append('word_name', wordData.word_name);
    formData.append('pronunciation', wordData.pronunciation || '');
    formData.append('language_id', wordData.language_id);

    if (wordData.image instanceof File) {
        formData.append('image', wordData.image);
    } else if (wordData.image) {
        formData.append('image', wordData.image);
    }

    if (wordData.sound instanceof File) {
        formData.append('sound', wordData.sound);
    } else if (wordData.sound) {
        formData.append('sound', wordData.sound);
    }

    const res = await fetch(`${WORD_API_BASE}/update`, {
        method: 'PUT',
        headers: {
            'Authorization': token
        },
        body: formData
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error('Update word error:', errorText);
        throw new Error('Cập nhật từ thất bại');
    }
    return await res.json();
}

// 5. Xóa từ (DELETE /delete/{id})
async function deleteWordAPI(id) {
    const token = getToken();
    if (!token) throw new Error('Unauthorized');
    
    const res = await fetch(`${WORD_API_BASE}/delete/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': token,
        }
    });
    
    if (!res.ok) {
        const errorText = await res.text();
        console.error('Delete word error:', errorText);
        throw new Error('Xóa từ thất bại');
    }
    return await res.json();
}
