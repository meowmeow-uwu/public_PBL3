const API_TRANSLATE_URL = window.APP_CONFIG.API_BASE_URL + '/translate/';

async function getAllWordByKeyword(keyword, sourceLanguageId, targetLanguageId) {
    try {
        const response = await fetch(`${API_TRANSLATE_URL}get/${sourceLanguageId}/${targetLanguageId}?keyword=${keyword}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Kiểm tra cấu trúc dữ liệu trả về
        if (!data || !Array.isArray(data.words)) {
            throw new Error('Dữ liệu trả về không hợp lệ');
        }

        // Map dữ liệu để đảm bảo format nhất quán
        const words = data.words.map(word => ({
            languageId: word.language_id,
            wordId: word.word_id,
            wordName: word.word_name,
            pronunciation: word.pronunciation || '',
            sound: word.sound || '',
            image: word.image || '',
            isDeleted: word._deleted
        }));

        return {
            words: words
        };
    } catch (error) {
        console.error('Lỗi khi lấy danh sách từ:', error);
        throw error;
    }
}

async function getInfoTranslate(sourceId, sourceLanguageId, targetLanguageId) {
    try {
        const response = await fetch(`${API_TRANSLATE_URL}get/${sourceId}/${sourceLanguageId}/${targetLanguageId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Không tìm thấy từ dịch');
            } else if (response.status === 400) {
                throw new Error('ID ngôn ngữ không hợp lệ. Sử dụng 1 cho tiếng Anh hoặc 2 cho tiếng Việt');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!Array.isArray(data)) {
            throw new Error('Dữ liệu trả về không hợp lệ');
        }

        // Map dữ liệu để đảm bảo format nhất quán
        const translations = data.map(word => ({
            languageId: word.language_id,
            wordId: word.word_id,
            wordName: word.word_name,
            pronunciation: word.pronunciation || '',
            sound: word.sound || '',
            image: word.image || '',
            isDeleted: word._deleted
        }));

        return translations;
    } catch (error) {
        console.error('Lỗi khi lấy thông tin dịch:', error);
        throw error;
    }
}

window.TRANSLATE_API = {
    getAllWordByKeyword,
    getInfoTranslate
};