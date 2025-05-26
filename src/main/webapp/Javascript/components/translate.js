const API_Translate_BASE = window.APP_CONFIG.API_BASE_URL + "/translate";
const API_Word_BASE = window.APP_CONFIG.API_BASE_URL + "/word";

// DOM Elements
const searchInput = document.getElementById('searchInput');
const suggestionsBox = document.getElementById('suggestions');
const resultBox = document.getElementById('result');
const searchBtn = document.getElementById('searchBtn');
const fromLang = document.getElementById('fromLang');
const toLang = document.getElementById('toLang');
const swapLang = document.getElementById('swapLang');

// Biến lưu group_user_id của user
let groupUserId = null;

// Lấy thông tin user khi trang được load
async function loadUserInfo() {
    try {
        const userInfo = await fetchUserInfo();
        if (userInfo) {
            groupUserId = userInfo.group_user_id;
        }
    } catch (error) {
        console.error('Lỗi khi lấy thông tin user:', error);
    }
}

// Gọi hàm load user info khi trang được load
loadUserInfo();

// Đổi chiều dịch
swapLang.addEventListener('click', function() {
    // Hoán đổi text
    const fromText = fromLang.textContent;
    fromLang.textContent = toLang.textContent;
    toLang.textContent = fromText;
    // Hoán đổi data-value
    const fromValue = fromLang.dataset.value;
    fromLang.dataset.value = toLang.dataset.value;
    toLang.dataset.value = fromValue;
});

let debounceTimer;
searchInput.addEventListener('input', function() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
        const keyword = this.value.trim();
        if (keyword.length > 0) {
            try {
                const suggestions = await fetchSuggestions(keyword);
                displaySuggestions(suggestions);
            } catch (error) {
                console.error('Lỗi khi lấy gợi ý:', error);
            }
        } else {
            suggestionsBox.classList.remove('active');
            suggestionsBox.innerHTML = '';
        }
    }, 300);
});

// Hiển thị gợi ý
function displaySuggestions(suggestions) {
    if (!suggestions || suggestions.length === 0) {
        suggestionsBox.classList.remove('active');
        return;
    }

    suggestionsBox.innerHTML = suggestions.map(item => `
        <div class="suggestion-item" data-id="${item.source_word_id}">
            <div class="suggestion-word">${item.source_word}</div>
            <div class="suggestion-phonetic">/${item.source_phonetic}/</div>
            <div class="suggestion-translations">${item.target_words.map(t => t.target_word).join(', ')}</div>
        </div>
    `).join('');

    suggestionsBox.classList.add('active');

    // Thêm sự kiện click cho các gợi ý
    document.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', function() {
            const wordId = this.dataset.id;
            showWordDetail(wordId);
            suggestionsBox.classList.remove('active');
        });
    });
}

// Ẩn gợi ý khi click ngoài
document.addEventListener('click', function(e) {
    if (!suggestionsBox.contains(e.target) && e.target !== searchInput) {
        suggestionsBox.classList.remove('active');
    }
});

// Dịch khi bấm nút
searchBtn.addEventListener('click', function() {
    const word = searchInput.value.trim();
    if (word) {
        const from = fromLang.dataset.value;
        const to = toLang.dataset.value;
        showResult(word, from, to);
    }
});

// Dịch khi enter
searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const word = this.value.trim();
        if (word) {
            const from = fromLang.dataset.value;
            const to = toLang.dataset.value;
            showResult(word, from, to);
        }
    }
});

// Lấy gợi ý từ API
async function fetchSuggestions(keyword) {
    const from = fromLang.dataset.value === 'en' ? '1' : '2';
    const to = toLang.dataset.value === 'vi' ? '2' : '1';
    const url = `${API_Translate_BASE}/${encodeURIComponent(keyword)}/${from}/${to}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Lỗi khi lấy gợi ý:', error);
        return [];
    }
}

// Lấy chi tiết từ
async function fetchWordDetail(wordId) {
    const url = `${API_Word_BASE}/${wordId}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết từ:', error);
        throw error;
    }
}

// Hiển thị kết quả tìm kiếm
async function showResult(word, from, to) {
    resultBox.innerHTML = `<div style="text-align:center;padding:32px 0;">Đang tra cứu...</div>`;
    
    try {
        const suggestions = await fetchSuggestions(word);
        if (!suggestions || suggestions.length === 0) {
            resultBox.innerHTML = `<div style="text-align:center;padding:32px 0;color:#f00;">Không tìm thấy kết quả.</div>`;
            return;
        }

        // Lấy chi tiết từ đầu tiên
        const firstWord = suggestions[0];
        await showWordDetail(firstWord.source_word_id);
    } catch (error) {
        console.error('Lỗi khi hiển thị kết quả:', error);
        resultBox.innerHTML = `<div style="text-align:center;padding:32px 0;color:#f00;">Có lỗi xảy ra khi tra cứu.</div>`;
    }
}

