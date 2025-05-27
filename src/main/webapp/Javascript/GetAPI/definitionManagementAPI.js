/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/JavaScript.js to edit this template
 */

const BASE_URL = window.APP_CONFIG.API_BASE_URL + '/definitions';

// Lấy định nghĩa theo ID
async function getDefinitionById(id) {
    try {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Lỗi khi lấy định nghĩa');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Lỗi:', error);
        throw error;
    }
}

// Lấy tất cả định nghĩa của một từ theo wordId
async function getDefinitionsByWordId(wordId) {
    try {
        const response = await fetch(`${BASE_URL}/word/${wordId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Lỗi khi lấy danh sách định nghĩa');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Lỗi:', error);
        throw error;
    }
}

// Thêm định nghĩa mới
async function addDefinition(wordId, meaning, example, wordType) {
    try {
        const formData = new URLSearchParams();
        formData.append('word_id', wordId);
        formData.append('meaning', meaning);
        formData.append('example', example);
        formData.append('word_type', wordType);

        const response = await fetch(`${BASE_URL}/create`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });
        
        if (!response.ok) {
            throw new Error('Lỗi khi thêm định nghĩa');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Lỗi:', error);
        throw error;
    }
}

// Cập nhật định nghĩa
async function updateDefinition(definitionData) {
    try {
        const formData = new URLSearchParams();
        formData.append('definition_id', definitionData.definition_id);
        formData.append('word_id', definitionData.word_id);
        formData.append('meaning', definitionData.meaning);
        formData.append('example', definitionData.example);
        formData.append('word_type', definitionData.word_type);

        const response = await fetch(`${BASE_URL}/update`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });
        
        if (!response.ok) {
            throw new Error('Lỗi khi cập nhật định nghĩa');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Lỗi:', error);
        throw error;
    }
}

// Xóa định nghĩa
async function deleteDefinitionAPI(id) {
    try {
        const response = await fetch(`${BASE_URL}/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Lỗi khi xóa định nghĩa');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Lỗi:', error);
        throw error;
    }
}


