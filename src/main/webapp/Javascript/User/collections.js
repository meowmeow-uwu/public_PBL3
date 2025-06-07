// Khởi tạo biến lưu trữ dữ liệu
let collectionsData = [];
let currentCollectionId = null;

// Load dữ liệu khi trang được tải
document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Lấy thông tin user
        if (typeof window.USER_API.fetchUserInfo === 'function') {
            const user = await window.USER_API.fetchUserInfo();
            if (user && user.name) {
                document.getElementById('collections-username').textContent = '👤 ' + user.name;
            }
        }

        // Lấy danh sách bộ sưu tập
        collectionsData = await getUserCollections();
        console.log('Danh sách bộ sưu tập:', collectionsData); // Debug log
        if (collectionsData && collectionsData.length > 0) {
            renderCollectionsList(collectionsData);
        } else {
            document.getElementById('collections-list').innerHTML = 
                '<div class="empty-message">Bạn chưa có bộ sưu tập nào. Hãy tạo bộ sưu tập mới!</div>';
        }
        
        // Thêm sự kiện cho nút tạo bộ sưu tập mới
        const createBtn = document.getElementById('create-collection-btn');
        if (createBtn) {
            createBtn.addEventListener('click', showCreateCollectionPopup);
        }
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        document.getElementById('collections-list').innerHTML = 
            '<div class="error-message">Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.</div>';
    }
});

