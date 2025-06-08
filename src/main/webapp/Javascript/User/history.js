

// Cache cho thông tin user để tránh gọi API nhiều lần
let userInfoCache = null;

window.clearUserInfoCache = function() {
    userInfoCache = null;
};

document.addEventListener('DOMContentLoaded', async function() {
    // --- DOM Elements ---
    const tabs = document.querySelectorAll('.history-tabs .tab-btn');
    const wordHistoryContainer = document.querySelector('#word-history .history-list-container');
    const examHistoryContainer = document.querySelector('#exam-history .history-list-container');
    const grammarHistoryContainer = document.querySelector('#post-history .history-list-container');

    // --- HÀM RENDER UI ---
    /**
     * Render danh sách lịch sử từ vào container.
     * @param {Array<Object>} items - Mảng các đối tượng History (key_id là word_id).
     * @param {HTMLElement} container - Container để render.
     */
    async function renderWordHistory(items, container) {
        if (!container) { console.error("Word history container not found!"); return; }
        if (!Array.isArray(items) || items.length === 0) {
            container.innerHTML = '<p>Chưa có lịch sử tra từ nào.</p>';
            return;
        }

        const itemsWithDetails = await Promise.all(items.map(async (item) => {
            const details = await window.historyAPI.getWordDetails(item.key_id);
            const word = details ? (details.word  || 'Không tải được tên') : 'Không tải được tên';
            return { ...item, word: word };
        }));

        const itemsHtml = itemsWithDetails.map(item => `
            <div class="history-item-card word-history-item">
                <p><strong>Từ vựng:</strong> ${item.word}</p>
                <p class="history-item-meta"><strong>Ngày tra:</strong> ${item.history_date ? new Date(item.history_date).toLocaleString('vi-VN') : 'N/A'}</p>
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
            container.innerHTML = '<p>Chưa có lịch sử làm bài ôn tập nào.</p>';
            return;
        }

        const itemsWithDetails = await Promise.all(items.map(async (item) => {
            const details = await window.historyAPI.getExamName(item.exam_id);
            const examName = details ? details.name : 'Không tải được tên bài ôn';
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
            const details = await window.historyAPI.getPostDetails(item.key_id);
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
            wordHistoryContainer.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Đang tải lịch sử tra từ vựng...</p>';
            try {
                const data = await window.historyAPI.getAllHistories(1);
                await renderWordHistory(data, wordHistoryContainer);
            } catch (error) {
                console.error('Error loading/rendering word history:', error);
                wordHistoryContainer.innerHTML = `<p class="error-message">Lỗi tải lịch sử tra từ : ${error.message}</p>`;
            }
        },
        'exam-history': async () => {
            if (!examHistoryContainer) return;
            examHistoryContainer.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Đang tải lịch sử làm bài ôn.tập..</p>';
            try {
                const data = await window.historyAPI.getAllExamHistories();
                await renderExamHistory(data, examHistoryContainer);
            } catch (error) {
                console.error('Error loading/rendering exam history:', error);
                examHistoryContainer.innerHTML = `<p class="error-message">Lỗi tải lịch sử làm bài ôn tập: ${error.message}</p>`;
            }
        },
        'post-history': async () => { // HTML dùng data-tab="post-history" cho Grammar
            if (!grammarHistoryContainer) return;
            grammarHistoryContainer.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Đang tải lịch sử ngữ pháp...</p>';
            try {
                const data = await window.historyAPI.getAllHistories(2);
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