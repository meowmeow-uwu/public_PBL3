/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/JavaScript.js to edit this template
 */

const USER_BASE_URL = window.APP_CONFIG.API_BASE_URL +'admin/collections';

function getToken() {
    return localStorage.getItem('token');
}

// Lấy danh sách bộ sưu tập công khai
async function getAllPublicCollections() {
    try {
        const response = await fetch(`${USER_BASE_URL}/all`, {
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
            throw new Error('Có lỗi xảy ra khi lấy danh sách bộ sưu tập');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bộ sưu tập:', error);
        throw error;
    }
}
