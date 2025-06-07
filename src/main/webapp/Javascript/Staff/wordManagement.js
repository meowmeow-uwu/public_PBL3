/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/JavaScript.js to edit this template
 */

let currentPage = 1;
const pageSize = 10;
let currentLanguageId = 1;
let currentKeyword = '';

// Khởi tạo trang
document.addEventListener('DOMContentLoaded', () => {
    loadWords();
    setupEventListeners();
});

// Thiết lập các event listener
function setupEventListeners() {
    // Word form
    document.getElementById('wordForm').addEventListener('submit', handleWordSubmit);
    
    // Definition form
    document.getElementById('definitionForm').addEventListener('submit', handleDefinitionSubmit);
    
    // Close buttons
    document.querySelectorAll('.close').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    // Language filter
    document.getElementById('mainLanguageFilter').addEventListener('change', (e) => {
        currentLanguageId = e.target.value;
        currentPage = 1;
        loadWords();
    });
}

// Load danh sách từ
async function loadWords() {
    try {
        const response = await getWordList({
            page: currentPage,
            size: pageSize,
            language_id: currentLanguageId,
            keyword: currentKeyword
        });
        
        if (!response || !response.words) {
            console.error('Dữ liệu không hợp lệ:', response);
            return;
        }
        
        displayWords(response.words);
        displayPagination(response.totalPages);
    } catch (error) {
        console.error('Lỗi khi tải danh sách từ:', error);
        showToast('error', 'Lỗi','Không thể tải danh sách từ. Vui lòng thử lại sau.');
    }
}

