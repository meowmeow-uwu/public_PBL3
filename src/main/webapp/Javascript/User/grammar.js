// Giả định API_BASE_URL đã được thiết lập trong window.APP_CONFIG
const API_BASE_URL = window.APP_CONFIG.API_BASE_URL;

// Hàm tiện ích để thực hiện fetch với Authorization header
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
            } catch (e) { /* Ignore if error response is not JSON */ }
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

    const backToMainTopics = document.getElementById('backToMainTopics');
    const backToSubTopics = document.getElementById('backToSubTopics');
    const backToLessons = document.getElementById('backToLessons');
    const backToQuizList = document.getElementById('backToQuizList');
    const submitQuizButton = document.getElementById('submitQuizBtn');

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
    // ... (Các hàm getMainTopics, getSubTopicsForTopic, getPostsForSubTopic, getExamsForSubTopic, getPostDetails giữ nguyên)
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
    
    async function getExamDetails(examId) {
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
                            if (ansDto.correct) {
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
                timeLimit: examBasicInfo.timeLimitSeconds || 0, // Backend PHẢI cung cấp cái này
                type: 'quiz'
            };
        } catch (error) {
            console.error(`Error fetching full details for exam ${examId}:`, error);
            alert(`Không thể tải chi tiết bài kiểm tra: ${error.message}.`);
            return null;
        }
    }

    async function addHistory(keyId, type) {
        try {
            const historyData = { key_id: keyId };
            await fetchWithAuth(`${API_BASE_URL}/history/?type=${type}`, {
                method: 'POST',
                body: JSON.stringify(historyData)
            });
            console.log(`History added/processed for key_id ${keyId}, type ${type}.`);
        } catch (error) {
            if (error.message && (error.message.includes("400") || error.message.includes("409")) &&
                error.message.toLowerCase().includes("history already exists")) {
                console.log(`History already exists for key_id ${keyId}, type ${type}. (Client recognized)`);
            } else {
                console.error(`CLIENT: Error processing history for key_id ${keyId} with type ${type}:`, error.message);
            }
        }
    }

    // --- UI RENDERING FUNCTIONS ---
    // ... (renderMainTopics, showSubTopicsView, showLessonsAndQuizzesListView, renderItemsInLessonsContent giữ nguyên)
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
        await addHistory(lessonId, 2);

        lessonsSection.classList.add('hidden');
        quizSection.classList.add('hidden');
        subTopicsSection.classList.add('hidden');
        mainTopicsSection.classList.add('hidden');
        lessonDetailSection.classList.remove('hidden');
    }

    async function showQuizView(quizId) {
        if (!quizContentDiv) return;
        quizContentDiv.innerHTML = '<p class="loading-message">Đang tải chi tiết bài kiểm tra...</p>';
        if(submitQuizButton) submitQuizButton.style.display = 'none'; // Ẩn nút nộp bài chính ban đầu

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
            if(submitQuizButton) submitQuizButton.style.display = 'inline-block'; // Hiển thị nếu không có câu hỏi để người dùng có thể "nộp" (và thấy kết quả 0/0)
        } else {
            quizTimeLeft = currentQuizData.timeLimit;
            if (quizTimeLeft === 0) {
                document.getElementById('quizTime').textContent = 'Không giới hạn';
            } else {
                updateQuizTimerDisplay();
                startQuizTimerInterval();
            }
            currentQuestionIndex = 0;
            userAnswers = new Array(currentQuizData.questions.length).fill(null); // Quan trọng: Khởi tạo/Reset userAnswers
            document.getElementById('totalQuestions').textContent = currentQuizData.questions.length;
            renderQuizQuestionView(currentQuestionIndex);
            if(submitQuizButton) submitQuizButton.style.display = 'inline-block'; // Hiển thị nút nộp bài chính
        }

        lessonsSection.classList.add('hidden');
        lessonDetailSection.classList.add('hidden');
        subTopicsSection.classList.add('hidden');
        mainTopicsSection.classList.add('hidden');
        quizSection.classList.remove('hidden');
    }

    // --- QUIZ LOGIC FUNCTIONS ---
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
        const nextQuestionButton = document.getElementById('nextQuestionBtn'); // Lấy nút này để có thể ẩn/hiện
        
        if (!currentQuizData || !currentQuizData.questions || currentQuizData.questions.length === 0) {
            if (quizContentDiv) quizContentDiv.innerHTML = "<p>Không có câu hỏi nào để hiển thị.</p>";
            if (nextQuestionButton) nextQuestionButton.style.display = 'none'; // Ẩn nút "Câu tiếp theo"
            const prevQuestionButton = document.getElementById('prevQuestionBtn');
            if(prevQuestionButton) prevQuestionButton.style.display = 'none';
            return;
        }

        if (index < 0 || index >= currentQuizData.questions.length) {
            // Nếu index vượt quá, có thể là đã xử lý hết câu hỏi, nên nộp bài.
            // Hoặc nếu đang ở câu cuối và bấm "Next" thì processQuizSubmission được gọi từ event listener của nút đó.
            // Dòng này có thể không cần thiết nếu logic nút next/prev xử lý đúng.
            // processQuizSubmission(); 
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
        
        // Xử lý hiển thị nút "Câu tiếp theo"
        const newNextQuestionButton = document.getElementById('nextQuestionBtn');
        if (index === currentQuizData.questions.length - 1) {
            if (newNextQuestionButton) newNextQuestionButton.style.display = 'none'; // Ẩn nếu là câu cuối
        } else {
            if (newNextQuestionButton) newNextQuestionButton.style.display = 'inline-block'; // Hiện nếu không phải câu cuối
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
            // Không tự động nộp bài ở đây nữa
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
        if (currentQuizData && currentQuizData.questions && currentQuizData.questions.length > 0) {
            currentQuizData.questions.forEach((question, index) => {
                // Nếu userAnswers[index] là null (người dùng không chọn), câu đó tính là sai
                if (userAnswers[index] !== null && userAnswers[index] === question.correctOptionId) {
                    score++;
                }
            });
            const totalQuestions = currentQuizData.questions.length;
            const resultMessage = `Bạn đã trả lời đúng ${score}/${totalQuestions} câu.`;

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
            if(submitQuizButton) submitQuizButton.style.display = 'none'; // Ẩn nút nộp bài chính sau khi đã nộp
            const quizNavButtons = quizContentDiv.querySelector('.quiz-navigation-buttons');
            if(quizNavButtons) quizNavButtons.innerHTML = ''; // Xóa nút prev/next

        } else if (currentQuizData) {
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
        } else {
            alert("Không có dữ liệu bài kiểm tra để nộp.");
        }
    }

    // --- NAVIGATION AND UI FLOW ---
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
        // Không cần thay đổi hiển thị submitQuizButton vì đang ở lesson detail
    });

    if (backToQuizList) backToQuizList.addEventListener('click', () => {
        quizSection.classList.add('hidden');
        stopQuizTimerInterval();
        currentLessonOrQuizType = 'quizzes';
        showLessonsAndQuizzesListView(currentSubTopicId);
        if (submitQuizButton) submitQuizButton.style.display = 'inline-block'; // Hiện lại khi quay về danh sách
    });

    if (submitQuizButton) {
        submitQuizButton.addEventListener('click', () => {
            if (quizSection.classList.contains('hidden')) {
                alert("Vui lòng chọn một bài kiểm tra để làm.");
                return;
            }
            if (currentQuizData && currentQuizData.questions && currentQuizData.questions.length > 0) {
                 const confirmSubmit = confirm("Bạn có chắc chắn muốn nộp bài không? Hành động này không thể hoàn tác.");
                 if (confirmSubmit) {
                    processQuizSubmission();
                 }
            } else if (currentQuizData) { // Quiz có thể không có câu hỏi
                 processQuizSubmission(); // Vẫn cho phép "nộp" để hiển thị kết quả "0/0" hoặc thông báo
            }
             else {
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

    async function addExamHistory(examId, correctNumber, wrongNumber, totalQuestion) {
        try {
            const examHistoryData = {
                exam_id: examId, // key_id trong DTO ExamHistory
                correct_number: correctNumber,
                wrong_number: wrongNumber,
                total_question: totalQuestion
                // user_id sẽ được backend thêm từ token
            };
            // GIẢ ĐỊNH BẠN SẼ TẠO ENDPOINT NÀY Ở BACKEND:
            // POST /history/exam  (hoặc một tên khác phù hợp)
            // Endpoint này sẽ nhận đối tượng ExamHistoryData và lưu vào bảng exam_history
            await fetchWithAuth(`${API_BASE_URL}/history/exam`, { // THAY ĐỔI ENDPOINT NÀY CHO ĐÚNG
                method: 'POST',
                body: JSON.stringify(examHistoryData)
            });
            console.log(`Exam history added for exam_id ${examId}`);
        } catch (error) {
            console.error(`CLIENT: Error adding exam history for exam_id ${examId}:`, error.message);
            // Có thể không cần alert lỗi này
        }
    }
    
    
    function processQuizSubmission() {
        stopQuizTimerInterval();
        let score = 0;
        let correctAnswersCount = 0;
        let wrongAnswersCount = 0;
        let totalAttemptedQuestions = 0; // Số câu đã trả lời (khác null)
    
        if (currentQuizData && currentQuizData.questions && currentQuizData.questions.length > 0) {
            currentQuizData.questions.forEach((question, index) => {
                if (userAnswers[index] !== null) { // Chỉ tính những câu đã trả lời
                    totalAttemptedQuestions++;
                    if (userAnswers[index] === question.correctOptionId) {
                        correctAnswersCount++;
                    } else {
                        wrongAnswersCount++;
                    }
                }
            });
            score = correctAnswersCount; // Điểm là số câu đúng
            const totalQuestionsInQuiz = currentQuizData.questions.length;
            const resultMessage = `Bạn đã trả lời đúng ${score}/${totalQuestionsInQuiz} câu.`;
    
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
    
            // Gọi hàm lưu Exam History
            addExamHistory(currentQuizData.id, correctAnswersCount, wrongAnswersCount, totalQuestionsInQuiz);
    
        } else if (currentQuizData) { // Quiz tồn tại nhưng không có câu hỏi
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
            // Vẫn có thể lưu exam history với 0 câu hỏi nếu muốn
            addExamHistory(currentQuizData.id, 0, 0, 0);
        } else {
            alert("Không có dữ liệu bài kiểm tra để nộp.");
        }
    }

    initializeApp();
});