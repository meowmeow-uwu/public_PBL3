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
}


document.addEventListener('DOMContentLoaded', async () => {
    // DOM Elements
    const mainTopicsSection = document.getElementById('mainTopicsSection');
    const subTopicsSection = document.getElementById('subTopicsSection');
    const lessonsSection = document.getElementById('lessonsSection');
    const lessonDetailSection = document.getElementById('lessonDetailSection');
    const quizSection = document.getElementById('quizSection');

    const mainTopicsGrid = document.querySelector('.main-topics-grid');
    const lessonsContentDiv = document.getElementById('lessonsContent');
    const lessonDetailContentArea = document.getElementById('lessonDetailContentArea');
    const quizContentDiv = document.getElementById('quizContent');

    // Lesson Detail Action Buttons
    const favoriteBtn = lessonDetailSection.querySelector('.action-btn.favorite');
    const completedBtn = lessonDetailSection.querySelector('.action-btn.completed'); // Nút "Đánh dấu hoàn thành"
    const restartBtn = lessonDetailSection.querySelector('.action-btn.restart');
    // const lessonTimerSpan = lessonDetailSection.querySelector('.timer'); // Nếu cần dùng

    // Navigation buttons
    const backToMainTopics = document.getElementById('backToMainTopics');
    const backToSubTopics = document.getElementById('backToSubTopics');
    const backToLessons = document.getElementById('backToLessons');
    const backToQuizList = document.getElementById('backToQuizList');

    // State variables
    let currentMainTopicId = null;
    let currentSubTopicId = null;
    let currentViewingLessonId = null; // ID của bài học đang xem chi tiết
    let currentLessonOrQuizType = 'lessons';
    let quizTimer = null;
    let quizTimeLeft = 0;
    let allTopics = [];
    let currentQuizData = null;
    let currentQuestionIndex = 0;
    let userAnswers = [];

    // --- CÁC HÀM GỌI API ---
    // ... (Các hàm getMainTopics, getSubTopicsForTopic, getPostsForSubTopic, getExamsForSubTopic, getPostDetails, getExamDetails giữ nguyên)
    async function getMainTopics() {
        try {
            allTopics = await fetchWithAuth(`${API_BASE_URL}/topic/`);
            return allTopics || [];
        } catch (error) {
            console.error("Error fetching main topics:", error);
            if(mainTopicsGrid) mainTopicsGrid.innerHTML = `<p>Lỗi tải danh sách chủ đề. ${error.message}</p>`;
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

    async function getExamDetails(examId) {
        try {
            const examBasicInfo = await fetchWithAuth(`${API_BASE_URL}/exam/${examId}`);
            if (!examBasicInfo) throw new Error("Exam not found");

            const questionsFromApi = await fetchWithAuth(`${API_BASE_URL}/questions/exam/${examId}`);
            if (!questionsFromApi) throw new Error("No questions found for this exam");

            const processedQuestions = [];
            for (const qDto of questionsFromApi) {
                if (qDto.is_deleted) continue;
                const answersFromApi = await fetchWithAuth(`${API_BASE_URL}/questions/${qDto.question_id}/answers`);
                let correctOptId = null;
                const options = (answersFromApi || [])
                    .filter(ans => !ans.is_deleted)
                    .map(ansDto => {
                        if (ansDto.is_correct) {
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
            return {
                id: examBasicInfo.exam_id,
                title: examBasicInfo.name,
                questions: processedQuestions,
                timeLimit: examBasicInfo.timeLimitSeconds || 600, // GIẢ ĐỊNH backend có timeLimitSeconds
                type: 'quiz'
            };
        } catch (error) {
            console.error(`Error fetching full details for exam ${examId}:`, error);
            alert(`Không thể tải chi tiết bài kiểm tra: ${error.message}.`);
            return null;
        }
    }

    // Hàm API cho History
    async function addHistory(keyId, type) {
        try {
            const historyData = { key_id: keyId }; // user_id sẽ được set ở backend từ token
            // API POST /history/?type={type}
            await fetchWithAuth(`${API_BASE_URL}/history/?type=${type}`, {
                method: 'POST',
                body: JSON.stringify(historyData)
            });
            return true;
        } catch (error) {
            console.error(`Error adding history for key_id ${keyId} with type ${type}:`, error);
            alert(`Lỗi khi đánh dấu hoàn thành: ${error.message}`);
            return false;
        }
    }

    async function checkHistory(keyId, type) {
        try {
            // API GET /history/{id}?type={type} (id ở đây là key_id)
            // Hoặc API GET /history/?type={type} rồi lọc ở client nếu API không hỗ trợ lấy theo key_id trực tiếp
            // Dựa trên HistoryController, có vẻ GET /history/{id}?type={type} là history_id, không phải key_id.
            // Nên sẽ dùng GET /history/?type={type} và lọc.
            const histories = await fetchWithAuth(`${API_BASE_URL}/history/?type=${type}`);
            if (histories && histories.some(h => h.key_id === keyId)) {
                return true; // Đã tồn tại trong lịch sử
            }
            return false; // Chưa có trong lịch sử
        } catch (error) {
            console.error(`Error checking history for key_id ${keyId} with type ${type}:`, error);
            return false; // Mặc định là chưa hoàn thành nếu có lỗi
        }
    }

    async function removeHistory(keyId, type) {
        try {
            // Để xóa, chúng ta cần history_id. API DELETE /{id} yêu cầu history_id.
            // Trước tiên cần tìm history_id dựa trên keyId và type.
            const histories = await fetchWithAuth(`${API_BASE_URL}/history/?type=${type}`);
            const existingHistory = histories ? histories.find(h => h.key_id === keyId) : null;

            if (existingHistory) {
                // API DELETE /history/{history_id}?type={type}
                await fetchWithAuth(`${API_BASE_URL}/history/${existingHistory.history_id}?type=${type}`, {
                    method: 'DELETE'
                });
                return true;
            }
            return false; // Không tìm thấy để xóa
        } catch (error) {
            console.error(`Error removing history for key_id ${keyId} with type ${type}:`, error);
            alert(`Lỗi khi bỏ đánh dấu hoàn thành: ${error.message}`);
            return false;
        }
    }


    // --- CÁC HÀM HIỂN THỊ ---
    // ... (renderMainTopics, showSubTopicsView, showLessonsAndQuizzesListView, renderItemsInLessonsContent giữ nguyên)
    function renderMainTopics(topics) {
        if (!mainTopicsGrid) return;
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
        subTopicsGrid.innerHTML = '<p>Đang tải chủ đề con...</p>';

        const currentTopic = allTopics.find(t => t.topic_id === mainTopicId);
        if (!currentTopic) {
            subTopicsGrid.innerHTML = '<p>Không tìm thấy thông tin chủ đề chính.</p>';
            return;
        }

        const subTopics = await getSubTopicsForTopic(mainTopicId);
        document.getElementById('subTopicsTitle').textContent = currentTopic.name;

        if (!subTopics || subTopics.length === 0) {
            subTopicsGrid.innerHTML = '<p>Chủ đề này chưa có bài học nào.</p>';
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
        subTopicsSection.classList.remove('hidden');
        lessonsSection.classList.add('hidden');
        lessonDetailSection.classList.add('hidden');
        quizSection.classList.add('hidden');
    }

    async function showLessonsAndQuizzesListView(subTopicId) {
        let subTopicName = "Danh sách";
        try {
            const subTopicDetail = await fetchWithAuth(`${API_BASE_URL}/subtopic/${subTopicId}`);
            if(subTopicDetail) subTopicName = subTopicDetail.name;
        } catch(e) { console.error("Could not fetch subtopic name for title", e)}

        document.getElementById('lessonsTitle').textContent = subTopicName;

        document.querySelectorAll('.lessons-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        const activeTabButton = document.querySelector(`.lessons-tabs .tab-btn[data-tab="${currentLessonOrQuizType}"]`);
        if (activeTabButton) activeTabButton.classList.add('active');
        else {
            document.querySelector('.lessons-tabs .tab-btn[data-tab="lessons"]')?.classList.add('active');
            currentLessonOrQuizType = 'lessons';
        }

        if (!lessonsContentDiv) return;
        lessonsContentDiv.innerHTML = '<p>Đang tải danh sách...</p>';
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
        lessonsContentDiv.innerHTML = `<p>Đang tải ${type === 'lessons' ? 'bài học' : 'bài kiểm tra'}...</p>`;

        if (type === 'lessons') {
            const posts = await getPostsForSubTopic(subTopicId);
            items = posts.map(post => ({
                id: post.post_id,
                title: post.post_name,
                type: 'lesson'
            }));
        } else if (type === 'quizzes') {
            const exams = await getExamsForSubTopic(subTopicId);
            items = exams.map(exam => ({
                id: exam.exam_id,
                title: exam.name,
                type: 'quiz'
            }));
        }

        if (!items || items.length === 0) {
            lessonsContentDiv.innerHTML = `<p>Không có ${type === 'lessons' ? 'bài học' : 'bài kiểm tra'} nào.</p>`;
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

    // CẬP NHẬT HÀM NÀY
    async function showLessonDetailView(lessonId) {
        currentViewingLessonId = lessonId; // Lưu ID bài học đang xem

        if (!lessonDetailContentArea) {
            console.error("Element with ID 'lessonDetailContentArea' not found.");
            alert("Lỗi hiển thị bài học: Không tìm thấy vùng chứa nội dung.");
            return;
        }
        lessonDetailContentArea.innerHTML = '<p>Đang tải nội dung bài học...</p>';
        const postDetails = await getPostDetails(lessonId);

        if (!postDetails) {
            lessonDetailContentArea.innerHTML = '<p>Không thể tải nội dung bài học.</p>';
            return;
        }
        lessonDetailContentArea.innerHTML = postDetails.content;

        // Kiểm tra và cập nhật trạng thái nút "completed"
        await updateCompletedButtonState(lessonId);

        lessonsSection.classList.add('hidden');
        quizSection.classList.add('hidden');
        subTopicsSection.classList.add('hidden');
        mainTopicsSection.classList.add('hidden');
        lessonDetailSection.classList.remove('hidden');
    }

    async function updateCompletedButtonState(lessonId) {
        if (!completedBtn) return;
        const isCompleted = await checkHistory(lessonId, 2); // type = 2 cho lesson
        if (isCompleted) {
            completedBtn.classList.add('active'); // Thêm class 'active' nếu đã hoàn thành
            completedBtn.innerHTML = '<i class="fas fa-check-circle"></i>'; // Icon đã hoàn thành
            completedBtn.title = "Đã hoàn thành";
            // completedBtn.disabled = true; // Tùy chọn: vô hiệu hóa nếu không cho bỏ đánh dấu
        } else {
            completedBtn.classList.remove('active');
            completedBtn.innerHTML = '<i class="far fa-check-circle"></i>'; // Icon chưa hoàn thành
            completedBtn.title = "Đánh dấu hoàn thành";
            // completedBtn.disabled = false;
        }
    }


    async function showQuizView(quizId) {
        // ... (Hàm này giữ nguyên, chỉ cần đảm bảo getExamDetails hoạt động đúng)
        if (!quizContentDiv) return;
        quizContentDiv.innerHTML = '<p>Đang tải chi tiết bài kiểm tra...</p>';

        const examFullDetails = await getExamDetails(quizId);

        if (!examFullDetails || !examFullDetails.questions || examFullDetails.questions.length === 0) {
            if(examFullDetails !== null) {
                 quizContentDiv.innerHTML = '<p>Lỗi: Bài kiểm tra không có câu hỏi hoặc không tải được.</p>';
            }
            return;
        }
        currentQuizData = examFullDetails;
        quizTimeLeft = currentQuizData.timeLimit;
        currentQuestionIndex = 0;
        userAnswers = new Array(currentQuizData.questions.length).fill(null);
        updateQuizTimerDisplay();
        startQuizTimerInterval();
        document.getElementById('totalQuestions').textContent = currentQuizData.questions.length;
        renderQuizQuestionView(currentQuestionIndex);
        lessonsSection.classList.add('hidden');
        lessonDetailSection.classList.add('hidden');
        subTopicsSection.classList.add('hidden');
        mainTopicsSection.classList.add('hidden');
        quizSection.classList.remove('hidden');
    }


    // --- QUIZ FUNCTIONS ---
    // ... (startQuizTimerInterval, stopQuizTimerInterval, updateQuizTimerDisplay, renderQuizQuestionView, processQuizSubmission giữ nguyên)
    function startQuizTimerInterval() {
        if (quizTimer) clearInterval(quizTimer);
        quizTimer = setInterval(() => {
            quizTimeLeft--;
            updateQuizTimerDisplay();
            if (quizTimeLeft <= 0) {
                stopQuizTimerInterval();
                processQuizSubmission();
            }
        }, 1000);
    }

    function stopQuizTimerInterval() {
        clearInterval(quizTimer);
    }

    function updateQuizTimerDisplay() {
        const minutes = Math.floor(quizTimeLeft / 60);
        const seconds = quizTimeLeft % 60;
        const quizTimeEl = document.getElementById('quizTime');
        if (quizTimeEl) {
            quizTimeEl.textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    function renderQuizQuestionView(index) {
        if (!currentQuizData || index < 0 || index >= currentQuizData.questions.length) {
            processQuizSubmission();
            return;
        }
        const question = currentQuizData.questions[index];
        const content = quizContentDiv;
        document.getElementById('currentQuestion').textContent = (index + 1).toString();

        let optionsHtml = '';
        if (question.options && Array.isArray(question.options)) {
            optionsHtml = question.options.map((option) => `
                <label>
                    <input type="radio" name="answer" value="${option.optionId}" ${userAnswers[index] == option.optionId ? 'checked' : ''}>
                    ${option.optionText || 'Lựa chọn'}
                </label>
            `).join('');
        } else {
            optionsHtml = "<p>Không có lựa chọn nào cho câu hỏi này.</p>";
        }

        content.innerHTML = `
            <div class="question">
                <h3>${question.questionText || 'Nội dung câu hỏi...'}</h3>
                <div class="options">
                    ${optionsHtml}
                </div>
            </div>
            <div class="quiz-navigation-buttons">
                <button id="prevQuestionBtn" ${index === 0 ? 'disabled' : ''}>Câu trước</button>
                <button id="nextQuestionBtn">${index === currentQuizData.questions.length - 1 ? 'Nộp bài' : 'Câu tiếp theo'}</button>
            </div>
        `;

        content.querySelectorAll('input[name="answer"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                userAnswers[currentQuestionIndex] = parseInt(e.target.value);
            });
        });

        document.getElementById('nextQuestionBtn')?.addEventListener('click', () => {
            if (currentQuestionIndex < currentQuizData.questions.length - 1) {
                currentQuestionIndex++;
                renderQuizQuestionView(currentQuestionIndex);
            } else {
                processQuizSubmission();
            }
        });
        document.getElementById('prevQuestionBtn')?.addEventListener('click', () => {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                renderQuizQuestionView(currentQuestionIndex);
            }
        });
    }

    function processQuizSubmission() {
        stopQuizTimerInterval();
        let score = 0;
        if (currentQuizData && currentQuizData.questions) {
            currentQuizData.questions.forEach((question, index) => {
                if (userAnswers[index] !== null && userAnswers[index] === question.correctOptionId) {
                    score++;
                }
            });
            const totalQuestions = currentQuizData.questions.length;
            const resultMessage = `Bạn đã trả lời đúng ${score}/${totalQuestions} câu.`;

            if(quizContentDiv) {
                quizContentDiv.innerHTML = `
                    <h2>Kết quả bài kiểm tra</h2>
                    <p>${resultMessage}</p>
                    <button id="backToQuizListFromResultInQuiz">Quay lại danh sách</button>
                `;
                document.getElementById('backToQuizListFromResultInQuiz')?.addEventListener('click', () => {
                    quizSection.classList.add('hidden');
                    currentLessonOrQuizType = 'quizzes';
                    showLessonsAndQuizzesListView(currentSubTopicId);
                });
            }
        } else {
            alert("Không có dữ liệu bài kiểm tra để nộp.");
        }
    }


    // --- EVENT LISTENERS CHO CÁC NÚT ACTION TRONG LESSON DETAIL ---
    if (completedBtn) {
        completedBtn.addEventListener('click', async () => {
            if (!currentViewingLessonId) return;

            const type = 2; // type = 2 cho lesson history
            const isCurrentlyCompleted = completedBtn.classList.contains('active');

            if (isCurrentlyCompleted) {
                // Nếu đang là "Đã hoàn thành", click để bỏ đánh dấu
                // (Tùy chọn: có thể bạn không muốn cho phép bỏ đánh dấu)
                // const success = await removeHistory(currentViewingLessonId, type);
                // if (success) {
                //     updateCompletedButtonState(currentViewingLessonId);
                // }
                alert("Bài học này đã được đánh dấu hoàn thành."); // Hoặc không làm gì cả
            } else {
                // Nếu chưa hoàn thành, click để đánh dấu
                const success = await addHistory(currentViewingLessonId, type);
                if (success) {
                    updateCompletedButtonState(currentViewingLessonId); // Cập nhật lại trạng thái nút
                }
            }
        });
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', async () => {
            if (!currentViewingLessonId) return;
            const type = 2; // type = 2 cho lesson history
            // Logic cho "Học lại": có thể là xóa history và reset trạng thái nút
            const reallyRestart = confirm("Bạn có muốn đánh dấu bài học này là chưa hoàn thành và học lại không?");
            if (reallyRestart) {
                const success = await removeHistory(currentViewingLessonId, type);
                if (success) {
                    updateCompletedButtonState(currentViewingLessonId);
                    alert("Đã bỏ đánh dấu hoàn thành. Bạn có thể học lại bài này.");
                } else {
                    // Có thể history không tồn tại để xóa, vẫn cập nhật nút
                    updateCompletedButtonState(currentViewingLessonId);
                     alert("Không tìm thấy lịch sử để xóa, hoặc đã bỏ đánh dấu.");
                }
            }
        });
    }

    // (Thêm event listener cho favoriteBtn nếu cần)


    // --- Back button handlers ---
    if(backToMainTopics) backToMainTopics.addEventListener('click', () => {
        subTopicsSection.classList.add('hidden');
        lessonsSection.classList.add('hidden');
        lessonDetailSection.classList.add('hidden');
        quizSection.classList.add('hidden');
        mainTopicsSection.classList.remove('hidden');
        stopQuizTimerInterval();
        currentViewingLessonId = null; // Reset khi thoát khỏi chi tiết bài học
    });

    if(backToSubTopics) backToSubTopics.addEventListener('click', () => {
        lessonsSection.classList.add('hidden');
        subTopicsSection.classList.remove('hidden');
        mainTopicsSection.classList.add('hidden');
        stopQuizTimerInterval();
        currentViewingLessonId = null;
    });

    if(backToLessons) backToLessons.addEventListener('click', () => {
        lessonDetailSection.classList.add('hidden');
        currentLessonOrQuizType = 'lessons';
        showLessonsAndQuizzesListView(currentSubTopicId);
        currentViewingLessonId = null;
    });

    if(backToQuizList) backToQuizList.addEventListener('click', () => {
        quizSection.classList.add('hidden');
        stopQuizTimerInterval();
        currentLessonOrQuizType = 'quizzes';
        showLessonsAndQuizzesListView(currentSubTopicId);
    });

    // --- Tab switching ---
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

    // --- KHỞI TẠO BAN ĐẦU ---
    async function initializeApp() {
        if(mainTopicsGrid) mainTopicsGrid.innerHTML = '<p>Đang tải danh sách chủ đề...</p>';
        const topics = await getMainTopics();

        if (topics && topics.length > 0) {
            renderMainTopics(topics);
        } else if (topics) {
             if(mainTopicsGrid) mainTopicsGrid.innerHTML = "<p>Chưa có chủ đề nào.</p>";
        }
        mainTopicsSection.classList.remove('hidden');
        subTopicsSection.classList.add('hidden');
        lessonsSection.classList.add('hidden');
        lessonDetailSection.classList.add('hidden');
        quizSection.classList.add('hidden');
    }

    initializeApp();
});