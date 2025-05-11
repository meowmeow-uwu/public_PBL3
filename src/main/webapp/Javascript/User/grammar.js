document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const topicsSection = document.getElementById('topicsSection');
    const lessonSection = document.getElementById('lessonSection');
    const backButton = document.getElementById('backButton');
    const topicCards = document.querySelectorAll('.topic-card');
    const favoriteBtn = document.querySelector('.favorite');
    const completedBtn = document.querySelector('.completed');
    const restartBtn = document.querySelector('.restart');
    const relatedBtn = document.querySelector('.related');
    const timerDisplay = document.querySelector('.timer');
    const checkAnswerBtn = document.querySelector('.check-answer');
    const answerDisplay = document.querySelector('.answer');

    // Timer functionality
    let startTime;
    let timerInterval;

    function startTimer() {
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 1000);
    }

    function updateTimer() {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
        const seconds = (elapsedTime % 60).toString().padStart(2, '0');
        timerDisplay.innerHTML = `<i class="far fa-clock"></i> ${minutes}:${seconds}`;
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    // Topic selection
    topicCards.forEach(card => {
        card.addEventListener('click', () => {
            const topic = card.dataset.topic;
            loadLesson(topic);
            topicsSection.classList.add('hidden');
            lessonSection.classList.remove('hidden');
            startTimer();
        });
    });

    // Back button
    backButton.addEventListener('click', () => {
        lessonSection.classList.add('hidden');
        topicsSection.classList.remove('hidden');
        stopTimer();
    });

    // Action buttons
    favoriteBtn.addEventListener('click', () => {
        favoriteBtn.querySelector('i').classList.toggle('far');
        favoriteBtn.querySelector('i').classList.toggle('fas');
    });

    completedBtn.addEventListener('click', () => {
        completedBtn.querySelector('i').classList.toggle('far');
        completedBtn.querySelector('i').classList.toggle('fas');
    });

    restartBtn.addEventListener('click', () => {
        stopTimer();
        startTimer();
        // Reset exercise answers
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = false;
        });
        answerDisplay.classList.add('hidden');
    });

    relatedBtn.addEventListener('click', () => {
        // Show related topics modal or dropdown
        alert('Related topics feature coming soon!');
    });

    // Exercise functionality
    checkAnswerBtn.addEventListener('click', () => {
        const selectedAnswer = document.querySelector('input[name="q1"]:checked');
        if (selectedAnswer) {
            answerDisplay.classList.remove('hidden');
        } else {
            alert('Please select an answer first!');
        }
    });

    // Load lesson content
    function loadLesson(topic) {
        // In a real application, this would fetch the lesson content from a server
        // For now, we'll just update the title
        const grammarTitle = document.querySelector('.grammar-title');
        grammarTitle.textContent = topic.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ') + ' Tense';
    }

    // Initialize
    startTimer();
});
