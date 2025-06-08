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
        publicCollections = await window.collectionManagementAPI.getAllCollections(); 
        console.log('Danh sách bộ sưu tập công khai:', publicCollections);
        // Lấy danh sách bộ sưu tập công kha
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

        if (markLearnedBtn) {
            markLearnedBtn.addEventListener('click', toggleLearned);
        }

        // Thêm event listener cho nút tạo bộ sưu tập mới
        const createCollectionBtn = document.getElementById('createCollectionBtn');
        if (createCollectionBtn) {
            createCollectionBtn.addEventListener('click', createNewCollection);
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

// Tạo màu ngẫu nhiên
function getRandomColor() {
    const colors = [
        '#FF6B6B', // Đỏ hồng
        '#4ECDC4', // Xanh ngọc
        '#45B7D1', // Xanh dương
        '#96CEB4', // Xanh lá nhạt
        '#FFEEAD', // Vàng nhạt
        '#D4A5A5', // Hồng nhạt
        '#9B59B6', // Tím
        '#3498DB', // Xanh dương đậm
        '#E67E22', // Cam
        '#2ECC71'  // Xanh lá đậm
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Tạo thẻ chủ đề từ vựng
function createTopicCard(collection) {
    const card = document.createElement('div');
    card.className = 'topic-card';
    card.onclick = () => startCollection(collection);

    const randomColor = getRandomColor();

    card.innerHTML = `
        <div class="topic-icon" style="color: ${randomColor}">📚</div>
        <h3>${collection.name}</h3>
        <div class="topic-info">
            <span>${collection.wordCount || 0} từ</span>
        </div>
        <div class="topic-card-actions">
            <button class="save-collection-btn" onclick="event.stopPropagation(); saveCollection(${collection.collectionId})">
                <i class="fas fa-bookmark"></i> Lưu bộ sưu tập
            </button>
        </div>
    `;

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
            showToast('warning', 'Cảnh báo', 'Bộ sưu tập này chưa có từ nào');
            return;
        }

        // Hiển thị từ đầu tiên
        showCurrentWord(currentWords[0]);
    } catch (error) {
        console.error('Lỗi khi bắt đầu học:', error);
        showToast('error', 'Lỗi', 'Có lỗi xảy ra khi tải dữ liệu từ vựng');
    }
}

// Hiển thị từ hiện tại
async function showCurrentWord(word) {
    try {
        currentWord = word; // Lưu từ hiện tại
        // Lấy thông tin flashcard của từ
        const flashcardData = await window.wordAPI.getFlashcard(word.wordId);
        console.log('Flashcard data:', flashcardData); // Debug log

        // Hiển thị ảnh nếu có
        const imageUrl = flashcardData.sourceWord?.image || '';
        const imageHtml = imageUrl ? `<img src="${imageUrl}" alt="${flashcardData.sourceWord?.word_name || ''}" class="flashcard-image">` : '';

        const imageViUrl = flashcardData.targetWord?.image || '';
        const imageViHtml = imageViUrl ? `<img src="${imageViUrl}" alt="${flashcardData.targetWord?.word_name || ''}" class="flashcard-image">` : '';

// Cập nhật số thứ tự
        if (currentNumberElement) {
            currentNumberElement.textContent = currentWordIndex + 1;
        }
        if (totalNumberElement) {
            totalNumberElement.textContent = currentWords.length;
        }

// Cập nhật mặt trước của thẻ
        if (wordElement) {
            wordElement.textContent = flashcardData.sourceWord?.word_name || '';
        }
// Hiển thị ảnh mặt trước
        const imageElement = document.querySelector('.image');
        if (imageElement) {
            imageElement.innerHTML = imageHtml;
        }
        if (phoneticElement) {
            phoneticElement.textContent = flashcardData.sourceWord?.pronunciation || '';
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
            meaningElement.textContent = flashcardData.targetWord?.word_name || '';
        }
// Hiển thị ảnh mặt sau
        const imageViElement = document.querySelector('.image-vi');
        if (imageViElement) {
            imageViElement.innerHTML = imageViHtml;
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
        showToast('error', 'Lỗi', 'Có lỗi xảy ra khi tải thông tin từ vựng');
        showPreviousWord();
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
        const audio = new Audio(`${currentWord.sound}`);
        audio.play().catch(error => {
            console.error('Lỗi khi phát âm:', error);
        });
    }
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
        showToast('success', 'Thành công!', 'Đã lưu bộ sưu tập vào danh sách học của bạn');
    } catch (error) {
        console.error('Lỗi khi lưu bộ sưu tập:', error);
        showToast('error', 'Lỗi', error.message || 'Có lỗi xảy ra khi lưu bộ sưu tập');
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
        console.log('Danh sách bộ sưu tập:', collections);

        // Xóa danh sách cũ
        collectionList.innerHTML = '';

        if (!collections || collections.length === 0) {
            collectionList.innerHTML = '<div class="collection-item">Bạn chưa có bộ sưu tập nào</div>';
            return;
        }

        // Thêm các bộ sưu tập vào danh sách
        collections.forEach(collection => {
            const item = document.createElement('div');
            item.className = 'collection-item';
            item.innerHTML = `
                <div class="collection-info">
                    <div class="collection-name">${collection.name}</div>
                    <div class="word-count">${collection.wordCount || 0} từ</div>
                </div>
                <button class="save-btn" onclick="event.stopPropagation(); saveWordToCollection(${collection.collectionId})">
                    <i class="fas fa-plus"></i>
                </button>
            `;
            collectionList.appendChild(item);
        });

        // Hiển thị modal
        collectionModal.classList.add('active');
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bộ sưu tập:', error);
        showToast('error', 'Lỗi', 'Có lỗi xảy ra khi tải danh sách bộ sưu tập');
    }
}

// Đóng modal
function closeCollectionModal() {
    collectionModal.classList.remove('active');
}

// Lưu từ vào bộ sưu tập
async function saveWordToCollection(collectionId) {
    try {
        if (!currentWord) {
            throw new Error('Không tìm thấy từ hiện tại');
        }

        console.log('Lưu từ:', currentWord.wordId, 'vào bộ sưu tập:', collectionId);
        await window.collectionsAPI.addWordToCollection(collectionId, currentWord.wordId);
        showToast('success', 'Thành công!', 'Đã lưu từ vào bộ sưu tập');
        closeCollectionModal();
    } catch (error) {
        console.error('Lỗi khi lưu từ:', error);
        showToast('error', 'Lỗi', error.message || 'Có lỗi xảy ra khi lưu từ vào bộ sưu tập');
    }
}

// Tạo bộ sưu tập mới
async function createNewCollection() {
    try {
        const collectionName = prompt('Nhập tên bộ sưu tập mới:');
        if (!collectionName) return;

        const collectionId = await window.collectionsAPI.createCollection(collectionName);
        if (collectionId) {
            // Tải lại danh sách bộ sưu tập
            await showCollectionModal();
            
            // Tự động lưu từ vào bộ sưu tập mới
            await saveWordToCollection(collectionId);
            
            showToast('success', 'Thành công!', 'Đã tạo bộ sưu tập mới và lưu từ thành công!');
        }
    } catch (error) {
        console.error('Lỗi khi tạo bộ sưu tập:', error);
        showToast('error', 'Lỗi', 'Có lỗi xảy ra khi tạo bộ sưu tập mới');
    }
}

// Khởi tạo khi DOM đã load
document.addEventListener('DOMContentLoaded', init);
