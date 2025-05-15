// history.js

document.addEventListener('DOMContentLoaded', async function() {
    // Giả định API_BASE_URL và fetchWithAuth đã được định nghĩa toàn cục
    // hoặc bạn cần import/include chúng nếu history.js là module riêng biệt.
    // Nếu chúng không toàn cục, bạn cần định nghĩa lại chúng ở đây:
    // const API_BASE_URL = window.APP_CONFIG.API_BASE_URL;
    // async function fetchWithAuth(url, options = {}) { ... }

    const tabs = document.querySelectorAll('.history-tabs .tab-btn');
    const tabContents = document.querySelectorAll('.tab-content'); // Không cần nữa nếu render động

    const wordHistoryContainer = document.querySelector('#word-history .history-list-container');
    const examHistoryContainer = document.querySelector('#exam-history .history-list-container');
    const postHistoryContainer = document.querySelector('#post-history .history-list-container');

    // Hàm render chung cho một danh sách history items
    function renderHistoryItems(container, items, type) {
        if (!container) return;
        if (!items || items.length === 0) {
            container.innerHTML = '<p>Chưa có lịch sử nào cho mục này.</p>';
            return;
        }

        let itemsHtml = '';
        if (type === 'word' || type === 'post') { // Dùng DTO History chung
            itemsHtml = items.map(item => `
                <div class="history-item-card">
                    <p><strong>ID Mục:</strong> ${item.key_id}</p>
                    <p><strong>Ngày xem/học:</strong> ${new Date(item.history_date).toLocaleString()}</p>
                    </div>
            `).join('');
        } else if (type === 'exam') { // Dùng DTO ExamHistory
            itemsHtml = items.map(item => `
                <div class="history-item-card">
                    <p><strong>Bài kiểm tra ID:</strong> ${item.exam_id}</p>
                    <p><strong>Kết quả:</strong> ${item.correct_number}/${item.total_question} câu đúng</p>
                    <p><strong>Ngày làm:</strong> ${item.exam_date ? new Date(item.exam_date).toLocaleString() : 'N/A'}</p> 
                    </div>
            `).join('');
        }
        container.innerHTML = itemsHtml;
    }

    // Hàm fetch và render cho từng loại history
    async function loadWordHistory() {
        if (!wordHistoryContainer) return;
        wordHistoryContainer.innerHTML = '<p>Đang tải lịch sử từ vựng...</p>';
        try {
            // API: GET /history/?type=1 (type=1 cho Word History)
            const histories = await fetchWithAuth(`${API_BASE_URL}/history/?type=1`);
            renderHistoryItems(wordHistoryContainer, histories, 'word');
        } catch (error) {
            console.error("Error fetching word history:", error);
            wordHistoryContainer.innerHTML = '<p class="error-message">Lỗi tải lịch sử từ vựng.</p>';
        }
    }

    async function loadExamHistory() {
        if (!examHistoryContainer) return;
        examHistoryContainer.innerHTML = '<p>Đang tải lịch sử bài kiểm tra...</p>';
        try {
            // GIẢ ĐỊNH BẠN SẼ TẠO ENDPOINT NÀY Ở BACKEND để lấy danh sách ExamHistory
            // API: GET /history/exam (hoặc một tên khác)
            // Endpoint này cần trả về ArrayList<ExamHistoryDTO>
            const examHistories = await fetchWithAuth(`${API_BASE_URL}/history/exam`);
            renderHistoryItems(examHistoryContainer, examHistories, 'exam');
        } catch (error) {
            console.error("Error fetching exam history:", error);
            examHistoryContainer.innerHTML = '<p class="error-message">Lỗi tải lịch sử bài kiểm tra.</p>';
        }
    }

    async function loadPostHistory() {
        if (!postHistoryContainer) return;
        postHistoryContainer.innerHTML = '<p>Đang tải lịch sử bài học...</p>';
        try {
            // API: GET /history/?type=2 (type=2 cho Post/Lesson History)
            const histories = await fetchWithAuth(`${API_BASE_URL}/history/?type=2`);
            renderHistoryItems(postHistoryContainer, histories, 'post');
        } catch (error) {
            console.error("Error fetching post history:", error);
            postHistoryContainer.innerHTML = '<p class="error-message">Lỗi tải lịch sử bài học.</p>';
        }
    }

    // Xử lý chuyển tab
    tabs.forEach(tab => {
        tab.addEventListener('click', async () => {
            tabs.forEach(item => item.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            tab.classList.add('active');
            const targetContentId = tab.getAttribute('data-tab');
            const targetContentElement = document.getElementById(targetContentId);
            if (targetContentElement) targetContentElement.classList.add('active');

            // Load dữ liệu cho tab được chọn
            if (targetContentId === 'word-history') {
                await loadWordHistory();
            } else if (targetContentId === 'exam-history') {
                await loadExamHistory();
            } else if (targetContentId === 'post-history') {
                await loadPostHistory();
            }
        });
    });

    // Tự động load nội dung cho tab đang active khi tải trang
    const activeTab = document.querySelector('.history-tabs .tab-btn.active');
    if (activeTab) {
        const activeTabType = activeTab.getAttribute('data-tab');
        if (activeTabType === 'word-history') {
            await loadWordHistory();
        } else if (activeTabType === 'exam-history') {
            await loadExamHistory();
        } else if (activeTabType === 'post-history') {
            await loadPostHistory();
        }
    } else {
        // Mặc định load tab đầu tiên nếu không có tab nào active sẵn
        await loadWordHistory();
        document.querySelector('.history-tabs .tab-btn[data-tab="word-history"]')?.classList.add('active');
        document.querySelector('#word-history')?.classList.add('active');

    }
});