// Hiển thị chi tiết từ
async function showWordDetail(wordId) {
    // Hiển thị loader
    resultBox.innerHTML = '';
    // Lấy các phần tử trong result-card
    const wordImage = document.getElementById('wordImage');
    const wordText = document.getElementById('wordText');
    const phoneticText = document.getElementById('phoneticText');
    const definitionsContainer = document.getElementById('definitionsContainer');
    const soundBtn = document.getElementById('soundBtn');
    const saveBtn = document.getElementById('saveBtn');

    // Nếu chưa có result-card (lần đầu), render lại mẫu
    if (!wordImage || !wordText || !phoneticText || !definitionsContainer) {
        resultBox.innerHTML = `
        <div class="result-card">
          <div class="result-header">
            <div class="header-content">
              <img src="" alt="" class="translate-image" id="wordImage">
              <div class="word-info">
                <span class="word" id="wordText"></span>
                <span class="phonetic" id="phoneticText"></span>
              </div>
              <button class="sound-btn" id="soundBtn">
                <i class="fas fa-volume-up"></i>
              </button>
            </div>
            <button class="save-btn" id="saveBtn">Lưu</button>
          </div>
          <div class="result-body">
            <div class="definitions-container" id="definitionsContainer"></div>
          </div>
        </div>`;
    }

    // Lấy lại các phần tử sau khi render mẫu
    const imgEl = document.getElementById('wordImage');
    const wordEl = document.getElementById('wordText');
    const phoneticEl = document.getElementById('phoneticText');
    const defsEl = document.getElementById('definitionsContainer');
    const soundEl = document.getElementById('soundBtn');
    const saveEl = document.getElementById('saveBtn');

    try {
        const wordDetail = await fetchWordDetail(wordId);

        // Gán ảnh nếu có
        if (wordDetail.image) {
            imgEl.src = wordDetail.image;
            imgEl.alt = wordDetail.word;
            imgEl.style.display = '';
        } else {
            imgEl.src = '';
            imgEl.alt = '';
            imgEl.style.display = 'none';
        }

        // Gán từ và phiên âm
        wordEl.textContent = wordDetail.word || '';
        phoneticEl.textContent = wordDetail.phonetic ? `/${wordDetail.phonetic}/` : '';

        // Gán các định nghĩa
        defsEl.innerHTML = wordDetail.definitions.map(def => `
            <div class="definition-item">
                <div class="word-type">(${escapeHtml(def.word_type)})</div>
                <div class="meaning"><b>${escapeHtml(def.meaning)}</b></div>
                <div class="example" style="color:#888;margin-left:10px;">${def.example ? `<i>${escapeHtml(def.example)}</i>` : ''}</div>
            </div>
        `).join('');

        // Gán sự kiện phát âm
        soundEl.onclick = function() {
            playSound(wordDetail.word);
        };

        // Gán sự kiện lưu từ (nếu có quyền)
        if (groupUserId === 2) {
            saveEl.style.display = '';
            saveEl.onclick = function() {
                openSaveModal(wordDetail.word, wordDetail.definitions[0]?.meaning || '', wordId);
            };
        } else {
            saveEl.style.display = 'none';
        }
    } catch (error) {
        console.error('Lỗi khi hiển thị chi tiết từ:', error);
        resultBox.innerHTML = `<div style="text-align:center;padding:32px 0;color:#f00;">Có lỗi xảy ra khi lấy chi tiết từ.</div>`;
    }
}

// Phát âm
function playSound(word) {
    if (!word) return;
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US'; // hoặc 'vi-VN' nếu là tiếng Việt
    window.speechSynthesis.speak(utterance);
}

// Modal lưu từ
const modalBackdrop = document.getElementById('modalBackdrop');
const wordInput = document.getElementById('wordInput');
const meaningInput = document.getElementById('meaningInput');
const saveForm = document.getElementById('saveForm');

// Biến lưu wordId hiện tại
let currentWordId = null;

// Hàm kiểm tra đăng nhập
async function checkLogin() {
    try {
        const userInfo = await window.fetchUserInfo();
        if (!userInfo) {
            throw new Error('Chưa đăng nhập');
        }
        groupUserId = userInfo.group_user_id;
        return true;
    } catch (error) {
        console.error('Lỗi khi kiểm tra đăng nhập:', error);
        return false;
    }
}

