// DOM Elements
const topicGrid = document.querySelector('.topic-grid');
const flashcardSection = document.querySelector('.flashcard-section');
const flashcard = document.querySelector('.flashcard');
const wordElement = document.querySelector('.word');
const phoneticElement = document.querySelector('.phonetic');
const wordTypeElement = document.querySelector('.word-type');
const meaningEnElement = document.querySelector('.meaning-en');
const definitionElement = document.querySelector('.definition');
const exampleElement = document.querySelector('.example');
const meaningElement = document.querySelector('.meaning');
const meaningViElement = document.querySelector('.meaning-vi');
const definitionViElement = document.querySelector('.definition-vi');
const exampleViElement = document.querySelector('.example-vi');
const progressFill = document.querySelector('.progress-fill');
const progressText = document.querySelector('.progress-text');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const audioBtn = document.querySelector('.audio-btn');
const imageBtn = document.querySelector('.image-btn');
const markLearnedBtn = document.querySelector('.mark-learned-btn');
const currentNumberElement = document.querySelector('.current-number');
const totalNumberElement = document.querySelector('.total-number');
const collectionModal = document.getElementById('collectionModal');
const collectionList = document.querySelector('.collection-list');

// State variables
let currentCollection = null;
let currentWordIndex = 0;
let learnedWords = new Set();
let publicCollections = [];
let currentWords = [];
let currentWord = null;

// Initialize the interface
async function init() {
    try {
        // Kiểm tra các element cần thiết
        if (!topicGrid) {
            console.error('Không tìm thấy element .topic-grid');
            return;
        }

        // Lấy danh sách bộ sưu tập công khai
        publicCollections = await window.collectionManagementAPI.getAllPublicCollections();
        console.log('Danh sách bộ sưu tập công khai:', publicCollections);

        // Tạo topic cards từ danh sách bộ sưu tập
        publicCollections.forEach(collection => {
            const card = createTopicCard(collection);
            topicGrid.appendChild(card);
        });

        // Ẩn flashcard section ban đầu
        if (flashcardSection) {
            flashcardSection.style.display = 'none';
        }

        // Thêm event listeners nếu các element tồn tại
        if (flashcard) {
            flashcard.addEventListener('click', flipCard);
        }
        if (prevBtn) {
            prevBtn.addEventListener('click', showPreviousWord);
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', showNextWord);
        }
        if (audioBtn) {
            audioBtn.addEventListener('click', playAudio);
        }
        if (imageBtn) {
            imageBtn.addEventListener('click', showImage);
        }
        if (markLearnedBtn) {
            markLearnedBtn.addEventListener('click', toggleLearned);
        }
    } catch (error) {
        console.error('Lỗi khi khởi tạo:', error);
        if (topicGrid) {
            topicGrid.innerHTML = `
                <div class="error-message">
                    <div style="font-size: 2em; margin-bottom: 10px;">⚠️</div>
                    <div>Có lỗi xảy ra khi tải dữ liệu</div>
                    <div style="margin-top: 10px; color: #666;">Vui lòng thử lại sau</div>
                </div>
            `;
        }
    }
}

// Tạo topic card
function createTopicCard(collection) {
    const card = document.createElement('div');
    card.className = 'topic-card';
    card.innerHTML = `
        <div class="topic-icon">
            <i class="fas fa-book"></i>
        </div>
        <h3>${collection.name}</h3>
        <div class="topic-info">
            <span>${collection.wordCount || 0} từ</span>
            <span class="level-badge">${collection.level || 'A1'}</span>
        </div>
        <button class="save-collection-btn" onclick="event.stopPropagation(); saveCollection(${collection.collectionId})">
            <i class="fas fa-bookmark"></i> Lưu bộ sưu tập
        </button>
    `;
    card.addEventListener('click', () => startCollection(collection));
    return card;
}

