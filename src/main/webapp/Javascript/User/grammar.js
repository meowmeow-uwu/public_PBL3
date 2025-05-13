// Sample data structure (replace with API calls)
const grammarData = {
    'basic-grammar': {
        title: 'Ngữ pháp cơ bản',
        subTopics: [
            {
                id: 'present-simple',
                title: 'Thì hiện tại đơn',
                lessons: [
                    {
                        id: 'ps-1',
                        title: 'Cấu trúc cơ bản',
                        content: '...', // HTML content from API
                        type: 'lesson'
                    },
                    {
                        id: 'ps-2',
                        title: 'Cách sử dụng',
                        content: '...',
                        type: 'lesson'
                    },
                    {
                        id: 'ps-quiz-1',
                        title: 'Kiểm tra thì hiện tại đơn',
                        questions: [
                            {
                                question: 'Chọn câu đúng:',
                                options: ['I am go to school', 'I goes to school', 'I go to school'],
                                answer: 2
                            }
                            // More questions...
                        ],
                        timeLimit: 600, // 10 minutes
                        type: 'quiz'
                    }
                ]
            }
            // More sub-topics...
        ]
    }
    // More main topics...
};

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const mainTopicsSection = document.getElementById('mainTopicsSection');
    const subTopicsSection = document.getElementById('subTopicsSection');
    const lessonsSection = document.getElementById('lessonsSection');
    const lessonDetailSection = document.getElementById('lessonDetailSection');
    const quizSection = document.getElementById('quizSection');
    
    // Navigation buttons
    const backToMainTopics = document.getElementById('backToMainTopics');
    const backToSubTopics = document.getElementById('backToSubTopics');
    const backToLessons = document.getElementById('backToLessons');
    const backToQuizList = document.getElementById('backToQuizList');

    // State variables
    let currentMainTopic = null;
    let currentSubTopic = null;
    let currentLesson = null;
    let quizTimer = null;
    let quizTimeLeft = 0;

    // Main topic selection
    document.querySelectorAll('.main-topic-card').forEach(card => {
        card.addEventListener('click', () => {
            currentMainTopic = card.dataset.topic;
            showSubTopics(currentMainTopic);
        });
    });

    // Back button handlers
    backToMainTopics.addEventListener('click', () => {
        subTopicsSection.classList.add('hidden');
        mainTopicsSection.classList.remove('hidden');
    });

    backToSubTopics.addEventListener('click', () => {
        lessonsSection.classList.add('hidden');
        subTopicsSection.classList.remove('hidden');
    });

    backToLessons.addEventListener('click', () => {
        lessonDetailSection.classList.add('hidden');
        lessonsSection.classList.remove('hidden');
    });

    backToQuizList.addEventListener('click', () => {
        quizSection.classList.add('hidden');
        lessonsSection.classList.remove('hidden');
        stopQuizTimer();
    });

    // Tab switching
    document.querySelectorAll('.lessons-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.lessons-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderLessonsContent(currentSubTopic, btn.dataset.tab);
        });
    });

    // Functions
    function showSubTopics(mainTopic) {
        const topic = grammarData[mainTopic];
        if (!topic) return;

        document.getElementById('subTopicsTitle').textContent = topic.title;
        const subTopicsGrid = document.getElementById('subTopicsGrid');
        
        subTopicsGrid.innerHTML = topic.subTopics.map(subTopic => `
            <div class="sub-topic-card" data-subtopic="${subTopic.id}">
                <span>${subTopic.title}</span>
            </div>
        `).join('');

        subTopicsGrid.querySelectorAll('.sub-topic-card').forEach(card => {
            card.addEventListener('click', () => {
                currentSubTopic = card.dataset.subtopic;
                showLessons(currentSubTopic);
            });
        });

        mainTopicsSection.classList.add('hidden');
        subTopicsSection.classList.remove('hidden');
    }

    function showLessons(subTopicId) {
        const subTopic = grammarData[currentMainTopic].subTopics.find(st => st.id === subTopicId);
        if (!subTopic) return;

        document.getElementById('lessonsTitle').textContent = subTopic.title;
        renderLessonsContent(subTopicId, 'lessons');

        subTopicsSection.classList.add('hidden');
        lessonsSection.classList.remove('hidden');
    }

    function renderLessonsContent(subTopicId, type) {
        const subTopic = grammarData[currentMainTopic].subTopics.find(st => st.id === subTopicId);
        if (!subTopic) return;

        const content = document.getElementById('lessonsContent');
        const items = subTopic.lessons.filter(lesson => lesson.type === type);

        content.innerHTML = items.map(item => `
            <div class="lesson-item" data-id="${item.id}">
                <h3>${item.title}</h3>
                <button class="btn-primary" onclick="start${type === 'lesson' ? 'Lesson' : 'Quiz'}('${item.id}')">
                    ${type === 'lesson' ? 'Học bài' : 'Làm bài kiểm tra'}
                </button>
            </div>
        `).join('');
    }

    // Quiz functions
    window.startQuiz = function(quizId) {
        const quiz = findQuiz(quizId);
        if (!quiz) return;

        quizTimeLeft = quiz.timeLimit;
        updateQuizTimer();
        startQuizTimer();

        document.getElementById('totalQuestions').textContent = quiz.questions.length;
        document.getElementById('currentQuestion').textContent = '1';

        renderQuizQuestion(quiz.questions[0]);

        lessonsSection.classList.add('hidden');
        quizSection.classList.remove('hidden');
    };

    function startQuizTimer() {
        quizTimer = setInterval(() => {
            quizTimeLeft--;
            updateQuizTimer();
            if (quizTimeLeft <= 0) {
                stopQuizTimer();
                submitQuiz();
            }
        }, 1000);
    }

    function stopQuizTimer() {
        clearInterval(quizTimer);
    }

    function updateQuizTimer() {
        const minutes = Math.floor(quizTimeLeft / 60);
        const seconds = quizTimeLeft % 60;
        document.getElementById('quizTime').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function renderQuizQuestion(question) {
        const content = document.getElementById('quizContent');
        content.innerHTML = `
            <div class="question">
                <h3>${question.question}</h3>
                <div class="options">
                    ${question.options.map((option, index) => `
                        <label>
                            <input type="radio" name="answer" value="${index}">
                            ${option}
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Lesson functions
    window.startLesson = function(lessonId) {
        const lesson = findLesson(lessonId);
        if (!lesson) return;

        document.getElementById('lessonContent').innerHTML = lesson.content;
        lessonsSection.classList.add('hidden');
        lessonDetailSection.classList.remove('hidden');
    };

    // Helper functions
    function findQuiz(quizId) {
        return grammarData[currentMainTopic].subTopics
            .find(st => st.id === currentSubTopic)
            .lessons.find(l => l.id === quizId);
    }

    function findLesson(lessonId) {
        return grammarData[currentMainTopic].subTopics
            .find(st => st.id === currentSubTopic)
            .lessons.find(l => l.id === lessonId);
    }

    // Initialize
    renderLessonsContent('present-simple', 'lessons');
});
