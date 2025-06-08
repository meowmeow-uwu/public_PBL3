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


let user = null;

// Lấy thông tin user khi trang được load
async function loadUserInfo() {
    try {
        const userInfo = await fetchUserInfo();
        if (userInfo) {
            user = userInfo;
        }
    } catch (error) {
        console.error('Lỗi khi lấy thông tin user:', error);
    }
}

// Gọi hàm load user info khi trang được load
loadUserInfo();
// Đổi chiều dịch
swapLang.addEventListener('click', function () {
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
searchInput.addEventListener('input', function () {
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
            <div class="suggestion-translations">Đang tải...</div>
        </div>
    `).join('');

    suggestionsBox.classList.add('active');

    // Thêm sự kiện click cho các gợi ý
    document.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', function () {
            const wordId = this.dataset.id;
            showWordDetail(wordId);
            suggestionsBox.classList.remove('active');
        });
    });

    // Gọi API getInfoTranslate cho từng gợi ý
    suggestions.forEach(async (suggestion, index) => {
        try {
            const from = fromLang.dataset.value === 'en' ? '1' : '2';
            const to = toLang.dataset.value === 'vi' ? '2' : '1';
            
            const translations = await window.TRANSLATE_API.getInfoTranslate(
                suggestion.source_word_id,
                from,
                to
            );

            // Cập nhật UI với kết quả dịch
            const translationElement = suggestionsBox.children[index].querySelector('.suggestion-translations');
            if (translationElement) {
                translationElement.textContent = translations.map(t => t.wordName).join(', ');
            }
        } catch (error) {
            console.error('Lỗi khi lấy thông tin dịch:', error);
            const translationElement = suggestionsBox.children[index].querySelector('.suggestion-translations');
            if (translationElement) {
                translationElement.textContent = 'Không thể tải bản dịch';
            }
        }
    });
}

// Ẩn gợi ý khi click ngoài
document.addEventListener('click', function (e) {
    if (!suggestionsBox.contains(e.target) && e.target !== searchInput) {
        suggestionsBox.classList.remove('active');
    }
});

// Dịch khi bấm nút
searchBtn.addEventListener('click', function () {
    const word = searchInput.value.trim();
    if (word) {
        const from = fromLang.dataset.value;
        const to = toLang.dataset.value;
        showResult(word, from, to);
    }
});

// Dịch khi enter
searchInput.addEventListener('keydown', function (e) {
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
    
    try {
        // Gọi API getAllWordByKeyword trước
        const result = await window.TRANSLATE_API.getAllWordByKeyword(keyword, from, to);
        
        if (!result || !result.words || result.words.length === 0) {
            return [];
        }

        // Chuyển đổi format dữ liệu để hiển thị gợi ý
        return result.words.map(word => ({
            source_word_id: word.wordId,
            source_word: word.wordName,
            source_phonetic: word.pronunciation,
            target_words: [] // Sẽ được cập nhật sau khi gọi getInfoTranslate
        }));
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
        // Gọi API getAllWordByKeyword trước
        const result = await window.TRANSLATE_API.getAllWordByKeyword(word, from, to);
        
        if (!result || !result.words || result.words.length === 0) {
            resultBox.innerHTML = `<div style="text-align:center;padding:32px 0;color:#f00;">Không tìm thấy kết quả.</div>`;
            return;
        }

        // Lấy chi tiết từ đầu tiên
        const firstWord = result.words[0];
        await showWordDetail(firstWord.wordId);
    } catch (error) {
        console.error('Lỗi khi hiển thị kết quả:', error);
        resultBox.innerHTML = `<div style="text-align:center;padding:32px 0;color:#f00;">Có lỗi xảy ra khi tra cứu.</div>`;
    }
}

// Hiển thị chi tiết từ
async function showWordDetail(wordId) {
    // Hiển thị loader
    resultBox.innerHTML = '<div class="loading">Đang tải...</div>';

    try {
        // Lấy thông tin từ gốc và danh sách từ dịch
        const from = fromLang.dataset.value === 'en' ? '1' : '2';
        const to = toLang.dataset.value === 'vi' ? '2' : '1';
        
        // Lấy thông tin từ gốc
        const sourceWord = await fetchWordDetail(wordId);
        
        // Lấy danh sách từ dịch
        const translations = await window.TRANSLATE_API.getInfoTranslate(wordId, from, to);
        
        // Lấy định nghĩa của từ gốc
        let sourceDefinition = null;
        try {
            sourceDefinition = await window.DEFINITION_API.getDefinitionByWordId(wordId);
        } catch (error) {
            console.warn('Không tìm thấy định nghĩa cho từ gốc:', error);
        }

        // Tạo HTML cho từ gốc
        let html = `
            <div class="result-card">
                <div class="result-header">
                    <div class="header-content">
                        ${sourceWord.image ? `
                            <img src="${sourceWord.image}" alt="${sourceWord.word}" class="translate-image">
                        ` : ''}
                        <div class="word-info">
                            <span class="word">${sourceWord.word}</span>
                            ${sourceWord.phonetic ? `
                                <span class="phonetic">/${sourceWord.phonetic}/</span>
                            ` : ''}
                        </div>
                        <button class="sound-btn" onclick="playSound('${sourceWord.word}')">
                            <i class="fas fa-volume-up"></i>
                        </button>
                    </div>
                    ${user ? `
                        <button class="save-btn" onclick="openSaveModal('${sourceWord.word}', '${sourceDefinition?.meaning || ''}', ${wordId})">
                            Lưu
                        </button>
                    ` : ''}
                </div>
                <div class="result-body">
                    ${sourceDefinition ? `
                        <div class="definition-item">
                            <div class="word-type">(${sourceDefinition.wordType})</div>
                            <div class="meaning">${sourceDefinition.meaning}</div>
                            ${sourceDefinition.example ? `
                                <div class="example">${sourceDefinition.example}</div>
                            ` : ''}
                        </div>
                    ` : '<div class="no-definition">Chưa có định nghĩa cho từ này</div>'}
                </div>
            </div>
        `;

        // Thêm phần từ dịch nếu có
        if (translations && translations.length > 0) {
            html += `
                <div class="translations-section">
                    <h3>Các từ dịch:</h3>
                    <div class="translations-list">
            `;

            // Lấy định nghĩa cho từng từ dịch
            for (const translation of translations) {
                let targetDefinitions = [];
                try {
                    targetDefinitions = await window.DEFINITION_API.getAllDefinitionsByWordId(translation.wordId);
                } catch (error) {
                    console.warn(`Không tìm thấy định nghĩa cho từ dịch ${translation.wordName}:`, error);
                }
                
                html += `
                    <div class="translation-item">
                        <div class="translation-header">
                            <span class="translation-word">${translation.wordName}</span>
                            ${translation.pronunciation ? `
                                <span class="translation-phonetic">/${translation.pronunciation}/</span>
                            ` : ''}
                            <button class="sound-btn" onclick="playSound('${translation.wordName}')">
                                <i class="fas fa-volume-up"></i>
                            </button>
                        </div>
                        <div class="translation-definitions">
                            ${targetDefinitions.length > 0 ? 
                                targetDefinitions.map((def, index) => `
                                    <div class="translation-definition">
                                        <span class="definition-number">${index + 1}.</span>
                                        <span class="definition-meaning">${def.meaning}</span>
                                        ${def.example ? `
                                            <div class="definition-example">${def.example}</div>
                                        ` : ''}
                                    </div>
                                `).join('') : 
                                '<div class="no-definition">Chưa có định nghĩa cho từ này</div>'
                            }
                        </div>
                    </div>
                `;
            }

            html += `
                    </div>
                </div>
            `;
        }

        resultBox.innerHTML = html;

        // Thêm sự kiện lưu từ vào lịch sử nếu đã đăng nhập
        if (user) {
            await window.addWordHistory(wordId);
        }

    } catch (error) {
        console.error('Lỗi khi hiển thị chi tiết từ:', error);
        resultBox.innerHTML = `
            <div class="error-message">
                Có lỗi xảy ra khi lấy chi tiết từ. Vui lòng thử lại sau.
            </div>
        `;
    }
}

// Phát âm
function playSound(word) {
    if (!word)
        return;
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US'; // hoặc 'vi-VN' nếu là tiếng Việt
    window.speechSynthesis.speak(utterance);
}

// Modal lưu từ
const modalBackdrop = document.getElementById('modalBackdrop');
const wordInput = document.getElementById('wordInput');
const meaningInput = document.getElementById('meaningInput');
const saveForm = document.getElementById('saveForm');
const createCollectionBtn = document.getElementById('createCollectionBtn');

// Biến lưu wordId hiện tại
let currentWordId = null;

// Xử lý tạo bộ sưu tập mới
createCollectionBtn.addEventListener('click', async function() {
    try {
        const collectionName = prompt('Nhập tên bộ sưu tập mới:');
        if (!collectionName) return;

        const collectionId = await window.collectionsAPI.createCollection(collectionName);
        if (collectionId) {
            // Tải lại danh sách bộ sưu tập
            await loadCollections();
            
            // Chọn bộ sưu tập mới tạo
            const folderInput = document.getElementById('folderInput');
            folderInput.value = collectionId;
            
            showToast('success', 'Thành công!', 'Đã tạo bộ sưu tập mới thành công!');
        }
    } catch (error) {
        console.error('Lỗi khi tạo bộ sưu tập:', error);
        showToast('error', 'Lỗi', 'Có lỗi xảy ra khi tạo bộ sưu tập mới');
    }
});

async function openSaveModal(word, meaning, wordId) {
    try {
        // Kiểm tra đăng nhập
        if (!user) {
            showToast('warning', 'Cảnh báo', 'Vui lòng đăng nhập để sử dụng chức năng này');
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
        showToast('error', 'Lỗi','Có lỗi xảy ra. Vui lòng thử lại sau.');
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
    if (!token)
        return null;
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
                const {collectionId, name} = collection;

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
        showToast('error', 'Lỗi','Có lỗi xảy ra khi lấy danh sách bộ sưu tập. Vui lòng thử lại sau.');
    }
}

// Xử lý lưu từ
saveForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const folderInput = document.getElementById('folderInput');

    if (!folderInput) {
        showToast('error', 'Lỗi','Không tìm thấy phần tử chọn bộ sưu tập');
        return;
    }

    const collectionId = folderInput.value;
    console.log('Collection ID được chọn:', collectionId); // Debug log

    if (!collectionId || collectionId === '') {
        showToast('warning', 'Cảnh báo', 'Vui lòng chọn bộ sưu tập');
        return;
    }

    if (!currentWordId) {
        showToast('warning', 'Cảnh báo', 'Không tìm thấy thông tin từ cần lưu');
        return;
    }

    try {
        console.log('Đang thêm từ vào bộ sưu tập:', {collectionId, currentWordId}); // Debug log
        await window.collectionsAPI.addWordToCollection(collectionId, currentWordId);
        showToast('success', 'Thành công!',  'Đã lưu từ vào bộ sưu tập thành công!');
        closeSaveModal();
    } catch (error) {
        console.error('Lỗi khi lưu từ:', error);
        if (error.message.includes('Unauthorized')) {
            showToast('error', 'Lỗi','Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (error.message.includes('Forbidden')) {
            showToast('warning', 'Cảnh báo', 'Bạn không có quyền thêm từ vào bộ sưu tập này');
        } else {
            showToast('error', 'Lỗi','Có lỗi xảy ra khi lưu từ. Vui lòng thử lại sau.');
        }
    }
});

function escapeHtml(str) {
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