// Bắt đầu học một bộ sưu tập
async function startCollection(collection) {
    try {
        currentCollection = collection;
        currentWordIndex = 0;
        learnedWords.clear();
        updateProgress();
        
        // Hiển thị flashcard section
        if (topicGrid) {
            topicGrid.style.display = 'none';
        }
        if (flashcardSection) {
            flashcardSection.style.display = 'block';
        }
        
        // Lấy danh sách từ trong bộ sưu tập
        currentWords = await window.collectionsAPI.getWordsInCollection(collection.collectionId);
        if (!currentWords || currentWords.length === 0) {
            alert('Bộ sưu tập này chưa có từ nào');
            return;
        }
        
        // Hiển thị từ đầu tiên
        showCurrentWord(currentWords[0]);
    } catch (error) {
        console.error('Lỗi khi bắt đầu học:', error);
        alert('Có lỗi xảy ra khi tải dữ liệu từ vựng');
    }
}

// Hiển thị từ hiện tại
async function showCurrentWord(word) {
    try {
        currentWord = word; // Lưu từ hiện tại
        // Lấy thông tin flashcard của từ
        const flashcardData = await window.wordAPI.getFlashcard(word.wordId);
        console.log('Flashcard data:', flashcardData); // Debug log
        
        // Cập nhật số thứ tự
        if (currentNumberElement) {
            currentNumberElement.textContent = currentWordIndex + 1;
        }
        if (totalNumberElement) {
            totalNumberElement.textContent = currentWords.length;
        }
        
        // Cập nhật mặt trước của thẻ
        if (wordElement) {
            wordElement.textContent = flashcardData.sourceWord.word_name;
        }
        if (phoneticElement) {
            phoneticElement.textContent = flashcardData.sourceWord.pronunciation;
        }
        if (wordTypeElement) {
            wordTypeElement.textContent = flashcardData.sourceDefinition?.definition || '';
        }
        if (meaningEnElement) {
            meaningEnElement.textContent = flashcardData.sourceDefinition?.meaning || '';
        }
        if (definitionElement) {
            definitionElement.textContent = flashcardData.sourceDefinition?.definition || '';
        }
        if (exampleElement) {
            exampleElement.textContent = flashcardData.sourceDefinition?.example || '';
        }
        
        // Cập nhật mặt sau của thẻ
        if (meaningElement) {
            meaningElement.textContent = flashcardData.targetWord.word_name;
        }
        if (meaningViElement) {
            meaningViElement.textContent = flashcardData.targetDefinition?.meaning || '';
        }
        if (definitionViElement) {
            definitionViElement.textContent = flashcardData.targetDefinition?.definition || '';
        }
        if (exampleViElement) {
            exampleViElement.textContent = flashcardData.targetDefinition?.example || '';
        }
        
        // Reset thẻ về mặt trước
        if (flashcard) {
            flashcard.classList.remove('flipped');
        }
        
        // Cập nhật nút điều hướng
        if (prevBtn) {
            prevBtn.disabled = currentWordIndex === 0;
        }
        if (nextBtn) {
            nextBtn.disabled = currentWordIndex === currentWords.length - 1;
        }
        
        // Cập nhật trạng thái đã học
        updateLearnedStatus();
    } catch (error) {
        console.error('Lỗi khi hiển thị từ:', error);
        alert('Có lỗi xảy ra khi tải thông tin từ vựng');
    }
}

// Lật thẻ
function flipCard() {
    if (flashcard) {
        flashcard.classList.toggle('flipped');
    }
}

// Hiển thị từ trước
function showPreviousWord() {
    if (currentWordIndex > 0) {
        currentWordIndex--;
        showCurrentWord(currentWords[currentWordIndex]);
    }
}

// Hiển thị từ tiếp theo
function showNextWord() {
    if (currentWordIndex < currentWords.length - 1) {
        currentWordIndex++;
        showCurrentWord(currentWords[currentWordIndex]);
    }
}

