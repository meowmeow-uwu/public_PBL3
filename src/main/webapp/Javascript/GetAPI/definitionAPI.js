const DEFINITION_API_URL =  window.APP_CONFIG.API_BASE_URL + '/definitions';

// Hàm lấy định nghĩa theo wordId
async function getDefinitionByWordId(wordId) {
    try {
        console.log('Đang gọi API định nghĩa cho wordId:', wordId);
        const response = await fetch(`${DEFINITION_API_URL}/word/${wordId}/definition`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            if (response.status === 404) {
                console.log('Không tìm thấy định nghĩa cho wordId:', wordId);
                return null;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        console.log('Response text:', text);

        if (!text || text.trim() === '') {
            console.log('Response rỗng cho wordId:', wordId);
            return null;
        }

        try {
            const data = JSON.parse(text);
            console.log('Parsed data:', data);

            // Kiểm tra cấu trúc dữ liệu
            if (!data || typeof data !== 'object') {
                console.log('Dữ liệu không hợp lệ:', data);
                return null;
            }

            return {
                definitionId: data.definition_id || null,
                wordId: data.word_id || null,
                meaning: data.meaning || '',
                example: data.example || '',
                wordType: data.word_type || ''
            };
        } catch (parseError) {
            console.error('Lỗi khi parse JSON:', parseError);
            console.error('Text không thể parse:', text);
            return null;
        }
    } catch (error) {
        console.error('Lỗi khi lấy định nghĩa:', error);
        return null;
    }
}

// Hàm lấy tất cả định nghĩa theo wordId
async function getAllDefinitionsByWordId(wordId) {
    try {
        console.log('Đang gọi API danh sách định nghĩa cho wordId:', wordId);
        const response = await fetch(`${DEFINITION_API_URL}/word/${wordId}/definitions`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            if (response.status === 404) {
                console.log('Không tìm thấy định nghĩa cho wordId:', wordId);
                return [];
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        console.log('Response text:', text);

        if (!text || text.trim() === '') {
            console.log('Response rỗng cho wordId:', wordId);
            return [];
        }

        try {
            const data = JSON.parse(text);
            console.log('Parsed data:', data);

            // Kiểm tra cấu trúc dữ liệu
            if (!Array.isArray(data)) {
                console.log('Dữ liệu không phải mảng:', data);
                return [];
            }

            return data.map(definition => ({
                definitionId: definition.definition_id || null,
                wordId: definition.word_id || null,
                meaning: definition.meaning || '',
                example: definition.example || '',
                wordType: definition.word_type || ''
            }));
        } catch (parseError) {
            console.error('Lỗi khi parse JSON:', parseError);
            console.error('Text không thể parse:', text);
            return [];
        }
    } catch (error) {
        console.error('Lỗi khi lấy danh sách định nghĩa:', error);
        return [];
    }
}

// Export các hàm để sử dụng ở các file khác
window.DEFINITION_API = {
    getDefinitionByWordId,
    getAllDefinitionsByWordId
};