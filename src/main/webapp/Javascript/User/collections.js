// Khởi tạo biến lưu trữ dữ liệu
let collectionsData = [];
let currentCollectionId = null;

// Load dữ liệu khi trang được tải
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Lấy thông tin user
        if (typeof window.fetchUserInfo === 'function') {
            const user = await window.fetchUserInfo();
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
    const audio = new Audio(`${window.APP_CONFIG.BASE_PATH}Assets/Sounds/${soundFile}`);
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
        alert('Vui lòng nhập tên bộ sưu tập');
        return;
    }

    try {
        const collectionId = await createCollection(name);
        if (collectionId) {
            alert('Tạo bộ sưu tập thành công!');
            closePopup();
            // Tải lại danh sách bộ sưu tập
            collectionsData = await getUserCollections();
            renderCollectionsList(collectionsData);
        }
    } catch (error) {
        console.error('Lỗi khi tạo bộ sưu tập:', error);
        alert('Có lỗi xảy ra khi tạo bộ sưu tập');
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
        alert('Vui lòng nhập tên bộ sưu tập');
        return;
    }

    if (name.length < 3) {
        alert('Tên bộ sưu tập phải có ít nhất 3 ký tự');
        return;
    }

    if (name.length > 50) {
        alert('Tên bộ sưu tập không được vượt quá 50 ký tự');
        return;
    }

    try {
        // Gọi API từ collectionsAPI.js
        const success = await updateCollection(collectionId, name);
        if (success) {
            alert('Cập nhật bộ sưu tập thành công!');
            closePopup();
            // Tải lại danh sách bộ sưu tập
            collectionsData = await getUserCollections();
            renderCollectionsList(collectionsData);
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật bộ sưu tập:', error);
        alert(error.message || 'Có lỗi xảy ra khi cập nhật bộ sưu tập');
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
        alert('Không thể chỉnh sửa bộ sưu tập công khai');
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
            alert('Xóa bộ sưu tập thành công!');
            closePopup();
            // Tải lại danh sách bộ sưu tập
            collectionsData = await getUserCollections();
            renderCollectionsList(collectionsData);
        }
    } catch (error) {
        console.error('Lỗi khi xóa bộ sưu tập:', error);
        alert(error.message || 'Có lỗi xảy ra khi xóa bộ sưu tập');
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
            alert('Xóa từ khỏi bộ sưu tập thành công!');
            // Tải lại danh sách từ trong bộ sưu tập
            showCollectionWords(collectionId);
        }
    } catch (error) {
        console.error('Lỗi khi xóa từ:', error);
        alert(error.message || 'Có lỗi xảy ra khi xóa từ khỏi bộ sưu tập');
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

// Dữ liệu mẫu (bạn sẽ thay bằng API thực tế)
const vocabData = [
  {
    word: 'apple',
    phonetic: '/ˈæp.əl/',
    type: 'noun',
    meaning: 'quả táo',
    level: 'A1',
    course: 'Bài 1',
    example: 'I eat an apple every day.'
  },
  {
    word: 'run',
    phonetic: '/rʌn/',
    type: 'verb',
    meaning: 'chạy',
    level: 'A2',
    course: 'Bài 2',
    example: 'He can run very fast.'
  }
];
const readingData = [
  {
    title: 'The Great Adventure',
    level: 'A1',
    readCount: 2,
    lastRead: '3 ngày trước',
    note: '',
    wordCount: 150,
    suggest: 'Gợi ý học thêm 3 từ mới từ bài'
  },
  {
    title: 'At the Supermarket',
    level: 'A2',
    readCount: 1,
    lastRead: '1 tuần trước',
    note: 'Từ mới nhiều',
    wordCount: 120,
    suggest: 'Gợi ý học thêm 2 từ mới từ bài'
  }
];

// Dữ liệu mẫu cho topic
const topics = {
  food: {
    name: "🍽️ Đồ ăn & Đồ uống",
    vocab: [
      { word: "apple", type: "noun", meaning: "quả táo", level: "A1", example: "I eat an apple." }
      // ... thêm từ
    ],
    grammar: [
      { rule: "There is/There are", example: "There are apples on the table." }
      // ... thêm ngữ pháp
    ],
    reading: [
      { title: "A trip to the market", level: "A1", summary: "..." }
      // ... thêm bài đọc
    ],
    idioms: [
      { idiom: "A piece of cake", meaning: "dễ như ăn bánh" }
      // ... thêm thành ngữ
    ]
  },
  // ... các topic khác
};

// Gán tên user (demo, thực tế lấy từ API)
document.addEventListener('DOMContentLoaded', async function() {
  if (typeof window.fetchUserInfo === 'function') {
    const user = await window.fetchUserInfo();
    if (user && user.name) {
      document.getElementById('collections-username').textContent = '👤 ' + user.name;
    }
  }
  renderVocabList(vocabData);
  renderReadingList(readingData);
});

// Tabs
const tabVocab = document.getElementById('tab-vocab');
const tabReading = document.getElementById('tab-reading');
const vocabList = document.getElementById('vocab-list');
const readingList = document.getElementById('reading-list');

tabVocab.onclick = function() {
  tabVocab.classList.add('active');
  tabReading.classList.remove('active');
  vocabList.style.display = '';
  readingList.style.display = 'none';
};
tabReading.onclick = function() {
  tabReading.classList.add('active');
  tabVocab.classList.remove('active');
  vocabList.style.display = 'none';
  readingList.style.display = '';
};

// Filter
const searchInput = document.getElementById('searchInput');
const levelFilter = document.getElementById('levelFilter');
const typeFilter = document.getElementById('typeFilter');
const courseFilter = document.getElementById('courseFilter');

[searchInput, levelFilter, typeFilter, courseFilter].forEach(el => {
  el.addEventListener('input', filterVocab);
  el.addEventListener('change', filterVocab);
});

function filterVocab() {
  let filtered = vocabData.filter(item => {
    const keyword = searchInput.value.trim().toLowerCase();
    const level = levelFilter.value;
    const type = typeFilter.value;
    const course = courseFilter.value;
    return (
      (!keyword || item.word.toLowerCase().includes(keyword) || item.meaning.toLowerCase().includes(keyword)) &&
      (!level || item.level === level) &&
      (!type || item.type === type) &&
      (!course || item.course === course)
    );
  });
  renderVocabList(filtered);
}

// Render vocab cards
function renderVocabList(data) {
  vocabList.innerHTML = data.map(item => `
    <div class="vocab-card" onclick="showVocabPopup('${item.word}')">
      <div class="vocab-word">🍎 ${item.word} <span class="vocab-phonetic">${item.phonetic}</span></div>
      <div class="vocab-meta">🧠 ${item.type} | 🇻🇳 ${item.meaning} | 📘 ${item.level} – ${item.course}</div>
      <div class="vocab-example">📖 Ví dụ: "${item.example}"</div>
      <div style="color:#4285f4;font-size:0.95rem;">▶ Nhấn để xem thêm</div>
    </div>
  `).join('');
}

// Render reading cards
function renderReadingList(data) {
  readingList.innerHTML = data.map(item => `
    <div class="reading-card" onclick="showReadingPopup('${item.title}')">
      <div class="reading-title">📚 ${item.title}</div>
      <div class="reading-meta">📖 Cấp độ: ${item.level} | 🧠 Đã đọc: ${item.readCount} lần | 🕒 Lần cuối: ${item.lastRead}</div>
      <div class="reading-note">${item.note ? '📌 ' + item.note : ''} ${item.wordCount ? '🧠 Số từ: ' + item.wordCount : ''}</div>
      <div style="color:#f44336;font-size:0.95rem;">▶ Nhấn để đọc lại hoặc lưu</div>
    </div>
  `).join('');
}

// Popup vocab
window.showVocabPopup = function(word) {
  const item = vocabData.find(v => v.word === word);
  if (!item) return;
  document.getElementById('popup').innerHTML = `
    <div class="popup-content">
      <span class="popup-close" onclick="closePopup()">&times;</span>
      <h3>🍎 ${item.word} <span class="vocab-phonetic">${item.phonetic}</span></h3>
      <div> <b>${item.type}</b> | 🇻🇳 <b>${item.meaning}</b></div>
      <div>📘 <b>${item.level}</b> – <b>${item.course}</b></div>
      <div>📖 <b>Ví dụ:</b> <i>${item.example}</i></div>
      <textarea placeholder="Thêm ghi chú cá nhân..." style="width:100%;margin:12px 0;"></textarea>
      <div style="margin-top:12px;display:flex;gap:12px;">
        <button class="btn" onclick="alert('Đã lưu ghi chú!')">Lưu ghi chú</button>
        <button class="btn" onclick="alert('Đã xóa khỏi bộ sưu tập!')">Xóa khỏi bộ sưu tập</button>
      </div>
    </div>
  `;
  document.getElementById('popup').style.display = 'flex';
}

// Popup reading
window.showReadingPopup = function(title) {
  const item = readingData.find(r => r.title === title);
  if (!item) return;
  document.getElementById('popup').innerHTML = `
    <div class="popup-content">
      <span class="popup-close" onclick="closePopup()">&times;</span>
      <h3>📚 ${item.title}</h3>
      <div>📖 <b>Cấp độ:</b> ${item.level}</div>
      <div>🧠 <b>Đã đọc:</b> ${item.readCount} lần</div>
      <div>🕒 <b>Lần cuối:</b> ${item.lastRead}</div>
      <div>🧠 <b>Số từ:</b> ${item.wordCount}</div>
      <div>📌 <b>Ghi chú:</b> ${item.note || 'Chưa có'}</div>
      <div>📈 <b>${item.suggest || ''}</b></div>
      <textarea placeholder="Lưu ghi chú..." style="width:100%;margin:12px 0;"></textarea>
      <div style="margin-top:12px;display:flex;gap:12px;">
        <button class="btn" onclick="alert('Đã lưu ghi chú!')">Lưu ghi chú</button>
        <button class="btn" onclick="alert('Đã xóa khỏi bộ sưu tập!')">Xóa khỏi bộ sưu tập</button>
      </div>
    </div>
  `;
  document.getElementById('popup').style.display = 'flex';
}

window.closePopup = function() {
  document.getElementById('popup').style.display = 'none';
}

// Xử lý click vào topic
document.querySelectorAll('.topic-card').forEach(card => {
  card.onclick = function() {
    const topicKey = this.getAttribute('data-topic');
    showTopicDetail(topicKey);
  };
});

function showTopicDetail(topicKey) {
  const topic = topics[topicKey];
  if (!topic) return;
  let html = `
    <div class="topic-detail-header">
      <h2>${topic.name}</h2>
      <div class="topic-detail-tabs">
        <button class="tab-btn active" onclick="showTopicTab('${topicKey}','vocab')">📘 Từ vựng</button>
        <button class="tab-btn" onclick="showTopicTab('${topicKey}','grammar')">📙 Ngữ pháp</button>
        <button class="tab-btn" onclick="showTopicTab('${topicKey}','reading')">📕 Bài đọc</button>
        <button class="tab-btn" onclick="showTopicTab('${topicKey}','idioms')">📝 Thành ngữ</button>
      </div>
    </div>
    <div id="topic-tab-content"></div>
    <button class="btn" onclick="closeTopicDetail()">⬅ Quay lại chủ đề</button>
  `;
  document.getElementById('topic-detail').innerHTML = html;
  document.getElementById('topic-detail').style.display = '';
  document.querySelector('.collections-topics').style.display = 'none';
  showTopicTab(topicKey, 'vocab');
}

window.showTopicTab = function(topicKey, tab) {
  const topic = topics[topicKey];
  let html = '';
  if (tab === 'vocab') {
    html = topic.vocab.map(item => `
      <div class="vocab-card">
        <div class="vocab-word">🍎 ${item.word}</div>
        <div class="vocab-meta">🧠 ${item.type} | 🇻🇳 ${item.meaning} | 📘 ${item.level}</div>
        <div class="vocab-example">📖 Ví dụ: "${item.example}"</div>
      </div>
    `).join('');
  } else if (tab === 'grammar') {
    html = topic.grammar.map(item => `
      <div class="vocab-card" style="background:#fffbe6;">
        <div class="vocab-word">📙 ${item.rule}</div>
        <div class="vocab-example">📖 Ví dụ: "${item.example}"</div>
      </div>
    `).join('');
  } else if (tab === 'reading') {
    html = topic.reading.map(item => `
      <div class="reading-card">
        <div class="reading-title">📕 ${item.title}</div>
        <div class="reading-meta">Cấp độ: ${item.level}</div>
        <div class="reading-note">${item.summary || ''}</div>
      </div>
    `).join('');
  } else if (tab === 'idioms') {
    html = topic.idioms.map(item => `
      <div class="vocab-card" style="background:#e6fff7;">
        <div class="vocab-word">📝 ${item.idiom}</div>
        <div class="vocab-meta">Ý nghĩa: ${item.meaning}</div>
      </div>
    `).join('');
  }
  document.getElementById('topic-tab-content').innerHTML = html || '<div style="color:#888;">Chưa có dữ liệu</div>';
  // Đổi active tab
  document.querySelectorAll('.topic-detail-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.topic-detail-tabs .tab-btn')[['vocab','grammar','reading','idioms'].indexOf(tab)].classList.add('active');
};

window.closeTopicDetail = function() {
  document.getElementById('topic-detail').style.display = 'none';
  document.querySelector('.collections-topics').style.display = '';
};
