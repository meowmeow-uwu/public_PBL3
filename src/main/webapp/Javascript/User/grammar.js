// grammar.js

// Giả định API_BASE_URL đã được thiết lập trong window.APP_CONFIG
const API_BASE_URL = window.APP_CONFIG.API_BASE_URL;

// Hàm tiện ích để thực hiện fetch với Authorization header (giữ nguyên)
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
        if (response.status === 204) return null;
        return response.json();
    } catch (networkError) {
        console.error("Network error or server unreachable:", networkError);
        throw new Error(`Network error: ${networkError.message}`);
    }
}

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

    // --- API CALL FUNCTIONS ---
    // ... (getMainTopics, getSubTopicsForTopic, getPostsForSubTopic, getExamsForSubTopic, getPostDetails, getExamDetails giữ nguyên) ...
    async function getMainTopics() {
        try {
            allTopics = await fetchWithAuth(`${API_BASE_URL}/topic/`);
            return allTopics || [];
        } catch (error) {
            console.error("Error fetching main topics:", error);
            if (mainTopicsGrid) mainTopicsGrid.innerHTML = `<p class="error-message">Lỗi tải danh sách chủ đề. Vui lòng thử lại sau.</p>`;
            return [];
        }
    }

    async function getSubTopicsForTopic(topicId) {
        try {
            const subTopics = await fetchWithAuth(`${API_BASE_URL}/topic/${topicId}/subtopics`);
            return subTopics || [];
        } catch (error) {
            console.error(`Error fetching subtopics for topic ${topicId}:`, error);
            return [];
        }
    }

    async function getPostsForSubTopic(subTopicId) {
        try {
            const posts = await fetchWithAuth(`${API_BASE_URL}/subtopic/${subTopicId}/posts`);
            return (posts || []).filter(p => !p.is_deleted);
        } catch (error) {
            console.error(`Error fetching posts for subtopic ${subTopicId}:`, error);
            return [];
        }
    }

    async function getExamsForSubTopic(subTopicId) {
        try {
            const exams = await fetchWithAuth(`${API_BASE_URL}/exam/subtopic/${subTopicId}`);
            return (exams || []).filter(ex => !ex.is_deleted);
        } catch (error) {
            console.error(`Error fetching exams for subtopic ${subTopicId}:`, error);
            return [];
        }
    }

    async function getPostDetails(postId) {
        try {
            const postDetails = await fetchWithAuth(`${API_BASE_URL}/post/${postId}`);
            return postDetails;
        } catch (error) {
            console.error(`Error fetching details for post ${postId}:`, error);
            return null;
        }
    }
    
    async function getExamDetails(examId) { // Vẫn giữ giả định quan trọng về backend cho hàm này
        try {
            const examBasicInfo = await fetchWithAuth(`${API_BASE_URL}/exam/${examId}`);
            if (!examBasicInfo) throw new Error("Thông tin bài kiểm tra không tìm thấy.");

            const questionsFromApi = await fetchWithAuth(`${API_BASE_URL}/questions/exam/${examId}`);
            
            const processedQuestions = [];
            if (questionsFromApi && questionsFromApi.length > 0) {
                for (const qDto of questionsFromApi) {
                    if (qDto.is_deleted) continue;
                    const answersFromApi = await fetchWithAuth(`${API_BASE_URL}/questions/${qDto.question_id}/answers`);
                    let correctOptId = null;
                    const options = (answersFromApi || [])
                        .filter(ans => !ans.is_deleted)
                        .map(ansDto => {
                            if (ansDto.correct === true) { 
                                correctOptId = ansDto.answer_id;
                            }
                            return { optionId: ansDto.answer_id, optionText: ansDto.content };
                        });
                    processedQuestions.push({
                        questionId: qDto.question_id,
                        questionText: qDto.content,
                        options: options,
                        correctOptionId: correctOptId
                    });
                }
            }
            return {
                id: examBasicInfo.exam_id,
                title: examBasicInfo.name,
                questions: processedQuestions,
                timeLimit: examBasicInfo.timeLimitSeconds || 0, // Backend PHẢI cung cấp
                type: 'quiz'
            };
        } catch (error) {
            console.error(`Error fetching full details for exam ${examId}:`, error);
            alert(`Không thể tải chi tiết bài kiểm tra: ${error.message}.`);
            return null;
        }
    }
    
    // Lưu lịch sử bài học (post)
    async function addPostHistory(postId) {
        try {
            const historyData = { key_id: postId };
            await fetchWithAuth(`${API_BASE_URL}/history/?type=2`, { // Sử dụng HistoryController chung
                method: 'POST',
                body: JSON.stringify(historyData)
            });
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
    // ... (renderMainTopics, showSubTopicsView, showLessonsAndQuizzesListView, renderItemsInLessonsContent giữ nguyên) ...
    function renderMainTopics(topics) {
        if (!mainTopicsGrid) return;
        if (!topics || topics.length === 0) {
            mainTopicsGrid.innerHTML = "<p>Chưa có chủ đề nào.</p>";
            return;
        }
        mainTopicsGrid.innerHTML = topics.map(topic => `
            <div class="main-topic-card" data-topic-id="${topic.topic_id}">
                <div class="main-topic-icon"><i class="fas fa-book"></i></div>
                <h3>${topic.name}</h3>
                <p>Khám phá ${topic.name.toLowerCase()}</p>
            </div>
        `).join('');

        mainTopicsGrid.querySelectorAll('.main-topic-card').forEach(card => {
            card.addEventListener('click', async () => {
                currentMainTopicId = parseInt(card.dataset.topicId);
                await showSubTopicsView(currentMainTopicId);
            });
        });
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

        const subTopics = await getSubTopicsForTopic(mainTopicId);
        document.getElementById('subTopicsTitle').textContent = currentTopic.name;

        if (!subTopics || subTopics.length === 0) {
            subTopicsGrid.innerHTML = '<p>Chủ đề này hiện chưa có bài học.</p>';
        } else {
            subTopicsGrid.innerHTML = subTopics.map(subTopic => `
                <div class="sub-topic-card" data-subtopic-id="${subTopic.sub_topic_id}">
                    <span>${subTopic.name}</span>
                </div>
            `).join('');

            subTopicsGrid.querySelectorAll('.sub-topic-card').forEach(card => {
                card.addEventListener('click', async () => {
                    currentSubTopicId = parseInt(card.dataset.subtopicId);
                    currentLessonOrQuizType = 'lessons';
                    await showLessonsAndQuizzesListView(currentSubTopicId);
                });
            });
        }
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
        let items = [];
        if (!lessonsContentDiv) return;
        lessonsContentDiv.innerHTML = `<p class="loading-message">Đang tải ${type === 'lessons' ? 'bài học' : 'bài kiểm tra'}...</p>`;

        if (type === 'lessons') {
            const posts = await getPostsForSubTopic(subTopicId);
            items = posts.map(post => ({ id: post.post_id, title: post.post_name, type: 'lesson' }));
        } else if (type === 'quizzes') {
            const exams = await getExamsForSubTopic(subTopicId);
            items = exams.map(exam => ({ id: exam.exam_id, title: exam.name, type: 'quiz' }));
        }

        if (!items || items.length === 0) {
            lessonsContentDiv.innerHTML = `<p>Không có ${type === 'lessons' ? 'bài học' : 'bài kiểm tra'} nào cho chủ đề này.</p>`;
            return;
        }

        lessonsContentDiv.innerHTML = items.map(item => `
            <div class="lesson-item" data-id="${item.id}" data-type="${item.type}">
                <h3>${item.title}</h3>
                <button class="btn-primary">
                    ${item.type === 'lesson' ? 'Học bài' : 'Làm bài kiểm tra'}
                </button>
            </div>
        `).join('');

        lessonsContentDiv.querySelectorAll('.lesson-item button').forEach(button => {
            button.addEventListener('click', async (e) => {
                const lessonItemDiv = e.target.closest('.lesson-item');
                const itemId = parseInt(lessonItemDiv.dataset.id);
                const itemType = lessonItemDiv.dataset.type;
                if (itemType === 'lesson') await showLessonDetailView(itemId);
                else if (itemType === 'quiz') await showQuizView(itemId);
            });
        });
    }
    
    async function showLessonDetailView(lessonId) {
        if (!lessonDetailContentArea) {
            console.error("DOM Error: Element with ID 'lessonDetailContentArea' not found.");
            alert("Lỗi hiển thị bài học: Không tìm thấy vùng chứa nội dung.");
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
        if(submitQuizButton) submitQuizButton.style.display = 'none';

        const examFullDetails = await getExamDetails(quizId);

        if (!examFullDetails) {
            quizContentDiv.innerHTML = '<p class="error-message">Không thể tải thông tin bài kiểm tra.</p>';
            return;
        }
        currentQuizData = examFullDetails;

        if (!currentQuizData.questions || currentQuizData.questions.length === 0) {
            quizContentDiv.innerHTML = '<p>Bài kiểm tra này hiện chưa có câu hỏi.</p>';
            document.getElementById('totalQuestions').textContent = '0';
            document.getElementById('currentQuestion').textContent = '0';
            stopQuizTimerInterval();
            document.getElementById('quizTime').textContent = (currentQuizData.timeLimit === 0) ? 'Không giới hạn' : '00:00';
            if(submitQuizButton) submitQuizButton.style.display = 'inline-block';
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
            if(submitQuizButton) submitQuizButton.style.display = 'inline-block';
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
            if(prevQuestionButtonElement) prevQuestionButtonElement.style.display = 'none';
            return;
        }
        if(submitQuizButton) submitQuizButton.style.display = 'inline-block'; 

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
                // Không cần else if cho wrongAnswersCount ở đây, sẽ tính sau
            });
            wrongAnswersCount = totalQuestionsInQuiz - correctAnswersCount;

            const resultMessage = `Bạn đã trả lời đúng ${correctAnswersCount}/${totalQuestionsInQuiz} câu.`;

            if (quizContentDiv) {
                quizContentDiv.innerHTML = `
                    <div class="quiz-results">
                        <h2>Kết quả bài kiểm tra</h2>
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
            if(submitQuizButton) submitQuizButton.style.display = 'none';

            // Gọi hàm lưu Exam History với thông tin đầy đủ
            await addExamResultHistory(currentQuizData.id, correctAnswersCount, wrongAnswersCount, totalQuestionsInQuiz);

        } else if (currentQuizData) { // Quiz tồn tại nhưng không có câu hỏi
            totalQuestionsInQuiz = 0;
            if (quizContentDiv) {
                quizContentDiv.innerHTML = `
                    <div class="quiz-results">
                        <h2>Thông báo</h2>
                        <p>Bài kiểm tra này không có câu hỏi để chấm điểm.</p>
                        <button id="backToQuizListFromResultInQuiz" class="btn-primary">Quay lại danh sách</button>
                    </div>
                `;
                 document.getElementById('backToQuizListFromResultInQuiz')?.addEventListener('click', () => {
                    quizSection.classList.add('hidden');
                    currentLessonOrQuizType = 'quizzes';
                    showLessonsAndQuizzesListView(currentSubTopicId);
                });
            }
            if(submitQuizButton) submitQuizButton.style.display = 'none';
            await addExamResultHistory(currentQuizData.id, 0, 0, 0); // Lưu history với kết quả 0
        } else {
            alert("Không có dữ liệu bài kiểm tra để nộp.");
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
                alert("Không có bài kiểm tra nào đang làm hoặc bài kiểm tra không có câu hỏi để nộp.");
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
});