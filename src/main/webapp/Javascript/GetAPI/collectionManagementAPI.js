/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/JavaScript.js to edit this template
 */

const COLLECTION_BASE_URL = window.APP_CONFIG.API_BASE_URL + '/admin/collections';

function getToken() {
    return localStorage.getItem('token');
}

// Lấy danh sách bộ sưu tập công khai
async function getAllPublicCollections() {
    try {
        console.log('Đang gọi API lấy danh sách bộ sưu tập công khai...'); // Debug log
        console.log('API URL:', `${COLLECTION_BASE_URL}/all`); // Debug log
        console.log('Token:', getToken()); // Debug log

        const response = await fetch(`${COLLECTION_BASE_URL}/all`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response.status); // Debug log

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error:', errorText); // Debug log

            if (response.status === 401) {
                throw new Error('Unauthorized: Vui lòng đăng nhập lại');
            }
            if (response.status === 404) {
                throw new Error('Không tìm thấy bộ sưu tập công khai');
            }
            throw new Error(`Có lỗi xảy ra khi lấy danh sách bộ sưu tập: ${errorText}`);
        }

        const data = await response.json();
        console.log('Danh sách bộ sưu tập:', data); // Debug log
        return data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bộ sưu tập:', error);
        throw error;
    }
}

// Export các hàm để sử dụng ở các file khác
window.collectionManagementAPI = {
    getAllPublicCollections
};