// Render danh sách bộ sưu tập
function renderCollectionsList(collections) {
    const collectionsList = document.getElementById('collections-list');
    if (!collectionsList) return;

    console.log('Collections data:', collections);

    if (!collections || collections.length === 0) {
        collectionsList.innerHTML = `
            <div class="empty-message">
                <div style="font-size: 2em; margin-bottom: 10px;">📚</div>
                <div>Bạn chưa có bộ sưu tập nào</div>
                <div style="margin-top: 10px; color: #666;">Hãy tạo bộ sưu tập mới để bắt đầu học từ vựng!</div>
            </div>
        `;
        return;
    }

    collectionsList.innerHTML = collections.map(collection => {
        const collectionId = collection.collectionId;
        console.log('Processing collection:', collection);

        if (!collectionId) {
            console.error('Không tìm thấy ID bộ sưu tập trong dữ liệu:', collection);
            return '';
        }

        return `
            <div class="collection-card" data-collection-id="${collectionId}" onclick="showCollectionWords('${collectionId}')">
                <div class="collection-header">
                    <h3>📚 ${collection.name}</h3>
                    <div class="collection-actions">
                        <button type="button" class="btn-icon" onclick="event.stopPropagation(); handleEditClick('${collectionId}')">✏️</button>
                        <button type="button" class="btn-icon" onclick="event.stopPropagation(); showDeleteCollectionPopup('${collectionId}')">🗑️</button>
                    </div>
                </div>
                <div class="collection-stats">
                    <span>📝 ${collection.wordCount || 0} từ</span>
                    <span>${collection.isPublic ? '🌐 Công khai' : '🔒 Riêng tư'}</span>
                    <span>🕒 Cập nhật: ${formatDate(collection.updatedAt)}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Xử lý sự kiện click nút sửa
function handleEditClick(collectionId) {
    console.log('handleEditClick called with ID:', collectionId);
    editCollection(parseInt(collectionId));
}

// Load từ vựng trong bộ sưu tập
async function loadCollectionWords(collectionId) {
    if (!collectionId) {
        console.error('ID bộ sưu tập không hợp lệ');
        return;
    }

    const wordsContainer = document.getElementById(`words-${collectionId}`);
    if (!wordsContainer) return;

    try {
        const words = await getWordsInCollection(collectionId);
        
        if (!words || words.length === 0) {
            wordsContainer.innerHTML = `
                <div class="empty-message" style="padding: 20px; text-align: center;">
                    <div style="font-size: 2em; margin-bottom: 10px;">📝</div>
                    <div>Bộ sưu tập này chưa có từ nào</div>
                    <div style="margin-top: 10px; color: #666;">Hãy thêm từ vào để bắt đầu học!</div>
                </div>
            `;
            return;
        }

        wordsContainer.innerHTML = words.map(word => `
            <div class="word-item">
                <div class="word-info">
                    <span class="word-text">${word.word}</span>
                    <span class="word-pronunciation">${word.pronunciation}</span>
                </div>
                <div class="word-actions">
                    <button onclick="playWordSound('${word.sound}')" class="btn-icon">🔊</button>
                    <button onclick="removeWordFromCollection('${collectionId}', '${word.wordId}')" class="btn-icon">❌</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Lỗi khi tải từ vựng:', error);
        wordsContainer.innerHTML = `
            <div class="error-message" style="padding: 20px; text-align: center;">
                <div style="font-size: 2em; margin-bottom: 10px;">⚠️</div>
                <div>Có lỗi xảy ra khi tải từ vựng</div>
                <div style="margin-top: 10px; color: #666;">Vui lòng thử lại sau</div>
            </div>
        `;
    }
}

// Thêm hàm phát âm từ
function playWordSound(soundFile) {
    if (!soundFile) return;
    const audio = new Audio(`${soundFile}`);
    audio.play().catch(error => {
        console.error('Lỗi khi phát âm:', error);
    });
}

// Hiển thị popup tạo bộ sưu tập mới
function showCreateCollectionPopup() {
    const popup = document.getElementById('popup');
    if (!popup) return;

    popup.innerHTML = `
        <div class="popup-content">
            <span class="popup-close" onclick="closePopup()">&times;</span>
            <h3>📚 Tạo bộ sưu tập mới</h3>
            <input type="text" id="new-collection-name" placeholder="Nhập tên bộ sưu tập" class="input-field">
            <div class="popup-actions">
                <button class="btn" onclick="createNewCollection()">Tạo mới</button>
                <button class="btn" onclick="closePopup()">Hủy</button>
            </div>
        </div>
    `;
    popup.style.display = 'flex';
}

// Tạo bộ sưu tập mới
async function createNewCollection() {
    const nameInput = document.getElementById('new-collection-name');
    if (!nameInput) return;

    const name = nameInput.value.trim();
    if (!name) {
        showToast('warning', 'Cảnh báo', 'Vui lòng nhập tên bộ sưu tập') ;
        return;
    }

    try {
        const collectionId = await createCollection(name);
        if (collectionId) {
            showToast('success', 'Thành công!', 'Tạo bộ sưu tập thành công!') ;
            closePopup();
            // Tải lại danh sách bộ sưu tập
            collectionsData = await getUserCollections();
            renderCollectionsList(collectionsData);
        }
    } catch (error) {
        console.error('Lỗi khi tạo bộ sưu tập:', error);
        showToast('error', 'Lỗi', 'Có lỗi xảy ra khi tạo bộ sưu tập') ;
    }
}

// Cập nhật bộ sưu tập
async function handleUpdateCollection(collectionId) {
    if (!collectionId) {
        console.error('ID bộ sưu tập không hợp lệ');
        return;
    }

    const nameInput = document.getElementById('edit-collection-name');
    if (!nameInput) {
        console.error('Không tìm thấy trường input tên');
        return;
    }

    const name = nameInput.value.trim();

    if (!name) {
        showToast('warning', 'Cảnh báo', 'Vui lòng nhập tên bộ sưu tập') ;
        return;
    }

    if (name.length < 3) {
        showToast('warning', 'Cảnh báo', 'Tên bộ sưu tập phải có ít nhất 3 ký tự') ;
        return;
    }

    if (name.length > 50) {
        showToast('warning', 'Cảnh báo', 'Tên bộ sưu tập không được vượt quá 50 ký tự') ;
        return;
    }

    try {
        // Gọi API từ collectionsAPI.js
        const success = await updateCollection(collectionId, name);
        if (success) {
            showToast('success', 'Thành công!', 'Cập nhật bộ sưu tập thành công!') ;
            closePopup();
            // Tải lại danh sách bộ sưu tập
            collectionsData = await getUserCollections();
            renderCollectionsList(collectionsData);
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật bộ sưu tập:', error);
        showToast('error', 'Lỗi', error.message || 'Có lỗi xảy ra khi cập nhật bộ sưu tập') ;
    }
}

// Chỉnh sửa bộ sưu tập
async function editCollection(collectionId) {
    console.log('editCollection called with ID:', collectionId);
    
    if (!collectionId) {
        console.error('ID bộ sưu tập không hợp lệ');
        return;
    }

    // Tìm collection trong mảng collectionsData
    const collection = collectionsData.find(c => c.collectionId === collectionId);

    if (!collection) {
        console.error('Không tìm thấy bộ sưu tập với ID:', collectionId);
        return;
    }

    // Kiểm tra nếu là bộ sưu tập công khai
    if (collection.isPublic) {
        showToast('warning', 'Cảnh báo', 'Không thể chỉnh sửa bộ sưu tập công khai') ;
        return;
    }

    const popup = document.getElementById('popup');
    if (!popup) {
        console.error('Không tìm thấy element popup');
        return;
    }

    popup.innerHTML = `
        <div class="popup-content">
            <span class="popup-close" onclick="closePopup()">&times;</span>
            <h3>✏️ Chỉnh sửa bộ sưu tập</h3>
            <div class="edit-form">
                <div class="form-group">
                    <label for="edit-collection-name">Tên bộ sưu tập:</label>
                    <input type="text" 
                           id="edit-collection-name" 
                           value="${collection.name}" 
                           class="input-field"
                           required
                           minlength="3"
                           maxlength="50"
                           placeholder="Nhập tên bộ sưu tập">
                </div>
                <div class="popup-actions">
                    <button type="button" class="btn" onclick="handleUpdateCollection('${collectionId}')">Lưu thay đổi</button>
                    <button type="button" class="btn btn-secondary" onclick="closePopup()">Hủy</button>
                </div>
            </div>
        </div>
    `;
    popup.style.display = 'flex';
}

// Xóa bộ sưu tập
async function showDeleteCollectionPopup(collectionId) {
    console.log('showDeleteCollectionPopup called with ID:', collectionId); // Debug log
    
    if (!collectionId) {
        console.error('ID bộ sưu tập không hợp lệ');
        return;
    }

    const popup = document.getElementById('popup');
    if (!popup) return;

    popup.innerHTML = `
        <div class="popup-content">
            <span class="popup-close" onclick="closePopup()">&times;</span>
            <h3>🗑️ Xóa bộ sưu tập</h3>
            <div class="delete-confirmation">
                <p>Bạn có chắc chắn muốn xóa bộ sưu tập này?</p>
                <p class="warning-text">⚠️ Hành động này không thể hoàn tác!</p>
            </div>
            <div class="popup-actions">
                <button class="btn btn-danger" onclick="confirmDeleteCollection('${collectionId}')">Xóa</button>
                <button class="btn btn-secondary" onclick="closePopup()">Hủy</button>
            </div>
        </div>
    `;
    popup.style.display = 'flex';
}

// Xác nhận xóa bộ sưu tập
async function confirmDeleteCollection(collectionId) {
    if (!collectionId) {
        console.error('ID bộ sưu tập không hợp lệ');
        return;
    }

    try {
        console.log('Đang xóa bộ sưu tập với ID:', collectionId); // Debug log
        const success = await deleteCollection(collectionId);
        if (success) {
            showToast('success', 'Thành công!', 'Xóa bộ sưu tập thành công!') ;
            closePopup();
            // Tải lại danh sách bộ sưu tập
            collectionsData = await getUserCollections();
            renderCollectionsList(collectionsData);
        }
    } catch (error) {
        console.error('Lỗi khi xóa bộ sưu tập:', error);
        showToast('error', 'Lỗi', error.message || 'Có lỗi xảy ra khi xóa bộ sưu tập') ;
    }
}

// Xóa từ khỏi bộ sưu tập
async function removeWordFromCollection(collectionId, wordId) {
    if (!collectionId || !wordId) {
        console.error('ID bộ sưu tập hoặc từ không hợp lệ');
        return;
    }

    try {
        const success = await deleteWordFromCollection(collectionId, wordId);
        if (success) {
            showToast('success', 'Thành công!','Xóa từ khỏi bộ sưu tập thành công!');
            // Tải lại danh sách từ trong bộ sưu tập
            showCollectionWords(collectionId);
        }
    } catch (error) {
        console.error('Lỗi khi xóa từ:', error);
        showToast('error', 'Lỗi', error.message || 'Có lỗi xảy ra khi xóa từ khỏi bộ sưu tập');
    }
}

// Hiển thị danh sách từ trong bộ sưu tập
async function showCollectionWords(collectionId) {
    const popup = document.getElementById('popup');
    if (!popup) return;

    popup.innerHTML = `
        <div class="popup-content">
            <span class="popup-close" onclick="closePopup()">&times;</span>
            <div class="words-list-container">
                <h3>Danh sách từ vựng</h3>
                <div class="popup-actions" style="margin-bottom: 20px;">
                    <button class="btn" onclick="startFlashcards('${collectionId}')">
                        <i class="fas fa-graduation-cap"></i> Ôn tập
                    </button>
                </div>
                <div id="words-list" class="words-list">
                    <div class="loading">Đang tải...</div>
                </div>
            </div>
        </div>
    `;
    popup.style.display = 'flex';

    try {
        const words = await getWordsInCollection(collectionId);
        const wordsList = document.getElementById('words-list');
        
        if (!words || words.length === 0) {
            wordsList.innerHTML = `
                <div class="empty-message">
                    <div style="font-size: 2em; margin-bottom: 10px;">📝</div>
                    <div>Bộ sưu tập này chưa có từ nào</div>
                    <div style="margin-top: 10px; color: #666;">Hãy thêm từ vào để bắt đầu học!</div>
                </div>
            `;
            return;
        }

        wordsList.innerHTML = words.map(word => `
            <div class="word-item">
                <div class="word-info">
                    <span class="word-text">${word.word}</span>
                    <span class="word-pronunciation">${word.pronunciation}</span>
                </div>
                <div class="word-actions">
                    <button onclick="playWordSound('${word.sound}')" class="btn-icon">🔊</button>
                    <button onclick="removeWordFromCollection('${collectionId}', '${word.wordId}')" class="btn-icon">❌</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Lỗi khi tải từ vựng:', error);
        document.getElementById('words-list').innerHTML = `
            <div class="error-message">
                <div style="font-size: 2em; margin-bottom: 10px;">⚠️</div>
                <div>Có lỗi xảy ra khi tải từ vựng</div>
                <div style="margin-top: 10px; color: #666;">Vui lòng thử lại sau</div>
            </div>
        `;
    }
}

// Thêm hàm để bắt đầu ôn tập flashcard
async function startFlashcards(collectionId) {
    try {
        console.log('Bắt đầu tải dữ liệu flashcard cho collection:', collectionId);
        
        // Lấy danh sách từ trong bộ sưu tập
        const words = await getWordsInCollection(collectionId);
        console.log('Danh sách từ trong bộ sưu tập:', words);
        
        if (!words || words.length === 0) {
           showToast('warning', 'Cảnh báo', 'Bộ sưu tập này chưa có từ nào để ôn tập!');
            return;
        }

        // Tải dữ liệu flashcard cho từng từ
        console.log('Bắt đầu tải flashcard data cho từng từ...');
        let currentIndex = 0;
        const flashcards = [];
        
        for (const word of words) {
            try {
                console.log(`Đang tải flashcard cho từ: ${word.word} (ID: ${word.wordId})`);
                const flashcardData = await window.wordAPI.getFlashcard(word.wordId);
                console.log('Flashcard data nhận được:', flashcardData);
                
                if (flashcardData) {
                    const sourceWord = flashcardData.sourceWord;
                    const targetWord = flashcardData.targetWord;
                    const sourceDefinition = flashcardData.sourceDefinition;
                    const targetDefinition = flashcardData.targetDefinition;

                    flashcards.push({
                        // Từ tiếng Anh
                        word: sourceWord.word_name,
                        pronunciation: sourceWord.pronunciation || '',
                        sound: sourceWord.sound || '',
                        type: sourceDefinition?.word_type || '',
                        definition_en: sourceDefinition?.definition || '',
                        example_en: sourceDefinition?.example || '',
                        // Nghĩa tiếng Việt
                        meaning: targetWord.word_name,
                        pronunciation_vi: targetWord.pronunciation || '',
                        sound_vi: targetWord.sound || '',
                        type_vi: targetDefinition?.word_type || '',
                        definition_vi: targetDefinition?.definition || '',
                        example_vi: targetDefinition?.example || '',
                        image: sourceWord.image || '',
                        image_vi: targetWord.image || '',
                    });
                }
            } catch (error) {
                console.error(`Lỗi khi tải flashcard cho từ ${word.word}:`, error);
            }
        }

        console.log('Số flashcard đã tải thành công:', flashcards.length);

        if (flashcards.length === 0) {
           showToast('error', 'Lỗi', 'Không thể tải dữ liệu flashcard. Vui lòng thử lại sau!')  ;
            return;
        }

        const popup = document.getElementById('popup');
        function renderFlashcard() {
            const card = flashcards[currentIndex];
            popup.innerHTML = `
                <div class="popup-content">
                    <div class="flashcard-header">
                        <button class="back-btn" onclick="closePopup()">
                            <i class="fas fa-arrow-left"></i> Quay lại
                        </button>
                        <div class="progress-info">
                            <span class="current-number">${currentIndex + 1}</span>/<span class="total-number">${flashcards.length}</span>
                        </div>
                    </div>
                    <div class="flashcard-container">
                        <div class="flashcard">
                            <div class="flashcard-inner">
                                <div class="flashcard-front">
                                    <h2 class="word" style="font-size:2.7rem;">${card.word}</h2>
                                    <div class="phonetic" style="font-size:1.3rem;">${card.pronunciation ? '/' + card.pronunciation + '/' : ''}</div>
                                    ${card.sound ? `
                                        <button class="sound-btn" onclick="event.stopPropagation(); playWordSound('${card.sound}')">
                                            <i class="fas fa-volume-up"></i> Nghe phát âm
                                        </button>
                                    ` : ''}
                                    ${card.image ? `<img src="${card.image}" alt="${card.word}" class="flashcard-image" style="max-width:220px;max-height:160px;margin:18px 0 12px 0;border-radius:14px;box-shadow:0 2px 12px #0001;">` : ''}
                                    <div class="word-type">${card.type}</div>
                                    <div class="definition">${card.definition_en}</div>
                                    <div class="example">${card.example_en}</div>
                                </div>
                                <div class="flashcard-back">
                                    <h2 class="meaning" style="font-size:2.3rem;">${card.meaning}</h2>
                                    <div class="phonetic-vi" style="font-size:1.2rem;">${card.pronunciation_vi ? '/' + card.pronunciation_vi + '/' : ''}</div>
                                    ${card.sound_vi ? `
                                        <button class="sound-btn" onclick="event.stopPropagation(); playWordSound('${card.sound_vi}')">
                                            <i class="fas fa-volume-up"></i> Nghe phát âm
                                        </button>
                                    ` : ''}
                                    ${card.image_vi ? `<img src="${card.image_vi}" alt="${card.word}" class="flashcard-image" style="max-width:220px;max-height:160px;margin:18px 0 12px 0;border-radius:14px;box-shadow:0 2px 12px #0001;">` : ''}
                                    <div class="word-type-vi">${card.type_vi}</div>
                                    <div class="definition-vi">${card.definition_vi}</div>
                                    <div class="example-vi">${card.example_vi}</div>
                                </div>
                            </div>
                        </div>
                        <div style="text-align:center;margin-top:16px;">
                            <button class="btn" id="flip-card-btn"><i class="fas fa-retweet"></i> Lật thẻ</button>
                        </div>
                    </div>
                    <div class="flashcard-nav">
                        <button class="nav-btn prev-btn" onclick="navigateFlashcard(-1)" ${currentIndex === 0 ? 'disabled' : ''}>
                            <i class="fas fa-chevron-left"></i> Thẻ trước
                        </button>
                        <button class="nav-btn next-btn" onclick="navigateFlashcard(1)" ${currentIndex === flashcards.length - 1 ? 'disabled' : ''}>
                            Thẻ tiếp theo <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            `;
            // Gán sự kiện lật thẻ giống vocabulary.js
            setTimeout(() => {
                const flashcard = popup.querySelector('.flashcard');
                const flipBtn = popup.querySelector('#flip-card-btn');
                if (flashcard) {
                    flashcard.onclick = function (e) {
                        if (e.target.closest('.btn') || e.target.closest('.sound-btn')) return;
                        flashcard.classList.toggle('flipped');
                    };
                }
                if (flipBtn && flashcard) {
                    flipBtn.onclick = function () {
                        flashcard.classList.toggle('flipped');
                    };
                }
            }, 0);
        }
        window.navigateFlashcard = function (direction) {
            currentIndex = Math.max(0, Math.min(flashcards.length - 1, currentIndex + direction));
            renderFlashcard();
        };

        console.log('Bắt đầu hiển thị flashcard...');
        renderFlashcard();
    } catch (error) {
        console.error('Lỗi khi bắt đầu ôn tập:', error);
        showToast('error', 'Lỗi', 'Có lỗi xảy ra khi tải dữ liệu ôn tập. Vui lòng thử lại sau!') ;
    }
}

// Đóng popup
function closePopup() {
    const popup = document.getElementById('popup');
    if (popup) {
        popup.style.display = 'none';
    }
}

// Format ngày tháng
function formatDate(dateString) {
    if (!dateString) return 'Chưa cập nhật';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Gán tên user (demo, thực tế lấy từ API)
document.addEventListener('DOMContentLoaded', async function () {
  if (typeof window.USER_API.fetchUserInfo === 'function') {
    const user = await window.USER_API.fetchUserInfo();
    if (user && user.name) {
      document.getElementById('collections-username').textContent = '👤 ' + user.name;
    }
  }
});