// Hiển thị danh sách từ
function displayWords(words) {
    const wordList = document.getElementById('wordList');
    wordList.innerHTML = '';
    
    if (!words || words.length === 0) {
        wordList.innerHTML = '<div class="no-data">Không có dữ liệu</div>';
        return;
    }
    
    words.forEach(word => {
        if (!word) return;
        
        const wordElement = document.createElement('div');
        wordElement.className = 'word-item';
        wordElement.innerHTML = `
            <div class="word-info">
                <div class="word-header">
                    <h3>${word.word_name || 'N/A'}</h3>
                    <span class="word-id">ID: ${word.word_id || 'N/A'}</span>
                </div>
                <div class="word-details">
                    <p><i class="fas fa-volume-up"></i> Phát âm: ${word.pronunciation || 'N/A'}</p>
                    <div class="word-media">
                        ${word.image ? `
                            <div class="word-image">
                                <img src="${word.image}" alt="Hình ảnh minh họa" onerror="this.style.display='none'">
                            </div>
                        ` : ''}
                        ${word.sound ? `
                            <div class="word-sound">
                                <audio controls>
                                    <source src="${word.sound}" type="audio/mpeg">
                                    Trình duyệt của bạn không hỗ trợ phát âm thanh
                                </audio>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            <div class="word-actions">
                <button class="edit-btn" onclick="openEditWordModal(${word.word_id})">
                    <i class="fas fa-edit"></i> Sửa
                </button>
                <button class="edit-btn" onclick="openDefinitionModal(${word.word_id})">
                    <i class="fas fa-book"></i> Định nghĩa
                </button>
                <button class="edit-btn" onclick="openTranslationModal(${word.word_id})">
                    <i class="fas fa-language"></i> Dịch
                </button>
                <button class="delete-btn" onclick="deleteWord(${word.word_id})">
                    <i class="fas fa-trash"></i> Xóa
                </button>
            </div>
        `;
        wordList.appendChild(wordElement);
    });
}

// Hiển thị phân trang
function displayPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = i === currentPage ? 'active' : '';
        button.onclick = () => {
            currentPage = i;
            loadWords();
        };
        pagination.appendChild(button);
    }
}

// Tìm kiếm từ
function searchWords() {
    currentKeyword = document.getElementById('mainSearchInput').value;
    currentLanguageId = document.getElementById('mainLanguageFilter').value;
    currentPage = 1;
    loadWords();
}

// Mở modal thêm từ mới
function openAddWordModal() {
    document.getElementById('modalTitle').textContent = 'Thêm từ mới';
    document.getElementById('wordForm').reset();
    document.getElementById('wordId').value = '';
    document.getElementById('wordModal').style.display = 'block';
}

// Mở modal sửa từ
async function openEditWordModal(wordId) {
    try {
        const word = await getWordById(wordId);
        if (!word) {
            throw new Error('Không tìm thấy từ vựng');
        }
        
        document.getElementById('modalTitle').textContent = 'Sửa từ';
        document.getElementById('wordId').value = word.word_id;
        document.getElementById('wordName').value = word.word_name;
        document.getElementById('pronunciation').value = word.pronunciation || '';
        document.getElementById('languageId').value = word.language_id;
        document.getElementById('wordModal').style.display = 'block';
        document.getElementById('soundLink').value = word.sound;
        document.getElementById('imageLink').value = word.image;
    } catch (error) {
        console.error('Lỗi khi tải thông tin từ:', error);
        showToast('error', 'Lỗi', 'Không thể tải thông tin từ. Vui lòng thử lại sau.');
    }
}

// Xử lý submit form từ
async function handleWordSubmit(e) {
    e.preventDefault();
    
    const wordId = document.getElementById('wordId').value;
    const wordData = {
        word_name: document.getElementById('wordName').value,
        pronunciation: document.getElementById('pronunciation').value,
        language_id: Number(document.getElementById('languageId').value),
        image: document.getElementById('imageLink').value,
        sound: document.getElementById('soundLink').value
    };
    if (wordId) {
        wordData.id = Number(wordId);
    }
    
    try {
        if (wordId) {
            await updateWord(wordData);
        } else {
            await createWord(wordData);
        }
        
        document.getElementById('wordModal').style.display = 'none';
        loadWords();
    } catch (error) {
        console.error('Lỗi khi lưu từ:', error);
        showToast('error', 'Lỗi', 'Không thể lưu từ. Vui lòng thử lại sau.');
    }
}

// Xóa từ
async function deleteWord(wordId) {
    if (!confirm('Bạn có chắc chắn muốn xóa từ này?')) return;
    try {
        await deleteWordAPI(wordId);
        loadWords();
    } catch (error) {
        console.error('Lỗi khi xóa từ:', error);
        showToast('error', 'Lỗi',  'Không thể xóa từ. Vui lòng thử lại sau.');
    }
}

// Mở modal định nghĩa
async function openDefinitionModal(wordId) {
    try {
        const definitions = await getDefinitionsByWordId(wordId);
        const definitionList = document.getElementById('definitionList');
        definitionList.innerHTML = '';
        
        if (!definitions || definitions.length === 0) {
            definitionList.innerHTML = '<div class="no-data">Chưa có định nghĩa nào</div>';
        } else {
            definitions.forEach(def => {
                const defElement = document.createElement('div');
                defElement.className = 'definition-item';
                defElement.innerHTML = `
                    <h4>${def.word_type || 'N/A'}</h4>
                    <p>Nghĩa: ${def.meaning || 'N/A'}</p>
                    <p>Ví dụ: ${def.example || 'N/A'}</p>
                    <div class="word-actions">
                        <button class="edit-btn" onclick="openEditDefinitionModal(${def.definition_id})">
                            <i class="fas fa-edit"></i> Sửa
                        </button>
                        <button class="delete-btn" onclick="deleteDefinition(${def.definition_id})">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                    </div>
                `;
                definitionList.appendChild(defElement);
            });
        }
        
        document.getElementById('definitionWordId').value = wordId;
        document.getElementById('definitionModal').style.display = 'block';
    } catch (error) {
        console.error('Lỗi khi tải định nghĩa:', error);
        showToast('error', 'Lỗi',  'Không thể tải định nghĩa. Vui lòng thử lại sau.');
    }
}

// Mở modal thêm định nghĩa mới
function openAddDefinitionModal() {
    document.getElementById('definitionModalTitle').textContent = 'Thêm định nghĩa mới';
    document.getElementById('definitionForm').reset();
    document.getElementById('definitionId').value = '';
    document.getElementById('addDefinitionModal').style.display = 'block';
}

// Mở modal sửa định nghĩa
async function openEditDefinitionModal(definitionId) {
    try {
        const definition = await getDefinitionById(definitionId);
        if (!definition) {
            throw new Error('Không tìm thấy định nghĩa');
        }
        
        document.getElementById('definitionModalTitle').textContent = 'Sửa định nghĩa';
        document.getElementById('definitionId').value = definition.definition_id;
        document.getElementById('wordType').value = definition.word_type;
        document.getElementById('meaning').value = definition.meaning;
        document.getElementById('example').value = definition.example || '';
        document.getElementById('addDefinitionModal').style.display = 'block';
    } catch (error) {
        console.error('Lỗi khi tải thông tin định nghĩa:', error);
        showToast('error', 'Lỗi', 'Không thể tải thông tin định nghĩa. Vui lòng thử lại sau.');
    }
}

// Xử lý submit form định nghĩa
async function handleDefinitionSubmit(e) {
    e.preventDefault();
    
    const definitionId = document.getElementById('definitionId').value;
    const wordId = document.getElementById('definitionWordId').value;
    const definitionData = {
        word_id: wordId,
        word_type: document.getElementById('wordType').value,
        meaning: document.getElementById('meaning').value,
        example: document.getElementById('example').value
    };
    
    try {
        if (definitionId) {
            definitionData.definition_id = definitionId;
            await updateDefinition(definitionData);
        } else {
            await addDefinition(wordId, definitionData.meaning, definitionData.example, definitionData.word_type);
        }
        
        document.getElementById('addDefinitionModal').style.display = 'none';
        openDefinitionModal(wordId);
    } catch (error) {
        console.error('Lỗi khi lưu định nghĩa:', error);
        showToast('error', 'Lỗi', 'Không thể lưu định nghĩa. Vui lòng thử lại sau.');
    }
}

// Xóa định nghĩa
async function deleteDefinition(definitionId) {
    if (!confirm('Bạn có chắc chắn muốn xóa định nghĩa này?')) return;
    
    try {
        await deleteDefinitionAPI(definitionId);
        const wordId = document.getElementById('definitionWordId').value;
        openDefinitionModal(wordId);
    } catch (error) {
        console.error('Lỗi khi xóa định nghĩa:', error);
        showToast('error', 'Lỗi', 'Không thể xóa định nghĩa. Vui lòng thử lại sau.');
    }
}

// Xóa bản dịch
async function deleteTranslate(translateId) {
    if (!confirm('Bạn có chắc chắn muốn xóa bản dịch này?')) return;
    
    try {
        await deleteTranslateAPI(translateId);
        const wordId = document.getElementById('sourceWordId').value;
        openTranslationModal(wordId);
    } catch (error) {
        console.error('Lỗi khi xóa bản dịch:', error);
        showToast('error', 'Lỗi',  'Không thể xóa bản dịch. Vui lòng thử lại sau.');
    }
}

// Mở modal dịch
async function openTranslationModal(wordId) {
    try {
        const translations = await getTranslateByWordId(wordId, 1); // Lấy bản dịch Anh-Việt
        const translationList = document.getElementById('translationList');
        translationList.innerHTML = '';
        
        if (!translations || translations.length === 0) {
            translationList.innerHTML = '<div class="no-data">Chưa có bản dịch nào</div>';
        } else {
            // Lấy thông tin chi tiết của từng từ đích
            for (const trans of translations) {
                try {
                    const targetWord = await getWordById(trans.trans_word_id);
                    const transElement = document.createElement('div');
                    transElement.className = 'translation-item';
                    transElement.innerHTML = `
                        <div class="translation-info">
                            <div class="translation-header">
                                <h4>${targetWord.word_name}</h4>
                                <span class="translation-type">
                                    ${trans.type_translate_id === 1 ? 'Anh - Việt' : 'Việt - Anh'}
                                </span>
                            </div>
                            ${targetWord.pronunciation ? `<p>Phát âm: ${targetWord.pronunciation}</p>` : ''}
                            ${targetWord.image ? `
                                <div class="word-image">
                                    <img src="${targetWord.image}" alt="Hình ảnh minh họa" onerror="this.style.display='none'">
                                </div>
                            ` : ''}
                            ${targetWord.sound ? `
                                <div class="word-sound">
                                    <audio controls>
                                        <source src="${targetWord.sound}" type="audio/mpeg">
                                        Trình duyệt của bạn không hỗ trợ phát âm thanh
                                    </audio>
                                </div>
                            ` : ''}
                        </div>
                        <div class="word-actions">
                            <button class="edit-btn" onclick="openEditTranslationModal(${trans.translate_id}, ${trans.trans_word_id}, ${trans.type_translate_id})">
                                <i class="fas fa-edit"></i> Sửa
                            </button>
                            <button class="delete-btn" onclick="deleteTranslate(${trans.translate_id})">
                                <i class="fas fa-trash"></i> Xóa
                            </button>
                        </div>
                    `;
                    translationList.appendChild(transElement);
                } catch (error) {
                    console.error('Lỗi khi lấy thông tin từ đích:', error);
                    // Vẫn hiển thị từ nếu không lấy được thông tin chi tiết
                    const transElement = document.createElement('div');
                    transElement.className = 'translation-item';
                    transElement.innerHTML = `
                        <div class="translation-info">
                            <div class="translation-header">
                                <h4>Không thể tải thông tin từ</h4>
                                <span class="translation-type">
                                    ${trans.type_translate_id === 1 ? 'Anh - Việt' : 'Việt - Anh'}
                                </span>
                            </div>
                        </div>
                        <div class="word-actions">
                            <button class="edit-btn" onclick="openEditTranslationModal(${trans.translate_id}, ${trans.trans_word_id}, ${trans.type_translate_id})">
                                <i class="fas fa-edit"></i> Sửa
                            </button>
                            <button class="delete-btn" onclick="deleteTranslate(${trans.translate_id})">
                                <i class="fas fa-trash"></i> Xóa
                            </button>
                        </div>
                    `;
                    translationList.appendChild(transElement);
                }
            }
        }
        
        document.getElementById('sourceWordId').value = wordId;
        document.getElementById('translationModal').style.display = 'block';
    } catch (error) {
        console.error('Lỗi khi tải bản dịch:', error);
        showToast('error', 'Lỗi', 'Không thể tải bản dịch. Vui lòng thử lại sau.');
    }
}

// Tìm kiếm từ để dịch
async function searchTargetWords() {
    const keyword = document.getElementById('searchTargetWord').value;
    const typeId = document.getElementById('typeTranslateId').value;
    const languageId = document.getElementById('searchLanguageId').value;
    
    try {
        const response = await getWordList({
            page: 1,
            size: 10,
            language_id: languageId,
            keyword: keyword
        });
        
        const wordList = document.getElementById('translationWordList');
        wordList.innerHTML = '';
        
        if (!response.words || response.words.length === 0) {
            wordList.innerHTML = '<div class="no-data">Không tìm thấy từ nào</div>';
            return;
        }
        
        // Tạo bảng
        const table = document.createElement('table');
        table.className = 'word-table';
        
        // Tạo header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Từ</th>
                <th>Phát âm</th>
                <th>Thao tác</th>
            </tr>
        `;
        table.appendChild(thead);
        
        // Tạo body
        const tbody = document.createElement('tbody');
        response.words.forEach(word => {
            const tr = document.createElement('tr');
            tr.className = 'word-item';
            tr.dataset.wordId = word.word_id;
            tr.dataset.wordName = word.word_name;
            tr.innerHTML = `
                <td>${word.word_name}</td>
                <td>${word.pronunciation || 'N/A'}</td>
                <td>
                    <button type="button" class="select-btn" onclick="selectTargetWord(${word.word_id}, '${word.word_name}')">
                        <i class="fas fa-check"></i> Chọn
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        wordList.appendChild(table);
        
        // Hiển thị phân trang
        displayTranslationPagination(response.totalPages, 1, typeId, keyword);
    } catch (error) {
        console.error('Lỗi khi tìm kiếm từ:', error);
        showToast('error', 'Lỗi',  'Không thể tìm kiếm từ. Vui lòng thử lại sau.');
    }
}

// Load danh sách từ để chọn
async function loadTargetWords(typeId, page = 1, keyword = '') {
    try {
        const languageId = document.getElementById('searchLanguageId').value;
        const response = await getWordList({
            page: page,
            size: 10,
            language_id: languageId,
            keyword: keyword
        });
        
        const wordList = document.getElementById('translationWordList');
        wordList.innerHTML = '';
        
        if (!response.words || response.words.length === 0) {
            wordList.innerHTML = '<div class="no-data">Không có từ nào</div>';
            return;
        }
        
        // Tạo bảng
        const table = document.createElement('table');
        table.className = 'word-table';
        
        // Tạo header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Từ</th>
                <th>Phát âm</th>
                <th>Thao tác</th>
            </tr>
        `;
        table.appendChild(thead);
        
        // Tạo body
        const tbody = document.createElement('tbody');
        response.words.forEach(word => {
            const tr = document.createElement('tr');
            tr.className = 'word-item';
            tr.dataset.wordId = word.word_id;
            tr.dataset.wordName = word.word_name;
            tr.innerHTML = `
                <td>${word.word_name}</td>
                <td>${word.pronunciation || 'N/A'}</td>
                <td>
                    <button type="button" class="select-btn" onclick="selectTargetWord(${word.word_id}, '${word.word_name}')">
                        <i class="fas fa-check"></i> Chọn
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        wordList.appendChild(table);
        
        // Hiển thị phân trang
        displayTranslationPagination(response.totalPages, page, typeId, keyword);
    } catch (error) {
        console.error('Lỗi khi tải danh sách từ:', error);
        showToast('error', 'Lỗi',  'Không thể tải danh sách từ. Vui lòng thử lại sau.');
    }
}

// Chọn từ để dịch
async function selectTargetWord(wordId, wordName) {
    // Cập nhật hiển thị từ được chọn
    document.getElementById('currentWordDisplay').value = wordName;
    document.getElementById('currentWord').value = wordName;
    
    // Đánh dấu từ được chọn trong bảng
    const rows = document.querySelectorAll('.word-item');
    rows.forEach(row => {
        if (row.dataset.wordId === wordId.toString()) {
            row.classList.add('selected');
        } else {
            row.classList.remove('selected');
        }
    });
}

// Xử lý submit form bản dịch
document.getElementById('translationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const typeId = document.getElementById('typeTranslateId').value;
    const sourceWordId = document.getElementById('sourceWordId').value;
    const translationId = document.getElementById('translationId').value;
    
    // Lấy từ được chọn
    const selectedWord = document.querySelector('.word-item.selected');
    if (!selectedWord) {
        showToast('warning', 'Cảnh báo',  'Vui lòng chọn một từ để dịch');
        return;
    }
    
    const wordId = selectedWord.dataset.wordId;
    
    try {
        // Kiểm tra xem bản dịch đã tồn tại chưa
        const existingTranslations = await getTranslateByWordId(sourceWordId, typeId);
        const isDuplicate = existingTranslations.some(trans => 
            trans.trans_word_id === wordId && trans.translate_id !== parseInt(translationId)
        );
        
        if (isDuplicate) {
            showToast('warning', 'Cảnh báo',  'Bản dịch này đã tồn tại!');
            return;
        }
        
        if (translationId) {
            // Cập nhật bản dịch
            await updateTranslate(translationId, sourceWordId, wordId, typeId);
        } else {
            // Thêm bản dịch mới
            await createTranslate(sourceWordId, wordId, typeId);
        }
        
        document.getElementById('addTranslationModal').style.display = 'none';
        openTranslationModal(sourceWordId);
    } catch (error) {
        console.error('Lỗi khi thêm/sửa bản dịch:', error);
        showToast('error', 'Lỗi', 'Không thể thêm/sửa bản dịch. Vui lòng thử lại sau.');
    }
});

// Mở modal sửa bản dịch
async function openEditTranslationModal(translateId, currentWordId, typeId) {
    try {
        // Lấy thông tin từ hiện tại
        const currentWord = await getWordById(currentWordId);
        
        document.getElementById('translationModalTitle').textContent = 'Sửa bản dịch';
        document.getElementById('translationForm').reset();
        document.getElementById('translationId').value = translateId;
        document.getElementById('typeTranslateId').value = typeId;
        document.getElementById('currentWord').value = currentWord.word_name;
        document.getElementById('currentWordDisplay').value = currentWord.word_name;
        document.getElementById('searchTargetWord').value = '';
        
        // Tự động chọn ngôn ngữ dựa vào loại bản dịch
        document.getElementById('searchLanguageId').value = typeId === '1' ? '2' : '1';
        
        // Load danh sách từ để chọn
        await loadTargetWords(typeId);
        
        document.getElementById('addTranslationModal').style.display = 'block';
    } catch (error) {
        console.error('Lỗi khi mở modal sửa:', error);
        showToast('error', 'Lỗi', 'Không thể mở modal sửa. Vui lòng thử lại sau.');
    }
}

// Mở modal thêm bản dịch mới
function openAddTranslationModal() {
    document.getElementById('translationModalTitle').textContent = 'Thêm bản dịch mới';
    document.getElementById('translationForm').reset();
    document.getElementById('translationId').value = '';
    document.getElementById('currentWord').value = '';
    document.getElementById('currentWordDisplay').value = '';
    document.getElementById('searchTargetWord').value = '';
    document.getElementById('translationWordList').innerHTML = '';
    
    // Tự động chọn ngôn ngữ dựa vào loại bản dịch
    const typeId = document.getElementById('typeTranslateId').value;
    document.getElementById('searchLanguageId').value = typeId === '1' ? '2' : '1';
    
    document.getElementById('addTranslationModal').style.display = 'block';
    
    // Load danh sách từ để chọn
    loadTargetWords(document.getElementById('typeTranslateId').value);
}

async function createWord(wordData) {
    const token = getToken();
    if (!token) throw new Error('Unauthorized');

    const body = new URLSearchParams();
    body.append('word_name', wordData.word_name);
    body.append('pronunciation', wordData.pronunciation || '');
    body.append('image', wordData.image || '');
    body.append('sound', wordData.sound || '');
    body.append('language_id', wordData.language_id);

    const res = await fetch(`${WORD_API_BASE}/create`, {
        method: 'POST',
        headers: {
            'Authorization': token,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error('Create word error:', errorText);
        throw new Error('Thêm từ mới thất bại');
    }
    return await res.json();
}

async function updateWord(wordData) {
    const token = getToken();
    if (!token) throw new Error('Unauthorized');

    const body = new URLSearchParams();
    body.append('id', wordData.id);
    body.append('word_name', wordData.word_name);
    body.append('pronunciation', wordData.pronunciation || '');
    body.append('image', wordData.image || '');
    body.append('sound', wordData.sound || '');
    body.append('language_id', wordData.language_id);

    const res = await fetch(`${WORD_API_BASE}/update`, {
        method: 'PUT',
        headers: {
            'Authorization': token,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error('Update word error:', errorText);
        throw new Error('Cập nhật từ thất bại');
    }
    return await res.json();
}

// Hiển thị phân trang cho danh sách từ
function displayTranslationPagination(totalPages, currentPage, typeId, keyword = '') {
    const pagination = document.createElement('div');
    pagination.className = 'pagination';
    
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = i === currentPage ? 'active' : '';
        button.onclick = () => loadTargetWords(typeId, i, keyword);
        pagination.appendChild(button);
    }
    
    const wordList = document.getElementById('translationWordList');
    wordList.appendChild(pagination);
}