// Phát âm
function playAudio() {
    const currentWord = currentWords[currentWordIndex];
    if (currentWord && currentWord.sound) {
        const audio = new Audio(`${window.APP_CONFIG.BASE_PATH}Assets/Sounds/${currentWord.sound}`);
        audio.play().catch(error => {
            console.error('Lỗi khi phát âm:', error);
        });
    }
}

// Hiển thị hình ảnh
function showImage() {
    // Implement image display logic
    alert('Tính năng đang được phát triển');
}

// Đánh dấu đã học
function toggleLearned() {
    const currentWord = currentWords[currentWordIndex];
    if (currentWord) {
        if (learnedWords.has(currentWord.wordId)) {
            learnedWords.delete(currentWord.wordId);
        } else {
            learnedWords.add(currentWord.wordId);
        }
        updateLearnedStatus();
        updateProgress();
    }
}

// Cập nhật trạng thái đã học
function updateLearnedStatus() {
    const currentWord = currentWords[currentWordIndex];
    if (markLearnedBtn && currentWord) {
        const isLearned = learnedWords.has(currentWord.wordId);
        markLearnedBtn.innerHTML = `
            <i class="fas ${isLearned ? 'fa-check-circle' : 'fa-circle'}"></i>
            ${isLearned ? 'Đã học' : 'Đánh dấu đã học'}
        `;
    }
}

// Cập nhật tiến độ
function updateProgress() {
    if (progressFill && progressText && currentWords) {
        const totalWords = currentWords.length;
        const learnedCount = learnedWords.size;
        const progress = (learnedCount / totalWords) * 100;
        
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${learnedCount}/${totalWords} từ đã học`;
    }
}

// Lưu bộ sưu tập
async function saveCollection(collectionId) {
    try {
        await window.collectionsAPI.addUserToCollection(collectionId);
        alert('Đã lưu bộ sưu tập vào danh sách học của bạn');
    } catch (error) {
        console.error('Lỗi khi lưu bộ sưu tập:', error);
        alert(error.message || 'Có lỗi xảy ra khi lưu bộ sưu tập');
    }
}

// Quay lại danh sách bộ sưu tập
function backToCollections() {
    if (topicGrid) {
        topicGrid.style.display = 'grid';
    }
    if (flashcardSection) {
        flashcardSection.style.display = 'none';
    }
    currentCollection = null;
    currentWordIndex = 0;
    learnedWords.clear();
}

// Hiển thị modal chọn bộ sưu tập
async function showCollectionModal() {
    try {
        // Lấy danh sách bộ sưu tập cá nhân
        const collections = await window.collectionsAPI.getUserCollections();
        
        // Xóa danh sách cũ
        collectionList.innerHTML = '';
        
        // Thêm các bộ sưu tập vào danh sách
        collections.forEach(collection => {
            const item = document.createElement('div');
            item.className = 'collection-item';
            item.innerHTML = `
                <div class="collection-info">
                    <div class="collection-name">${collection.name}</div>
                    <div class="word-count">${collection.wordCount || 0} từ</div>
                </div>
            `;
            item.addEventListener('click', () => saveWordToCollection(collection.collectionId));
            collectionList.appendChild(item);
        });
        
        // Hiển thị modal
        collectionModal.style.display = 'block';
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bộ sưu tập:', error);
        alert('Có lỗi xảy ra khi tải danh sách bộ sưu tập');
    }
}

// Đóng modal
function closeCollectionModal() {
    collectionModal.style.display = 'none';
}

// Lưu từ vào bộ sưu tập
async function saveWordToCollection(collectionId) {
    try {
        if (!currentWord) {
            throw new Error('Không tìm thấy từ hiện tại');
        }

        await window.collectionsAPI.addWordToCollection(collectionId, currentWord.wordId);
        alert('Đã lưu từ vào bộ sưu tập');
        closeCollectionModal();
    } catch (error) {
        console.error('Lỗi khi lưu từ:', error);
        alert(error.message || 'Có lỗi xảy ra khi lưu từ vào bộ sưu tập');
    }
}

// Khởi tạo khi DOM đã load
document.addEventListener('DOMContentLoaded', init);
