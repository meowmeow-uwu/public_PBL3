/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/JavaScript.js to edit this template
 */

const WORD_BASE_URL = window.APP_CONFIG.API_BASE_URL + '/word';



/**
 * Lấy thông tin flashcard của một từ
 * @param {number} wordId - ID của từ cần lấy thông tin
 * @returns {Promise<Object>} - Thông tin flashcard bao gồm từ gốc, từ dịch và định nghĩa
 */
async function getFlashcard(wordId) {
    try {
        console.log('Đang gọi API lấy flashcard cho wordId:', wordId);
        
        const token =  window.USER_API.getBearerToken();
        if (!token) {
            throw new Error('Unauthorized: Vui lòng đăng nhập lại');
        }

        const response = await fetch(`${WORD_BASE_URL}/flashcard/${wordId}`, {
            method: 'GET',
            headers: {
                'Authorization': token,
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
                throw new Error('Không tìm thấy từ vựng');
            }
            throw new Error(`Có lỗi xảy ra khi lấy thông tin flashcard: ${errorText}`);
        }

        const data = await response.json();
        console.log('Flashcard data:', data); // Debug log
        return data;
    } catch (error) {
        console.error('Lỗi khi lấy thông tin flashcard:', error);
        throw error;
    }
}

// Export các hàm để sử dụng ở các file khác
window.wordAPI = {
    getFlashcard
};


