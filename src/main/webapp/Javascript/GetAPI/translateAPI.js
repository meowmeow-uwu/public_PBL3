const WORD_API_BASE = window.APP_CONFIG.API_BASE_URL +'/translate';

// Lấy gợi ý từ API
async function fetchSuggestions(keyword) {
    const from = fromLang.value === 'en' ? '1' : '2';
    const to = toLang.value === 'vi' ? '2' : '1';
    const url = `${API_Translate_BASE}/${encodeURIComponent(keyword)}/${from}/${to}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Lỗi khi lấy gợi ý:', error);
        return [];
    }
}

// Lấy chi tiết từ
async function fetchWordDetail(wordId) {
    const url = `${API_Word_BASE}/${wordId}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết từ:', error);
        throw error;
    }
}
