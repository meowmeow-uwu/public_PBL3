// grammar.js

// Giả định API_BASE_URL đã được thiết lập trong window.APP_CONFIG



document.addEventListener('DOMContentLoaded', async () => {
    // DOM Elements (giữ nguyên)
    const mainTopicsSection = document.getElementById('mainTopicsSection');
    const subTopicsSection = document.getElementById('subTopicsSection');
    const lessonsSection = document.getElementById('lessonsSection');
    const lessonDetailSection = document.getElementById('lessonDetailSection');
    const quizSection = document.getElementById('quizSection');
    const mainTopicsGrid = document.querySelector('.main-topics-grid');
    const lessonsContentDiv = document.getElementById('lessonsContent');
    const lessonDetailContentArea = document.getElementById('lessonDetailContentArea');
    const quizContentDiv = document.getElementById('quizContent');
    const backToMainTopics = document.getElementById('backToMainTopics');
    const backToSubTopics = document.getElementById('backToSubTopics');
    const backToLessons = document.getElementById('backToLessons');
    const backToQuizList = document.getElementById('backToQuizList');
    const submitQuizButton = document.getElementById('submitQuizBtn');

    // State variables (giữ nguyên)
    let currentMainTopicId = null;
    let currentSubTopicId = null;
    let currentLessonOrQuizType = 'lessons';
    let quizTimer = null;
    let quizTimeLeft = 0;
    let allTopics = [];
    let currentQuizData = null;
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let currentPage = 1;
    let totalPages = 1;
    let currentKeyword = '';

    // --- API CALL FUNCTIONS ---
    async function getMainTopics(keyword = '') {
        try {
            currentKeyword = keyword;
            const result = await window.TOPIC_MANAGEMENT_API.fetchTopicList({
                page: currentPage,
                pageSize: 10,
                keyword: currentKeyword
            });
            allTopics = result.topics || [];
            totalPages = result.totalPages || 1;
            return allTopics;
        } catch (error) {
            console.error("Error fetching main topics:", error);
            if (mainTopicsGrid) mainTopicsGrid.innerHTML = `<p class="error-message">Lỗi tải danh sách chủ đề. Vui lòng thử lại sau.</p>`;
            return [];
        }
    }

    async function getSubTopicsForTopic(topicId, keyword = '') {
        try {
            currentKeyword = keyword;
            const result = await window.SUB_TOPIC_MANAGEMENT_API.fetchSubTopicList({
                page: currentPage,
                pageSize: 10,
                topicId: topicId,
                keyword: currentKeyword
            });
            totalPages = result.totalPages || 1;
            return result.subTopics || [];
        } catch (error) {
            console.error(`Error fetching subtopics for topic ${topicId}:`, error);
            return [];
        }
    }

    async function getPostsForSubTopic(subTopicId, keyword = '') {
        try {
            currentKeyword = keyword;
            const result = await window.POST_MANAGEMENT_API.fetchPostList({
                page: currentPage,
                pageSize: 10,
                subTopicId: subTopicId,
                keyword: currentKeyword
            });
            totalPages = result.totalPages || 1;
            return result.posts || [];
        } catch (error) {
            console.error(`Error fetching posts for subtopic ${subTopicId}:`, error);
            return [];
        }
    }

    async function getExamsForSubTopic(subTopicId, keyword = '') {
        try {
            currentKeyword = keyword;
            const result = await window.EXAM_MANAGEMENT_API.fetchExamList({
                page: currentPage,
                pageSize: 10,
                subTopicId: subTopicId,
                keyword: currentKeyword
            });
            totalPages = result.totalPages || 1;
            return result.exams || [];
        } catch (error) {
            console.error(`Error fetching exams for subtopic ${subTopicId}:`, error);
            return [];
        }
    }

    async function getPostDetails(postId) {
        try {
            return await window.historyAPI.getPostDetails(postId);
        } catch (error) {
            console.error(`Error fetching details for post ${postId}:`, error);
            return null;
        }
    }

    async function getExamDetails(examId) {
        try {
            return await window.historyAPI.getExamDetails(examId);
        } catch (error) {
            console.error(`Error fetching full details for exam ${examId}:`, error);
            showToast('error', 'Lỗi', `Không thể tải chi tiết bài ôn tập: ${error.message}.`);
            return null;
        }
    }

    // Lưu lịch sử bài học (post)
    async function addPostHistory(postId) {
        try {
            const historyData = { key_id: postId };
            await window.historyAPI.createHistory(historyData, 2);
            console.log(`Post history added for post_id ${postId}.`);
        } catch (error) {
            if (error.message && (error.message.includes("400") || error.message.includes("409")) &&
                error.message.toLowerCase().includes("history already exists")) {
                console.log(`Post history already exists for post_id ${postId}.`);
            } else {
                console.error(`CLIENT: Error adding post history for post_id ${postId}:`, error.message);
            }
        }
    }

    // ĐÃ CẬP NHẬT: Hàm lưu lịch sử bài kiểm tra (ExamHistory)
    async function addExamResultHistory(examId, correctNumber, wrongNumber, totalQuestion) {
        try {
            const examHistoryData = {
                // exam_history_id: 0, // Backend sẽ tự tạo
                // user_id: 0,         // Backend sẽ lấy từ token
                exam_id: examId,        // Khớp với DTO ExamHistory
                correct_number: correctNumber,
                wrong_number: wrongNumber,
                total_question: totalQuestion
            };
            // Gọi đến endpoint mới trong ExamHistoryController: POST /exam-history/
            await fetchWithAuth(`${API_BASE_URL}/exam-history/`, {
                method: 'POST',
                body: JSON.stringify(examHistoryData)
            });
            console.log(`Exam result history added for exam_id ${examId}`);
        } catch (error) {
            console.error(`CLIENT: Error adding exam result history for exam_id ${examId}:`, error.message);
            // Không nên alert lỗi này cho người dùng vì đây là hành động nền
        }
    }

    // --- UI RENDERING FUNCTIONS ---
    function renderMainTopics(topics) {
        if (!mainTopicsGrid) return;

        // Tạo container chính
        const mainContainer = document.createElement('div');
        mainContainer.className = 'main-container';

        // Thêm thanh tìm kiếm ở trên cùng
        const searchBar = document.createElement('div');
        searchBar.className = 'search-bar';
        searchBar.innerHTML = `
            <div class="search-input-container">
                <input type="text" id="topicSearch" placeholder="Tìm kiếm chủ đề..." value="${currentKeyword}">
                <button class="search-btn">
                    <i class="fas fa-search"></i>
                </button>
            </div>
        `;
        mainContainer.appendChild(searchBar);

        // Tạo container cho danh sách topic
        const topicsContainer = document.createElement('div');
        topicsContainer.className = 'topics-container';

        if (!topics || topics.length === 0) {
            topicsContainer.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-book-open"></i>
                    <p>Chưa có chủ đề nào.</p>
                </div>`;
        } else {
            topicsContainer.innerHTML = topics.map(topic => `
                <div class="main-topic-card" data-topic-id="${topic.topic_id}">
                    <div class="main-topic-icon"><i class="fas fa-book"></i></div>
                    <h3>${topic.name}</h3>
                    <p>Khám phá ${topic.name.toLowerCase()}</p>
                </div>
            `).join('');

            // Thêm sự kiện click cho các topic
            topicsContainer.querySelectorAll('.main-topic-card').forEach(card => {
                card.addEventListener('click', async () => {
                    currentMainTopicId = parseInt(card.dataset.topicId);
                    currentPage = 1;
                    currentKeyword = '';
                    await showSubTopicsView(currentMainTopicId);
                });
            });
        }
        mainContainer.appendChild(topicsContainer);

        // Thêm phân trang ở dưới cùng nếu có dữ liệu
        if (topics && topics.length > 0) {
            const pagination = document.createElement('div');
            pagination.className = 'pagination';
            pagination.innerHTML = `
                <button class="prev-page" ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i> Trang trước
                </button>
                <span class="page-info">Trang ${currentPage}/${totalPages}</span>
                <button class="next-page" ${currentPage === totalPages ? 'disabled' : ''}>
                    Trang sau <i class="fas fa-chevron-right"></i>
                </button>
            `;
            mainContainer.appendChild(pagination);

            // Thêm event listeners cho phân trang
            const prevPageBtn = pagination.querySelector('.prev-page');
            const nextPageBtn = pagination.querySelector('.next-page');
            prevPageBtn.addEventListener('click', () => handleTopicPageChange(-1));
            nextPageBtn.addEventListener('click', () => handleTopicPageChange(1));
        }

        // Thêm event listeners cho tìm kiếm
        const searchInput = mainContainer.querySelector('#topicSearch');
        const searchBtn = mainContainer.querySelector('.search-btn');

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleTopicSearch();
            }
        });

        searchBtn.addEventListener('click', handleTopicSearch);

        // Xóa nội dung cũ và thêm container mới
        mainTopicsGrid.innerHTML = '';
        mainTopicsGrid.appendChild(mainContainer);
    }

    async function showSubTopicsView(mainTopicId) {
        const subTopicsGrid = document.getElementById('subTopicsGrid');
        if (!subTopicsGrid) return;
        subTopicsGrid.innerHTML = '<p class="loading-message">Đang tải chủ đề con...</p>';

        const currentTopic = allTopics.find(t => t.topic_id === mainTopicId);
        if (!currentTopic) {
            subTopicsGrid.innerHTML = '<p class="error-message">Không tìm thấy thông tin chủ đề chính.</p>';
            return;
        }

        // Tạo container chính
        const mainContainer = document.createElement('div');
        mainContainer.className = 'main-container';

        // Thêm thanh tìm kiếm ở trên cùng
        const searchBar = document.createElement('div');
        searchBar.className = 'search-bar';
        searchBar.innerHTML = `
            <div class="search-input-container">
                <input type="text" id="subTopicSearch" placeholder="Tìm kiếm chủ đề con..." value="${currentKeyword}">
                <button class="search-btn">
                    <i class="fas fa-search"></i>
                </button>
            </div>
        `;
        mainContainer.appendChild(searchBar);

        const subTopics = await getSubTopicsForTopic(mainTopicId, currentKeyword);
        document.getElementById('subTopicsTitle').textContent = currentTopic.name;

        if (!subTopics || subTopics.length === 0) {
            mainContainer.innerHTML += `
                <div class="no-data">
                    <i class="fas fa-folder-open"></i>
                    <p>Chủ đề này hiện chưa có bài học.</p>
                </div>`;
        } else {
            // Tạo container cho danh sách subtopic
            const subTopicsContainer = document.createElement('div');
            subTopicsContainer.className = 'sub-topics-container';
            subTopicsContainer.innerHTML = subTopics.map(subTopic => `
                <div class="sub-topic-card" data-subtopic-id="${subTopic.sub_topic_id}">
                    <span>${subTopic.name}</span>
                </div>
            `).join('');
            mainContainer.appendChild(subTopicsContainer);

        }

        // Thêm phân trang ở dưới cùng
        const pagination = document.createElement('div');
        pagination.className = 'pagination';
        pagination.innerHTML = `
                <button class="prev-page" ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i> Trang trước
                </button>
                <span class="page-info">Trang ${currentPage}/${totalPages}</span>
                <button class="next-page" ${currentPage === totalPages ? 'disabled' : ''}>
                    Trang sau <i class="fas fa-chevron-right"></i>
                </button>
            `;
        mainContainer.appendChild(pagination);

        // Thêm event listeners
        const searchInput = mainContainer.querySelector('#subTopicSearch');
        const searchBtn = mainContainer.querySelector('.search-btn');
        const prevPageBtn = mainContainer.querySelector('.prev-page');
        const nextPageBtn = mainContainer.querySelector('.next-page');

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSubTopicSearch();
            }
        });

        searchBtn.addEventListener('click', handleSubTopicSearch);
        prevPageBtn.addEventListener('click', () => handleSubTopicPageChange(-1));
        nextPageBtn.addEventListener('click', () => handleSubTopicPageChange(1));

        // Thêm sự kiện click cho các subtopic
        mainContainer.querySelectorAll('.sub-topic-card').forEach(card => {
            card.addEventListener('click', async () => {
                currentSubTopicId = parseInt(card.dataset.subtopicId);
                currentPage = 1;
                currentKeyword = '';
                currentLessonOrQuizType = 'lessons';
                await showLessonsAndQuizzesListView(currentSubTopicId);
            });
        });
        // Xóa nội dung cũ và thêm container mới
        subTopicsGrid.innerHTML = '';
        subTopicsGrid.appendChild(mainContainer);

        mainTopicsSection.classList.add('hidden');
        lessonsSection.classList.add('hidden');
        lessonDetailSection.classList.add('hidden');
        quizSection.classList.add('hidden');
        subTopicsSection.classList.remove('hidden');
    }

    async function showLessonsAndQuizzesListView(subTopicId) {
        let subTopicName = "Danh sách";
        try {
            const subTopicDetail = await fetchWithAuth(`${API_BASE_URL}/subtopic/${subTopicId}`);
            if (subTopicDetail) subTopicName = subTopicDetail.name;
        } catch (e) { console.error("Could not fetch subtopic name for title", e) }

        document.getElementById('lessonsTitle').textContent = subTopicName;

        document.querySelectorAll('.lessons-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        const activeTabButton = document.querySelector(`.lessons-tabs .tab-btn[data-tab="${currentLessonOrQuizType}"]`);
        if (activeTabButton) activeTabButton.classList.add('active');
        else {
            document.querySelector('.lessons-tabs .tab-btn[data-tab="lessons"]')?.classList.add('active');
            currentLessonOrQuizType = 'lessons';
        }

        if (!lessonsContentDiv) return;
        lessonsContentDiv.innerHTML = '<p class="loading-message">Đang tải danh sách...</p>';
        await renderItemsInLessonsContent(subTopicId, currentLessonOrQuizType);

        subTopicsSection.classList.add('hidden');
        mainTopicsSection.classList.add('hidden');
        lessonDetailSection.classList.add('hidden');
        quizSection.classList.add('hidden');
        lessonsSection.classList.remove('hidden');
    }

    async function renderItemsInLessonsContent(subTopicId, type) {
        if (!lessonsContentDiv) return;
        lessonsContentDiv.innerHTML = `<p class="loading-message">Đang tải ${type === 'lessons' ? 'bài học' : 'bài ôn tập'}...</p>`;

        // Tạo container chính cho phần nội dung bài học/bài ôn tập
        const mainContentContainer = document.createElement('div');
        mainContentContainer.className = 'lessons-main-content-container';

        // Thêm thanh tìm kiếm ở trên cùng
        const searchBar = document.createElement('div');
        searchBar.className = 'search-bar';
        searchBar.innerHTML = `
            <div class="search-input-container">
                <input type="text" id="itemSearch" placeholder="Tìm kiếm ${type === 'lessons' ? 'bài học' : 'bài ôn tập'}..." value="${currentKeyword}">
                <button class="search-btn">
                    <i class="fas fa-search"></i>
                </button>
            </div>
        `;
        mainContentContainer.appendChild(searchBar);

        let items = [];
        if (type === 'lessons') {
            const posts = await getPostsForSubTopic(subTopicId, currentKeyword);
            items = posts.map(post => ({ id: post.post_id, title: post.post_name, type: 'lesson', description: post.content }));
        } else if (type === 'quizzes') {
            const exams = await getExamsForSubTopic(subTopicId, currentKeyword);
            items = exams.map(exam => ({ id: exam.exam_id, title: exam.name, type: 'quiz', description: exam.description }));
        }

        if (!items || items.length === 0) {
            const noDataHtml = `
                <div class="no-data">
                    <i class="fas fa-box-open"></i>
                    <p>Không có ${type === 'lessons' ? 'bài học' : 'bài ôn tập'} nào cho chủ đề này.</p>
                </div>`;
            mainContentContainer.innerHTML += noDataHtml; // Thêm vào sau search bar
        } else {
            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'items-grid';
            itemsContainer.innerHTML = items.map(item => `
                <div class="lesson-item" data-id="${item.id}" data-type="${item.type}">
                    <h3>${item.title}</h3>
                    <p>${item.description ? item.description.substring(0, 100) + (item.description.length > 100 ? '...' : '') : ''}</p>
                    <button class="btn-primary">
                        ${item.type === 'lesson' ? 'Xem bài' : 'Làm bài'}
                    </button>
                </div>
            `).join('');
            mainContentContainer.appendChild(itemsContainer);

            // Thêm phân trang ở dưới cùng
            const pagination = document.createElement('div');
            pagination.className = 'pagination';
            pagination.innerHTML = `
                <button class="prev-page" ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i> Trang trước
                </button>
                <span class="page-info">Trang ${currentPage}/${totalPages}</span>
                <button class="next-page" ${currentPage === totalPages ? 'disabled' : ''}>
                    Trang sau <i class="fas fa-chevron-right"></i>
                </button>
            `;
            mainContentContainer.appendChild(pagination);

            // Thêm event listeners cho phân trang
            const prevPageBtn = pagination.querySelector('.prev-page');
            const nextPageBtn = pagination.querySelector('.next-page');
            prevPageBtn.addEventListener('click', () => handleItemPageChange(-1, type));
            nextPageBtn.addEventListener('click', () => handleItemPageChange(1, type));

            // Thêm sự kiện click cho các item (bài học/bài ôn tập)
            mainContentContainer.querySelectorAll('.lesson-item button').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const lessonItemDiv = e.target.closest('.lesson-item');
                    const itemId = parseInt(lessonItemDiv.dataset.id);
                    const itemType = lessonItemDiv.dataset.type;
                    if (itemType === 'lesson') await showLessonDetailView(itemId);
                    else if (itemType === 'quiz') await showQuizView(itemId);
                });
            });
        }

        // Thêm event listeners cho tìm kiếm
        const searchInput = mainContentContainer.querySelector('#itemSearch');
        const searchBtn = mainContentContainer.querySelector('.search-btn');

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleItemSearch(type);
                }
            });
        }
        if (searchBtn) {
            searchBtn.addEventListener('click', () => handleItemSearch(type));
        }

        lessonsContentDiv.innerHTML = ''; // Xóa nội dung loading
        lessonsContentDiv.appendChild(mainContentContainer); // Thêm nội dung mới
    }

    async function showLessonDetailView(lessonId) {
        if (!lessonDetailContentArea) {
            console.error("DOM Error: Element with ID 'lessonDetailContentArea' not found.");
            showToast('error', 'Lỗi', 'Lỗi hiển thị bài học: Không tìm thấy vùng chứa nội dung.');
            return;
        }
        lessonDetailContentArea.innerHTML = '<p class="loading-message">Đang tải nội dung bài học...</p>';
        const postDetails = await getPostDetails(lessonId);

        if (!postDetails) {
            lessonDetailContentArea.innerHTML = '<p class="error-message">Không thể tải nội dung bài học.</p>';
            return;
        }
        lessonDetailContentArea.innerHTML = postDetails.content;
        await addPostHistory(lessonId); // Gọi hàm lưu lịch sử bài học (type 2)

        lessonsSection.classList.add('hidden');
        quizSection.classList.add('hidden');
        subTopicsSection.classList.add('hidden');
        mainTopicsSection.classList.add('hidden');
        lessonDetailSection.classList.remove('hidden');
    }

    async function showQuizView(quizId) {
        // ... (Giữ nguyên như phiên bản cuối)
        if (!quizContentDiv) return;
        quizContentDiv.innerHTML = '<p class="loading-message">Đang tải chi tiết bài kiểm tra...</p>';
        if (submitQuizButton) submitQuizButton.style.display = 'none';

        const examFullDetails = await getExamDetails(quizId);

        if (!examFullDetails) {
            quizContentDiv.innerHTML = '<p class="error-message">Không thể tải thông tin bài kiểm tra.</p>';
            return;
        }
        currentQuizData = examFullDetails;

        if (!currentQuizData.questions || currentQuizData.questions.length === 0) {
            quizContentDiv.innerHTML = '<p>Bài ôn tập này hiện chưa có câu hỏi.</p>';
            document.getElementById('totalQuestions').textContent = '0';
            document.getElementById('currentQuestion').textContent = '0';
            stopQuizTimerInterval();
            document.getElementById('quizTime').textContent = (currentQuizData.timeLimit === 0) ? 'Không giới hạn' : '00:00';
            if (submitQuizButton) submitQuizButton.style.display = 'inline-block';
        } else {
            quizTimeLeft = currentQuizData.timeLimit;
            if (quizTimeLeft === 0) {
                document.getElementById('quizTime').textContent = 'Không giới hạn';
            } else {
                updateQuizTimerDisplay();
                startQuizTimerInterval();
            }
            currentQuestionIndex = 0;
            userAnswers = new Array(currentQuizData.questions.length).fill(null);
            document.getElementById('totalQuestions').textContent = currentQuizData.questions.length;
            renderQuizQuestionView(currentQuestionIndex);
            if (submitQuizButton) submitQuizButton.style.display = 'inline-block';
        }

        lessonsSection.classList.add('hidden');
        lessonDetailSection.classList.add('hidden');
        subTopicsSection.classList.add('hidden');
        mainTopicsSection.classList.add('hidden');
        quizSection.classList.remove('hidden');
    }

    // --- QUIZ LOGIC FUNCTIONS ---
    // ... (startQuizTimerInterval, stopQuizTimerInterval, updateQuizTimerDisplay, renderQuizQuestionView giữ nguyên) ...
    function startQuizTimerInterval() {
        if (quizTimer) clearInterval(quizTimer);
        if (currentQuizData && currentQuizData.timeLimit === 0) return;
        if (quizTimeLeft <= 0 && !(currentQuizData && currentQuizData.timeLimit === 0)) return;

        quizTimer = setInterval(() => {
            quizTimeLeft--;
            updateQuizTimerDisplay();
            if (quizTimeLeft < 0) {
                quizTimeLeft = 0;
                updateQuizTimerDisplay();
                stopQuizTimerInterval();
                processQuizSubmission();
            }
        }, 1000);
    }

    function stopQuizTimerInterval() {
        clearInterval(quizTimer);
    }

    function updateQuizTimerDisplay() {
        if (currentQuizData && currentQuizData.timeLimit === 0) {
            const quizTimeEl = document.getElementById('quizTime');
            if (quizTimeEl) quizTimeEl.textContent = 'Không giới hạn';
            return;
        }
        const minutes = Math.floor(quizTimeLeft / 60);
        const seconds = quizTimeLeft % 60;
        const quizTimeEl = document.getElementById('quizTime');
        if (quizTimeEl) {
            quizTimeEl.textContent =
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    function renderQuizQuestionView(index) {
        const nextQuestionButtonElement = document.getElementById('nextQuestionBtn');

        if (!currentQuizData || !currentQuizData.questions || currentQuizData.questions.length === 0) {
            if (quizContentDiv) quizContentDiv.innerHTML = "<p>Không có câu hỏi nào để hiển thị.</p>";
            if (nextQuestionButtonElement) nextQuestionButtonElement.style.display = 'none';
            const prevQuestionButtonElement = document.getElementById('prevQuestionBtn');
            if (prevQuestionButtonElement) prevQuestionButtonElement.style.display = 'none';
            return;
        }
        if (submitQuizButton) submitQuizButton.style.display = 'inline-block';

        if (index < 0 || index >= currentQuizData.questions.length) {
            return;
        }

        const question = currentQuizData.questions[index];
        document.getElementById('currentQuestion').textContent = (index + 1).toString();

        let optionsHtml = '';
        if (question.options && Array.isArray(question.options) && question.options.length > 0) {
            optionsHtml = question.options.map((option) => `
                <label class="quiz-option-label">
                    <input type="radio" name="answer-${question.questionId}" value="${option.optionId}" 
                           ${userAnswers[index] !== null && userAnswers[index] === option.optionId ? 'checked' : ''}>
                    <span class="quiz-option-text">${option.optionText || 'Lựa chọn'}</span>
                </label>
            `).join('');
        } else {
            optionsHtml = "<p>Câu hỏi này không có lựa chọn.</p>";
        }

        quizContentDiv.innerHTML = `
            <div class="question">
                <h3>${question.questionText || 'Đang tải nội dung câu hỏi...'}</h3>
                <div class="options">
                    ${optionsHtml}
                </div>
            </div>
            <div class="quiz-navigation-buttons">
                <button id="prevQuestionBtn" class="btn-secondary" ${index === 0 ? 'disabled' : ''}>Câu trước</button>
                <button id="nextQuestionBtn" class="btn-primary">Câu tiếp theo</button> 
            </div>
        `;

        const newlyRenderedNextBtn = document.getElementById('nextQuestionBtn');
        if (index === currentQuizData.questions.length - 1) {
            if (newlyRenderedNextBtn) newlyRenderedNextBtn.style.display = 'none';
        } else {
            if (newlyRenderedNextBtn) newlyRenderedNextBtn.style.display = 'inline-block';
        }

        quizContentDiv.querySelectorAll(`input[name="answer-${question.questionId}"]`).forEach(radio => {
            radio.addEventListener('change', (e) => {
                userAnswers[currentQuestionIndex] = parseInt(e.target.value);
            });
        });

        document.getElementById('nextQuestionBtn')?.addEventListener('click', () => {
            if (currentQuestionIndex < currentQuizData.questions.length - 1) {
                currentQuestionIndex++;
                renderQuizQuestionView(currentQuestionIndex);
            }
        });
        document.getElementById('prevQuestionBtn')?.addEventListener('click', () => {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                renderQuizQuestionView(currentQuestionIndex);
            }
        });
    }

    // ĐÃ CẬP NHẬT: processQuizSubmission
    async function processQuizSubmission() { // Thêm async để gọi addExamResultHistory
        stopQuizTimerInterval();
        let correctAnswersCount = 0;
        let wrongAnswersCount = 0;
        let totalQuestionsInQuiz = 0;

        if (currentQuizData && currentQuizData.questions && currentQuizData.questions.length > 0) {
            totalQuestionsInQuiz = currentQuizData.questions.length;
            currentQuizData.questions.forEach((question, index) => {
                if (userAnswers[index] !== null && userAnswers[index] === question.correctOptionId) {
                    correctAnswersCount++;
                }
            });
            wrongAnswersCount = totalQuestionsInQuiz - correctAnswersCount;

            const resultMessage = `Bạn đã trả lời đúng ${correctAnswersCount}/${totalQuestionsInQuiz} câu.`;

            if (quizContentDiv) {
                quizContentDiv.innerHTML = `
                    <div class="quiz-results">
                        <h2>Kết quả bài ôn tập</h2>
                        <p>${resultMessage}</p>
                        <button id="backToQuizListFromResultInQuiz" class="btn-primary">Quay lại danh sách</button>
                    </div>
                `;
                document.getElementById('backToQuizListFromResultInQuiz')?.addEventListener('click', () => {
                    quizSection.classList.add('hidden');
                    currentLessonOrQuizType = 'quizzes';
                    showLessonsAndQuizzesListView(currentSubTopicId);
                });
            }
            if (submitQuizButton) submitQuizButton.style.display = 'none';

            // Gọi hàm lưu Exam History với thông tin đầy đủ
            await window.historyAPI.addExamResultHistory(
                currentQuizData.id,
                correctAnswersCount,
                wrongAnswersCount,
                totalQuestionsInQuiz
            );

        } else if (currentQuizData) { // Quiz tồn tại nhưng không có câu hỏi
            totalQuestionsInQuiz = 0;
            if (quizContentDiv) {
                quizContentDiv.innerHTML = `
                    <div class="quiz-results">
                        <h2>Thông báo</h2>
                        <p>Bài ôn tập này không có câu hỏi để chấm điểm.</p>
                        <button id="backToQuizListFromResultInQuiz" class="btn-primary">Quay lại danh sách</button>
                    </div>
                `;
                document.getElementById('backToQuizListFromResultInQuiz')?.addEventListener('click', () => {
                    quizSection.classList.add('hidden');
                    currentLessonOrQuizType = 'quizzes';
                    showLessonsAndQuizzesListView(currentSubTopicId);
                });
            }
            if (submitQuizButton) submitQuizButton.style.display = 'none';
            await window.historyAPI.addExamResultHistory(currentQuizData.id, 0, 0, 0);
        } else {
            showToast('error', 'Lỗi', 'Không có dữ liệu bài ôn tập để nộp.');
        }
    }

    // --- NAVIGATION AND UI FLOW ---
    // ... (Các nút back và tab switching giữ nguyên) ...
    if (backToMainTopics) backToMainTopics.addEventListener('click', () => {
        subTopicsSection.classList.add('hidden');
        lessonsSection.classList.add('hidden');
        lessonDetailSection.classList.add('hidden');
        quizSection.classList.add('hidden');
        mainTopicsSection.classList.remove('hidden');
        stopQuizTimerInterval();
        if (submitQuizButton) submitQuizButton.style.display = 'inline-block';
    });

    if (backToSubTopics) backToSubTopics.addEventListener('click', () => {
        lessonsSection.classList.add('hidden');
        subTopicsSection.classList.remove('hidden');
        mainTopicsSection.classList.add('hidden');
        stopQuizTimerInterval();
        if (submitQuizButton) submitQuizButton.style.display = 'inline-block';
    });

    if (backToLessons) backToLessons.addEventListener('click', () => {
        lessonDetailSection.classList.add('hidden');
        currentLessonOrQuizType = 'lessons';
        showLessonsAndQuizzesListView(currentSubTopicId);
    });

    if (backToQuizList) backToQuizList.addEventListener('click', () => {
        quizSection.classList.add('hidden');
        stopQuizTimerInterval();
        currentLessonOrQuizType = 'quizzes';
        showLessonsAndQuizzesListView(currentSubTopicId);
        if (submitQuizButton) submitQuizButton.style.display = 'inline-block';
    });

    if (submitQuizButton) {
        submitQuizButton.addEventListener('click', () => {
            if (quizSection.classList.contains('hidden')) {
                return;
            }
            if (currentQuizData && currentQuizData.questions && currentQuizData.questions.length > 0) {
                const confirmSubmit = confirm("Bạn có chắc chắn muốn nộp bài không? Hành động này không thể hoàn tác.");
                if (confirmSubmit) {
                    processQuizSubmission();
                }
            } else if (currentQuizData) {
                processQuizSubmission();
            } else {
                showToast('error', 'Lỗi', 'Không có bài ôn tập nào đang làm hoặc bài ôn tập không có câu hỏi để nộp.');
            }
        });
    }

    document.querySelectorAll('.lessons-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            document.querySelectorAll('.lessons-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLessonOrQuizType = btn.dataset.tab;
            if (currentSubTopicId) {
                await renderItemsInLessonsContent(currentSubTopicId, currentLessonOrQuizType);
            }
        });
    });

    // --- INITIALIZATION ---
    async function initializeApp() {
        if (mainTopicsGrid) mainTopicsGrid.innerHTML = '<p class="loading-message">Đang tải danh sách chủ đề...</p>';
        const topics = await getMainTopics();
        renderMainTopics(topics);
        mainTopicsSection.classList.remove('hidden');
        subTopicsSection.classList.add('hidden');
        lessonsSection.classList.add('hidden');
        lessonDetailSection.classList.add('hidden');
        quizSection.classList.add('hidden');
    }

    initializeApp();

    // Thêm các hàm mới cho tìm kiếm và phân trang
    async function handleTopicSearch() {
        const searchInput = document.getElementById('topicSearch');
        if (!searchInput) return;

        currentKeyword = searchInput.value.trim();
        currentPage = 1; // Reset về trang 1 khi tìm kiếm
        const topics = await getMainTopics(currentKeyword);
        renderMainTopics(topics);
    }

    async function handleSubTopicSearch() {
        const searchInput = document.getElementById('subTopicSearch');
        if (!searchInput) return;

        currentKeyword = searchInput.value.trim();
        currentPage = 1; // Reset về trang 1 khi tìm kiếm
        await showSubTopicsView(currentMainTopicId);
    }

    async function handleTopicPageChange(delta) {
        const newPage = currentPage + delta;
        if (newPage < 1 || newPage > totalPages) return;

        currentPage = newPage;
        const topics = await getMainTopics(currentKeyword);
        renderMainTopics(topics);
    }

    async function handleSubTopicPageChange(delta) {
        const newPage = currentPage + delta;
        if (newPage < 1 || newPage > totalPages) return;

        currentPage = newPage;
        await showSubTopicsView(currentMainTopicId);
    }

    // Thêm các hàm mới cho tìm kiếm và phân trang cho item (bài học/bài ôn tập)
    async function handleItemSearch(type) {
        const searchInput = document.getElementById('itemSearch');
        if (!searchInput) return;

        currentKeyword = searchInput.value.trim();
        currentPage = 1; // Reset về trang 1 khi tìm kiếm
        await renderItemsInLessonsContent(currentSubTopicId, type);
    }

    async function handleItemPageChange(delta, type) {
        const newPage = currentPage + delta;
        if (newPage < 1 || newPage > totalPages) return;
        
        currentPage = newPage;
        await renderItemsInLessonsContent(currentSubTopicId, type);
    }
});