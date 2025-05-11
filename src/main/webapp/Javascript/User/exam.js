document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const quizContent = document.querySelector('.quiz-content');
    const resultsScreen = document.querySelector('.results-screen');
    const questionCount = document.querySelector('.question-count');
    const progressFill = document.querySelector('.progress-fill');
    const timeDisplay = document.getElementById('time');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const saveBtn = document.querySelector('.save-btn');
    const reviewBtn = document.querySelector('.review-btn');
    const homeBtn = document.querySelector('.home-btn');

    // Quiz State
    let currentQuestion = 0;
    let timeLeft = 195; // 3:15 in seconds
    let timerInterval;
    let answers = [];
    let questions = [
        {
            question: 'Nghĩa của từ "uncle" là gì?',
            options: ['Ông', 'Chú/Bác', 'Anh họ', 'Con trai'],
            correctAnswer: 'B'
        },
        // Add more questions here
    ];

    // Initialize Quiz
    function initQuiz() {
        updateQuestion();
        startTimer();
        updateProgress();
    }

    // Update Question Display
    function updateQuestion() {
        const question = questions[currentQuestion];
        document.querySelector('.question-text').textContent = `🧠 Câu hỏi: ${question.question}`;
        
        const options = document.querySelectorAll('.option-text');
        question.options.forEach((option, index) => {
            options[index].textContent = `${String.fromCharCode(65 + index)}. ${option}`;
        });

        // Reset radio buttons
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = false;
        });

        // Update navigation buttons
        prevBtn.disabled = currentQuestion === 0;
        nextBtn.textContent = currentQuestion === questions.length - 1 ? 'Nộp bài' : 'Tiếp theo';
    }

    // Timer Functions
    function startTimer() {
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                submitQuiz();
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Progress Functions
    function updateProgress() {
        const progress = ((currentQuestion + 1) / questions.length) * 100;
        progressFill.style.width = `${progress}%`;
        questionCount.textContent = `Câu hỏi ${currentQuestion + 1} / ${questions.length}`;
    }

    // Navigation Functions
    prevBtn.addEventListener('click', () => {
        if (currentQuestion > 0) {
            currentQuestion--;
            updateQuestion();
            updateProgress();
        }
    });

    nextBtn.addEventListener('click', () => {
        const selectedAnswer = document.querySelector('input[name="answer"]:checked');
        
        if (!selectedAnswer) {
            alert('Vui lòng chọn một đáp án!');
            return;
        }

        // Save answer
        answers[currentQuestion] = selectedAnswer.value;

        if (currentQuestion < questions.length - 1) {
            currentQuestion++;
            updateQuestion();
            updateProgress();
        } else {
            submitQuiz();
        }
    });

    // Save Draft
    saveBtn.addEventListener('click', () => {
        const selectedAnswer = document.querySelector('input[name="answer"]:checked');
        if (selectedAnswer) {
            answers[currentQuestion] = selectedAnswer.value;
        }
        
        // Save to localStorage
        localStorage.setItem('quizDraft', JSON.stringify({
            currentQuestion,
            answers,
            timeLeft
        }));
        
        alert('Đã lưu nháp bài làm!');
    });

    // Submit Quiz
    function submitQuiz() {
        clearInterval(timerInterval);
        
        // Calculate score
        let correctAnswers = 0;
        answers.forEach((answer, index) => {
            if (answer === questions[index].correctAnswer) {
                correctAnswers++;
            }
        });

        // Update results screen
        document.getElementById('final-score').textContent = `${correctAnswers} / ${questions.length}`;
        document.querySelector('.correct').textContent = `🟢 Câu đúng: ${correctAnswers}`;
        document.querySelector('.incorrect').textContent = `🔴 Câu sai: ${questions.length - correctAnswers}`;

        // Show results screen
        quizContent.classList.add('hidden');
        resultsScreen.classList.remove('hidden');
    }

    // Results Actions
    reviewBtn.addEventListener('click', () => {
        // Implement review functionality
        alert('Chức năng ôn tập đang được phát triển!');
    });

    homeBtn.addEventListener('click', () => {
        window.location.href = '/Pages/User/home.html';
    });

    // Load saved draft if exists
    const savedDraft = localStorage.getItem('quizDraft');
    if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        currentQuestion = draft.currentQuestion;
        answers = draft.answers;
        timeLeft = draft.timeLeft;
    }

    // Initialize quiz
    initQuiz();
});
