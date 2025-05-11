// Sample vocabulary data (replace with actual data from backend)
const vocabularyData = {
    fruits: {
        title: "Fruits",
        level: "Beginner",
        words: [
            {
                word: "Apple",
                phonetic: "/ˈæp.əl/",
                type: "noun",
                meaning: "A round fruit with red, yellow, or green skin",
                example: "I eat an apple every day.",
                image: "apple.jpg",
                audio: "apple.mp3"
            },
            // Add more words...
        ]
    },
    family: {
        title: "Family",
        level: "Beginner",
        words: [
            {
                word: "Mother",
                phonetic: "/ˈmʌð.ər/",
                type: "noun",
                meaning: "A female parent",
                example: "My mother is a teacher.",
                image: "mother.jpg",
                audio: "mother.mp3"
            },
            // Add more words...
        ]
    },
    // Add more topics...
};

// DOM Elements
const topicGrid = document.querySelector('.topic-grid');
const flashcardSection = document.querySelector('.flashcard-section');
const flashcard = document.querySelector('.flashcard');
const wordElement = document.querySelector('.word');
const phoneticElement = document.querySelector('.phonetic');
const wordTypeElement = document.querySelector('.word-type');
const meaningElement = document.querySelector('.meaning');
const exampleElement = document.querySelector('.example');
const progressFill = document.querySelector('.progress-fill');
const progressText = document.querySelector('.progress-text');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const audioBtn = document.querySelector('.audio-btn');
const imageBtn = document.querySelector('.image-btn');
const markLearnedBtn = document.querySelector('.mark-learned-btn');

// State variables
let currentTopic = null;
let currentWordIndex = 0;
let learnedWords = new Set();

// Initialize the interface
function init() {
    // Create topic cards
    Object.entries(vocabularyData).forEach(([key, topic]) => {
        const card = createTopicCard(key, topic);
        topicGrid.appendChild(card);
    });

    // Hide flashcard section initially
    flashcardSection.style.display = 'none';

    // Add event listeners
    flashcard.addEventListener('click', flipCard);
    prevBtn.addEventListener('click', showPreviousWord);
    nextBtn.addEventListener('click', showNextWord);
    audioBtn.addEventListener('click', playAudio);
    imageBtn.addEventListener('click', showImage);
    markLearnedBtn.addEventListener('click', toggleLearned);
}

// Create a topic card
function createTopicCard(key, topic) {
    const card = document.createElement('div');
    card.className = 'topic-card';
    card.innerHTML = `
        <div class="topic-icon">
            <i class="fas fa-book"></i>
        </div>
        <h3>${topic.title}</h3>
        <div class="topic-info">
            <span>${topic.words.length} words</span>
            <span class="level-badge">${topic.level}</span>
        </div>
    `;
    card.addEventListener('click', () => startTopic(key));
    return card;
}

// Start a topic
function startTopic(topicKey) {
    currentTopic = topicKey;
    currentWordIndex = 0;
    learnedWords.clear();
    updateProgress();
    
    // Show flashcard section
    topicGrid.style.display = 'none';
    flashcardSection.style.display = 'block';
    
    // Show first word
    showCurrentWord();
}

// Show current word
function showCurrentWord() {
    const word = vocabularyData[currentTopic].words[currentWordIndex];
    
    // Update front of card
    wordElement.textContent = word.word;
    phoneticElement.textContent = word.phonetic;
    wordTypeElement.textContent = word.type;
    
    // Update back of card
    meaningElement.textContent = word.meaning;
    exampleElement.textContent = word.example;
    
    // Reset card to front
    flashcard.classList.remove('flipped');
    
    // Update navigation buttons
    prevBtn.disabled = currentWordIndex === 0;
    nextBtn.disabled = currentWordIndex === vocabularyData[currentTopic].words.length - 1;
    
    // Update learned status
    updateLearnedStatus();
}

// Flip card
function flipCard() {
    flashcard.classList.toggle('flipped');
}

// Show previous word
function showPreviousWord() {
    if (currentWordIndex > 0) {
        currentWordIndex--;
        showCurrentWord();
    }
}

// Show next word
function showNextWord() {
    if (currentWordIndex < vocabularyData[currentTopic].words.length - 1) {
        currentWordIndex++;
        showCurrentWord();
    }
}

// Play audio
function playAudio() {
    const word = vocabularyData[currentTopic].words[currentWordIndex];
    const audio = new Audio(`/Assets/Audio/${word.audio}`);
    audio.play();
}

// Show image
function showImage() {
    const word = vocabularyData[currentTopic].words[currentWordIndex];
    // Implement image display logic (e.g., modal or lightbox)
    alert(`Showing image for ${word.word}`);
}

// Toggle learned status
function toggleLearned() {
    const word = vocabularyData[currentTopic].words[currentWordIndex];
    if (learnedWords.has(word.word)) {
        learnedWords.delete(word.word);
    } else {
        learnedWords.add(word.word);
    }
    updateLearnedStatus();
    updateProgress();
}

// Update learned status button
function updateLearnedStatus() {
    const word = vocabularyData[currentTopic].words[currentWordIndex];
    const isLearned = learnedWords.has(word.word);
    markLearnedBtn.innerHTML = `
        <i class="fas ${isLearned ? 'fa-check-circle' : 'fa-circle'}"></i>
        ${isLearned ? 'Learned' : 'Mark as Learned'}
    `;
}

// Update progress
function updateProgress() {
    const totalWords = vocabularyData[currentTopic].words.length;
    const learnedCount = learnedWords.size;
    const progress = (learnedCount / totalWords) * 100;
    
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${learnedCount}/${totalWords} words learned`;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