async function openSaveModal(word, meaning, wordId) {
    try {
        // Kiểm tra đăng nhập
        const isLoggedIn = await checkLogin();
        if (!isLoggedIn) {
            alert('Vui lòng đăng nhập để sử dụng chức năng này');
            window.location.href = '../../../Pages/Components/Html/login.html';
            return;
        }

        // Điền thông tin từ vựng
        const wordInput = document.getElementById('wordInput');
        const meaningInput = document.getElementById('meaningInput');
        wordInput.value = word;
        meaningInput.value = meaning;
        currentWordId = wordId;
        
        // Hiển thị modal
        const modalBackdrop = document.getElementById('modalBackdrop');
        modalBackdrop.style.display = 'flex';
        modalBackdrop.classList.add('active');
        
        // Load danh sách bộ sưu tập
        await loadCollections();
        
    } catch (error) {
        console.error('Lỗi khi mở modal:', error);
        alert('Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
}

function closeSaveModal() {
    const modalBackdrop = document.getElementById('modalBackdrop');
    modalBackdrop.style.display = 'none';
    modalBackdrop.classList.remove('active');
    currentWordId = null;
    
    // Reset select box
    const folderInput = document.getElementById('folderInput');
    if (folderInput) {
        folderInput.innerHTML = '<option value="">Chọn bộ sưu tập...</option>';
    }
}

// Hàm lấy token từ localStorage
function getToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
}

// Hàm load danh sách bộ sưu tập
async function loadCollections() {
    try {
        // Lấy danh sách từ API
        const collections = await window.collectionsAPI.getUserCollections();
        console.log('Danh sách bộ sưu tập:', collections);

        // Lấy reference đến select box
        const folderInput = document.getElementById('folderInput');
        if (!folderInput) {
            throw new Error('Không tìm thấy element folderInput');
        }

        // Xóa các option cũ
        folderInput.innerHTML = '<option value="">Chọn bộ sưu tập...</option>';
        
        // Kiểm tra có dữ liệu không
        if (!collections || !Array.isArray(collections) || collections.length === 0) {
            const option = document.createElement('option');
            option.disabled = true;
            option.textContent = 'Bạn chưa có bộ sưu tập nào';
            folderInput.appendChild(option);
            return;
        }
        
        // Thêm các bộ sưu tập vào select box
        collections.forEach(collection => {
            if (collection && typeof collection === 'object') {
                const { collectionId, name } = collection;
                
                if (collectionId && name) {
                    const option = document.createElement('option');
                    option.value = collectionId;
                    option.textContent = `${name} (${collection.wordCount} từ)`;
                    folderInput.appendChild(option);
                }
            }
        });

    } catch (error) {
        console.error('Lỗi khi load danh sách bộ sưu tập:', error);
        const folderInput = document.getElementById('folderInput');
        if (folderInput) {
            folderInput.innerHTML = '<option value="" disabled>Không thể tải danh sách bộ sưu tập</option>';
        }
        alert('Có lỗi xảy ra khi lấy danh sách bộ sưu tập. Vui lòng thử lại sau.');
    }
}

// Xử lý lưu từ
saveForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const folderInput = document.getElementById('folderInput');
    
    if (!folderInput) {
        alert('Không tìm thấy phần tử chọn bộ sưu tập');
        return;
    }

    const collectionId = folderInput.value;
    console.log('Collection ID được chọn:', collectionId); // Debug log
    
    if (!collectionId || collectionId === '') {
        alert('Vui lòng chọn bộ sưu tập');
        return;
    }

    if (!currentWordId) {
        alert('Không tìm thấy thông tin từ cần lưu');
        return;
    }

    try {
        console.log('Đang thêm từ vào bộ sưu tập:', { collectionId, currentWordId }); // Debug log
        await window.collectionsAPI.addWordToCollection(collectionId, currentWordId);
        alert('Đã lưu từ vào bộ sưu tập thành công!');
        closeSaveModal();
    } catch (error) {
        console.error('Lỗi khi lưu từ:', error);
        if (error.message.includes('Unauthorized')) {
            alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (error.message.includes('Forbidden')) {
            alert('Bạn không có quyền thêm từ vào bộ sưu tập này');
        } else {
            alert('Có lỗi xảy ra khi lưu từ. Vui lòng thử lại sau.');
        }
    }
});

function escapeHtml(str) {
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
