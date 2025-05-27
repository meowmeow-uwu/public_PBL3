/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/JavaScript.js to edit this template
 */

const TRANSLATE_API_BASE = window.APP_CONFIG.API_BASE_URL + '/translate';

function getToken() {
    const token = localStorage.getItem('token');
    if (!token)
        return null;
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
}

// 1. Dịch từ
async function translateWord(sourceWord, sourceLanguageId, targetLanguageId) {
    try {
        const response = await fetch(`${TRANSLATE_API_BASE}/${sourceWord}/${sourceLanguageId}/${targetLanguageId}`, {
            method: 'GET',
            headers: {
                'Authorization': `${getToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Không thể dịch từ');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Lỗi:', error);
        throw error;
    }
}

// 2. Tạo bản dịch mới
async function createTranslate(sourceId, targetId, typeTranslateId) {
    try {
        const body = new URLSearchParams();
        body.append('sourceId', sourceId);
        body.append('targetId', targetId);
        body.append('typeTranslateId', typeTranslateId);

        const response = await fetch(`${TRANSLATE_API_BASE}/create`, {
            method: 'POST',
            headers: {
                'Authorization': `${getToken()}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body.toString()
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Create translate error:', errorText);
            throw new Error('Không thể tạo bản dịch');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Lỗi:', error);
        throw error;
    }
}

// 3. Cập nhật bản dịch
async function updateTranslate(id, sourceId, targetId, typeTranslateId) {
    try {
        const body = new URLSearchParams();
        body.append('id', id);
        body.append('sourceId', sourceId);
        body.append('targetId', targetId);
        body.append('typeTranslateId', typeTranslateId);

        const response = await fetch(`${TRANSLATE_API_BASE}/update`, {
            method: 'PUT',
            headers: {
                'Authorization': `${getToken()}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body.toString()
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Update translate error:', errorText);
            throw new Error('Không thể cập nhật bản dịch');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Lỗi:', error);
        throw error;
    }
}

// 4. Xóa bản dịch
async function deleteTranslateAPI(id) {
    try {
        const response = await fetch(`${TRANSLATE_API_BASE}/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `${getToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Không thể xóa bản dịch');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Lỗi:', error);
        throw error;
    }
}

// 5. Lấy bản dịch theo wordId và type
async function getTranslateByWordId(wordId, typeId) {
    try {
        const response = await fetch(`${TRANSLATE_API_BASE}/get/${wordId}/${typeId}`, {
            method: 'GET',
            headers: {
                'Authorization': `${getToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Không thể lấy bản dịch');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Lỗi:', error);
        throw error;
    }
}


