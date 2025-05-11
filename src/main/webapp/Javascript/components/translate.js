const API_Translate_BASE = "http://localhost:2005/PBL3/api/translate";
const API_Word_BASE = "http://localhost:2005/PBL3/api/word";

// DOM Elements
const searchInput = document.getElementById('searchInput');
const suggestionsBox = document.getElementById('suggestions');
const resultBox = document.getElementById('result');
const searchBtn = document.getElementById('searchBtn');
const fromLang = document.getElementById('fromLang');
const toLang = document.getElementById('toLang');
const swapLang = document.getElementById('swapLang');

// Đổi chiều dịch
swapLang.addEventListener('click', function() {
    const from = fromLang.value;
    fromLang.value = toLang.value;
    toLang.value = from;
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
        const from = fromLang.value;
        const to = toLang.value;
        showResult(word, from, to);
    }
});

// Dịch khi enter
searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const word = this.value.trim();
        if (word) {
            const from = fromLang.value;
            const to = toLang.value;
            showResult(word, from, to);
        }
    }
});

// Lấy gợi ý từ API
async function fetchSuggestions(keyword) {
    const from = fromLang.value === 'en' ? '1' : '2';
    const to = toLang.value === 'vi' ? '2' : '1';
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
    resultBox.innerHTML = '<div class="loader"></div>';
    try {
        const wordDetail = await fetchWordDetail(wordId);

        const definitionsHtml = wordDetail.definitions.map(def => `
            <div class="definition-item">
                <div class="word-type">(${escapeHtml(def.word_type)})</div>
                <div class="meaning"><b>${escapeHtml(def.meaning)}</b></div>
                <div class="example" style="color:#888;margin-left:10px;">${def.example ? `<i>${escapeHtml(def.example)}</i>` : ''}</div>
            </div>
        `).join('');

        const resultHtml = `
            <div class="result-card">
                <div class="result-header" style="background:#4285f4;color:#fff;border-radius:12px 12px 0 0;padding:12px 18px;display:flex;align-items:center;justify-content:space-between;">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <span class="word" style="font-size:2rem;font-weight:bold;color:#fff;">${escapeHtml(wordDetail.word)}</span>
                        <span class="phonetic" style="font-size:1.1rem;color:#e3f0fc;">/${escapeHtml(wordDetail.phonetic)}/</span>
                        <button class="sound-btn" onclick="playSound('${escapeHtml(wordDetail.word)}')" style="background:none;border:none;cursor:pointer;color:#fff;font-size:1.3rem;">
                            <i class="fas fa-volume-up"></i>
                        </button>
                    </div>
                    <button class="save-btn" onclick="openSaveModal('${escapeHtml(wordDetail.word)}', '${escapeHtml(wordDetail.definitions[0]?.meaning || '')}')">Lưu</button>
                </div>
                <div style="padding:18px;">
                    <div class="definitions-container">
                        ${definitionsHtml}
                    </div>
                </div>
            </div>
        `;

        resultBox.innerHTML = resultHtml;
    } catch (error) {
        console.error('Lỗi khi hiển thị chi tiết từ:', error);
        resultBox.innerHTML += `<div style="text-align:center;padding:32px 0;color:#f00;">Có lỗi xảy ra khi lấy chi tiết từ.</div>`;
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

function openSaveModal(word, meaning) {
    wordInput.value = word;
    meaningInput.value = meaning;
    modalBackdrop.classList.add('active');
}

function closeSaveModal() {
    modalBackdrop.classList.remove('active');
}

// Xử lý lưu từ
saveForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const word = wordInput.value;
    const meaning = meaningInput.value;
    const folder = document.getElementById('folderInput').value;
    
    // TODO: Thêm API call để lưu từ
    alert(`Đã lưu từ: ${word} - ${meaning} vào folder: ${folder}`);
    closeSaveModal();
});

function escapeHtml(str) {
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
