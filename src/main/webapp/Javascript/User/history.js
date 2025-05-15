// Assets/Javascript/User/history.js
const API_BASE_URL = window.APP_CONFIG.API_BASE_URL; // Ví dụ: 'http://localhost:8080/PBL3_WebsiteHocTiengAnh'

// Hàm fetchWithAuth để thực hiện request kèm token
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem("token");
    const headers = {
        ...options.headers,
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    try {
        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage += ` - ${errorData.error || errorData.message || JSON.stringify(errorData)}`;
            } catch (e) { /* Ignore */ }
            throw new Error(errorMessage);
        }
        if (response.status === 204) return null; // No Content
        return response.json();
    } catch (networkError) {
        console.error("Network error or server unreachable:", networkError);
        throw new Error(`Network error: ${networkError.message}`);
    }
}

// Cache cho thông tin user để tránh gọi API nhiều lần
let userInfoCache = null;

// Định nghĩa fetchUserInfo cho header_footer.js sử dụng
window.fetchUserInfo = async function() {
    const token = localStorage.getItem('token');
    if (!token) {
        userInfoCache = null;
        return null;
    }
    if (userInfoCache) {
        return userInfoCache;
    }
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/auth/info`);
        if (!response) throw new Error('No response from server');
        userInfoCache = response;
        return response;
    } catch (error) {
        console.error('Error fetching user info:', error);
        userInfoCache = null;
        return null;
    }
};

window.clearUserInfoCache = function() {
    userInfoCache = null;
};

document.addEventListener('DOMContentLoaded', async function() {
    // --- DOM Elements ---
    const tabs = document.querySelectorAll('.history-tabs .tab-btn');
    const wordHistoryContainer = document.querySelector('#word-history .history-list-container');
    const examHistoryContainer = document.querySelector('#exam-history .history-list-container');
    const grammarHistoryContainer = document.querySelector('#post-history .history-list-container');

    // --- HÀM GỌI API LỊCH SỬ CHUNG ---
    async function getWordHistoryList() {
        return fetchWithAuth(`${API_BASE_URL}/history/?type=1`);
    }

    async function getExamHistoryList() {
        return fetchWithAuth(`${API_BASE_URL}/exam-history/`);
    }

    async function getGrammarHistoryList() {
        return fetchWithAuth(`${API_BASE_URL}/history/?type=2`);
    }

    // --- HÀM GỌI API ĐỂ LẤY CHI TIẾT (TÊN) ---
    async function getWordDetails(wordId) {
        if (!wordId) return null;
        try {
            const details = await fetchWithAuth(`${API_BASE_URL}/word/${wordId}`);
            return details;
        } catch (error) {
            console.error(`Error fetching details for word ${wordId}:`, error);
            return null;
        }
    }

    async function getExamDetails(examId) {
        if (!examId) return null;
        try {
            const details = await fetchWithAuth(`${API_BASE_URL}/exam/${examId}`);
            return details;
        } catch (error) {
            console.error(`Error fetching details for exam ${examId}:`, error);
            return null;
        }
    }

    async function getPostDetails(postId) {
        if (!postId) return null;
        try {
            const details = await fetchWithAuth(`${API_BASE_URL}/post/${postId}`);
            return details;
        } catch (error) {
            console.error(`Error fetching details for post ${postId}:`, error);
            return null;
        }
    }

    // --- HÀM RENDER UI ---
    /**
     * Render danh sách lịch sử từ vào container.
     * @param {Array<Object>} items - Mảng các đối tượng History (key_id là word_id).
     * @param {HTMLElement} container - Container để render.
     */
    async function renderWordHistory(items, container) {
        if (!container) { console.error("Word history container not found!"); return; }
        if (!Array.isArray(items) || items.length === 0) {
            container.innerHTML = '<p>Chưa có lịch sử học từ nào.</p>';
            return;
        }

        const itemsWithDetails = await Promise.all(items.map(async (item) => {
            const details = await getWordDetails(item.key_id);
            const wordName = details ? (details.word_name || details.name || 'Không tải được tên') : 'Không tải được tên';
            return { ...item, word_name: wordName };
        }));

        const itemsHtml = itemsWithDetails.map(item => `
            <div class="history-item-card word-history-item">
                <p><strong>Từ vựng:</strong> ${item.word_name}</p>
                <p class="history-item-meta"><strong>Ngày học:</strong> ${item.history_date ? new Date(item.history_date).toLocaleString('vi-VN') : 'N/A'}</p>
            </div>
        `).join('');
        container.innerHTML = itemsHtml;
    }

    /**
     * Render danh sách lịch sử bài kiểm tra vào container.
     * @param {Array<Object>} items - Mảng các đối tượng ExamHistory.
     * @param {HTMLElement} container - Container để render.
     */
    async function renderExamHistory(items, container) {
        if (!container) { console.error("Exam history container not found!"); return; }
        if (!Array.isArray(items) || items.length === 0) {
            container.innerHTML = '<p>Chưa có lịch sử làm bài kiểm tra nào.</p>';
            return;
        }

        const itemsWithDetails = await Promise.all(items.map(async (item) => {
            const details = await getExamDetails(item.exam_id);
            const examName = details ? details.name : 'Không tải được tên bài thi';
            return { ...item, exam_name: examName };
        }));

        const itemsHtml = itemsWithDetails.map(item => `
            <div class="history-item-card exam-history-item">
                <p><strong>Bài kiểm tra:</strong> ${item.exam_name}</p>
                <p><strong>Kết quả:</strong> ${typeof item.correct_number === 'number' ? item.correct_number : 'N/A'} / ${item.total_question || 'N/A'} câu đúng</p>
                </div>
        `).join('');
        container.innerHTML = itemsHtml;
    }

    /**
     * Render danh sách lịch sử ngữ pháp vào container.
     * @param {Array<Object>} items - Mảng các đối tượng History (key_id là post_id).
     * @param {HTMLElement} container - Container để render.
     */
    async function renderGrammarHistory(items, container) {
        if (!container) { console.error("Grammar history container not found!"); return; }
        if (!Array.isArray(items) || items.length === 0) {
            container.innerHTML = '<p>Chưa có lịch sử học ngữ pháp nào.</p>';
            return;
        }

        const itemsWithDetails = await Promise.all(items.map(async (item) => {
            const details = await getPostDetails(item.key_id);
            const postName = details ? details.post_name : 'Không tải được tên bài ngữ pháp';
            return { ...item, post_name: postName };
        }));

        const itemsHtml = itemsWithDetails.map(item => `
            <div class="history-item-card grammar-history-item">
                <p><strong>Bài ngữ pháp:</strong> ${item.post_name}</p>
                <p class="history-item-meta"><strong>Ngày xem:</strong> ${item.history_date ? new Date(item.history_date).toLocaleString('vi-VN') : 'N/A'}</p>
            </div>
        `).join('');
        container.innerHTML = itemsHtml;
    }

    // --- LOGIC XỬ LÝ TAB ---
    const dataLoaders = {
        'word-history': async () => {
            if (!wordHistoryContainer) return;
            wordHistoryContainer.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Đang tải lịch sử từ vựng...</p>';
            try {
                const data = await getWordHistoryList();
                await renderWordHistory(data, wordHistoryContainer);
            } catch (error) {
                console.error('Error loading/rendering word history:', error);
                wordHistoryContainer.innerHTML = `<p class="error-message">Lỗi tải lịch sử từ vựng: ${error.message}</p>`;
            }
        },
        'exam-history': async () => {
            if (!examHistoryContainer) return;
            examHistoryContainer.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Đang tải lịch sử kiểm tra...</p>';
            try {
                const data = await getExamHistoryList();
                await renderExamHistory(data, examHistoryContainer);
            } catch (error) {
                console.error('Error loading/rendering exam history:', error);
                examHistoryContainer.innerHTML = `<p class="error-message">Lỗi tải lịch sử kiểm tra: ${error.message}</p>`;
            }
        },
        'post-history': async () => { // HTML dùng data-tab="post-history" cho Grammar
            if (!grammarHistoryContainer) return;
            grammarHistoryContainer.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Đang tải lịch sử ngữ pháp...</p>';
            try {
                const data = await getGrammarHistoryList();
                await renderGrammarHistory(data, grammarHistoryContainer);
            } catch (error) {
                console.error('Error loading/rendering grammar history:', error);
                grammarHistoryContainer.innerHTML = `<p class="error-message">Lỗi tải lịch sử ngữ pháp: ${error.message}</p>`;
            }
        }
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', async () => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const targetContentId = tab.getAttribute('data-tab');
            const targetContentElement = document.getElementById(targetContentId);

            if (targetContentElement) {
                targetContentElement.classList.add('active');
                if (dataLoaders[targetContentId]) {
                    await dataLoaders[targetContentId]();
                } else {
                    console.warn(`Không có data loader cho tab: ${targetContentId}`);
                    const listContainer = targetContentElement.querySelector('.history-list-container');
                    if (listContainer) listContainer.innerHTML = "<p>Chức năng này chưa được hỗ trợ.</p>";
                }
            } else {
                console.error(`Không tìm thấy nội dung cho tab ID: "${targetContentId}"`);
            }
        });
    });

    const initialActiveTab = document.querySelector('.history-tabs .tab-btn.active');
    if (initialActiveTab) {
        initialActiveTab.click();
    } else if (tabs.length > 0) {
        tabs[0].click(); // Nếu không có tab nào active, chọn tab đầu tiên
    }
});