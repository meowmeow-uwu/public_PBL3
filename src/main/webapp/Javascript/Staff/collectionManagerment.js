// Dữ liệu mẫu
let collections = [
    {id: 1, topic: "Trái cây", type: "Từ vựng", desc: "Từ về các loại trái cây", count: 25, createdBy: "admin"},
    {id: 2, topic: "Giao tiếp cơ bản", type: "Ngữ pháp", desc: "Mẫu câu giao tiếp đơn giản", count: 10, createdBy: "staff1"},
    {id: 3, topic: "Chuyến phiêu lưu", type: "Reading", desc: "Truyện ngắn thú vị", count: 1, createdBy: "admin"}
];
// Dữ liệu từ vựng mẫu để chọn
let vocabularyList = [
    {id: 1, word: "apple", meaning: "quả táo", type: "danh từ", level: "A1"},
    {id: 2, word: "school", meaning: "trường học", type: "danh từ", level: "A1"},
    {id: 3, word: "teacher", meaning: "giáo viên", type: "danh từ", level: "A1"},
    {id: 4, word: "elephant", meaning: "con voi", type: "danh từ", level: "A1"},
    {id: 5, word: "run", meaning: "chạy", type: "động từ", level: "A2"}
];
let selectedWords = [];
let editingId = null;
const currentUser = "admin"; // hoặc "staff1" để test phân quyền
let currentPage = 1;
const itemsPerPage = 10;

function renderTable() {
    const tbody = document.getElementById('collectionTableBody');
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const type = document.getElementById('typeFilter').value;
    let filtered = collections.filter(c =>
        (c.topic.toLowerCase().includes(keyword)) &&
        (type === "" || c.type === type)
    );
    tbody.innerHTML = filtered.map((c, idx) => `
        <tr>
            <td>${idx+1}</td>
            <td>${c.topic}</td>
            <td>${c.type}</td>
            <td>${c.desc}</td>
            <td>${c.count} ${c.type === "Reading" ? "bài đọc" : c.type === "Ngữ pháp" ? "mẫu" : "từ"}</td>
            <td>
                <button class="action-btn" title="Xem danh sách" onclick="showVocabularyList(${c.id})">
                    <i class="fas fa-list"></i>
                </button>
                <button class="action-btn" title="Sửa" onclick="showEditForm(${c.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn" title="Xoá" onclick="deleteCollection(${c.id})"
                    ${currentUser !== "admin" && c.createdBy !== currentUser ? "disabled style='opacity:0.5;cursor:not-allowed;'" : ""}>
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}
window.renderTable = renderTable;

document.addEventListener('DOMContentLoaded', function() {
    renderTable();
    document.getElementById('searchInput').addEventListener('input', renderTable);
    document.getElementById('typeFilter').addEventListener('change', renderTable);
});

function showAddForm() {
    editingId = null;
    selectedWords = [];
    showForm("add");
}
function showEditForm(id) {
    editingId = id;
    selectedWords = [ ...vocabularyList.filter(w => w.id <= 2) ]; // demo: lấy 2 từ đầu
    showForm("edit", collections.find(c => c.id === id));
}
function showForm(mode, data = {}) {
    let topic = data.topic || "";
    let type = data.type || "Từ vựng";
    let desc = data.desc || "";
    let wordTable = "";
    if(type === "Từ vựng") {
        wordTable = `
        <div class="form-group">
            <label>Chọn từ vựng thêm vào bộ</label>
            <input type="text" id="wordSearch" placeholder="Tìm từ, nghĩa, loại từ, cấp độ..." oninput="renderWordSelectTable()">
            <table class="word-select-table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Từ</th>
                        <th>Nghĩa tiếng Việt</th>
                        <th>Loại từ</th>
                        <th>Cấp độ</th>
                    </tr>
                </thead>
                <tbody id="wordSelectTableBody"></tbody>
            </table>
        </div>
        <div class="form-group">
            <label>Danh sách từ đã chọn</label>
            <div class="selected-words-list" id="selectedWordsList"></div>
        </div>
        `;
    }
    document.getElementById('modalFormContent').innerHTML = `
        <h2>${mode === "add" ? "Thêm" : "Sửa"} bộ sưu tập</h2>
        <form onsubmit="saveCollection(event)">
            <div class="form-group">
                <label>Tên bộ sưu tập</label>
                <input type="text" id="topicInput" value="${topic}" required>
            </div>
            <div class="form-group">
                <label>Loại bộ sưu tập</label>
                <select id="typeInput" onchange="renderFormTypeFields()" required>
                    <option value="Từ vựng" ${type === "Từ vựng" ? "selected" : ""}>Từ vựng</option>
                    <option value="Ngữ pháp" ${type === "Ngữ pháp" ? "selected" : ""}>Ngữ pháp</option>
                    <option value="Reading" ${type === "Reading" ? "selected" : ""}>Reading</option>
                </select>
            </div>
            <div class="form-group">
                <label>Mô tả ngắn</label>
                <textarea id="descInput" required>${desc}</textarea>
            </div>
            <div id="typeFields">${wordTable}</div>
            <div style="margin-top:1.2rem;">
                <button type="submit" class="btn-primary">Lưu</button>
                <button type="button" onclick="closeModal()" class="btn-cancel">Huỷ</button>
            </div>
        </form>
    `;
    document.getElementById('collectionModal').style.display = 'flex';
    if(type === "Từ vựng") {
        renderWordSelectTable();
        renderSelectedWords();
    }
}
window.showAddForm = showAddForm;
window.showEditForm = showEditForm;

function renderFormTypeFields() {
    const type = document.getElementById('typeInput').value;
    let wordTable = "";
    if(type === "Từ vựng") {
        wordTable = `
        <div class="form-group">
            <label>Chọn từ vựng thêm vào bộ</label>
            <input type="text" id="wordSearch" placeholder="Tìm từ, nghĩa, loại từ, cấp độ..." oninput="renderWordSelectTable()">
            <table class="word-select-table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Từ</th>
                        <th>Nghĩa tiếng Việt</th>
                        <th>Loại từ</th>
                        <th>Cấp độ</th>
                    </tr>
                </thead>
                <tbody id="wordSelectTableBody"></tbody>
            </table>
        </div>
        <div class="form-group">
            <label>Danh sách từ đã chọn</label>
            <div class="selected-words-list" id="selectedWordsList"></div>
        </div>
        `;
    }
    document.getElementById('typeFields').innerHTML = wordTable;
    if(type === "Từ vựng") {
        renderWordSelectTable();
        renderSelectedWords();
    }
}
window.renderFormTypeFields = renderFormTypeFields;

function renderWordSelectTable() {
    const keyword = (document.getElementById('wordSearch')?.value || "").toLowerCase();
    const tbody = document.getElementById('wordSelectTableBody');
    if(!tbody) return;
    let filtered = vocabularyList.filter(w =>
        w.word.toLowerCase().includes(keyword) ||
        w.meaning.toLowerCase().includes(keyword) ||
        w.type.toLowerCase().includes(keyword) ||
        w.level.toLowerCase().includes(keyword)
    );
    tbody.innerHTML = filtered.map(w => `
        <tr>
            <td>
                <input type="checkbox" ${selectedWords.some(sw => sw.id === w.id) ? "checked" : ""} 
                    onchange="toggleSelectWord(${w.id})">
            </td>
            <td>${w.word}</td>
            <td>${w.meaning}</td>
            <td>${w.type}</td>
            <td>${w.level}</td>
        </tr>
    `).join('');
}
window.renderWordSelectTable = renderWordSelectTable;

function toggleSelectWord(id) {
    const word = vocabularyList.find(w => w.id === id);
    if(!word) return;
    const idx = selectedWords.findIndex(w => w.id === id);
    if(idx > -1) selectedWords.splice(idx, 1);
    else selectedWords.push(word);
    renderWordSelectTable();
    renderSelectedWords();
}
window.toggleSelectWord = toggleSelectWord;

function renderSelectedWords() {
    const list = document.getElementById('selectedWordsList');
    if(!list) return;
    list.innerHTML = selectedWords.map(w => `
        <span class="selected-word">
            ${w.word}
            <span class="remove-word" onclick="removeSelectedWord(${w.id})">&times;</span>
        </span>
    `).join('');
}
window.renderSelectedWords = renderSelectedWords;

function removeSelectedWord(id) {
    const idx = selectedWords.findIndex(w => w.id === id);
    if(idx > -1) selectedWords.splice(idx, 1);
    renderWordSelectTable();
    renderSelectedWords();
}
window.removeSelectedWord = removeSelectedWord;

function saveCollection(e) {
    e.preventDefault();
    const topic = document.getElementById('topicInput').value.trim();
    const type = document.getElementById('typeInput').value;
    const desc = document.getElementById('descInput').value.trim();
    let count = type === "Từ vựng" ? selectedWords.length : (type === "Ngữ pháp" ? 10 : 1); // demo
    if(editingId) {
        const c = collections.find(c => c.id === editingId);
        c.topic = topic; c.type = type; c.desc = desc; c.count = count;
    } else {
        collections.push({
            id: collections.length+1, topic, type, desc, count, createdBy: currentUser
        });
    }
    closeModal();
    renderTable();
}
window.saveCollection = saveCollection;

function deleteCollection(id) {
    const c = collections.find(c => c.id === id);
    if(currentUser !== "admin" && c.createdBy !== currentUser) return;
    if(confirm("Bạn chắc chắn muốn xoá bộ sưu tập này?")) {
        const idx = collections.findIndex(c => c.id === id);
        if(idx > -1) collections.splice(idx, 1);
        renderTable();
    }
}
window.deleteCollection = deleteCollection;

function closeModal() {
    document.getElementById('collectionModal').style.display = 'none';
}
window.closeModal = closeModal;

function showVocabularyList(collectionId) {
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return;

    // Get vocabulary items for this collection (in real app, this would be an API call)
    const vocabItems = vocabularyList.filter(v => v.collectionId === collectionId);
    const totalPages = Math.ceil(vocabItems.length / itemsPerPage);
    
    document.getElementById('modalFormContent').innerHTML = `
        <h2>Danh sách từ vựng - ${collection.topic}</h2>
        <div class="vocabulary-list-container">
            <table class="vocabulary-list-table">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Từ</th>
                        <th>Nghĩa</th>
                        <th>Loại từ</th>
                        <th>Cấp độ</th>
                    </tr>
                </thead>
                <tbody id="vocabularyListBody"></tbody>
            </table>
            <div class="pagination">
                <button onclick="changePage(1)" ${currentPage === 1 ? 'disabled' : ''}>«</button>
                <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>‹</button>
                <span>Trang ${currentPage} / ${totalPages}</span>
                <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>›</button>
                <button onclick="changePage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>»</button>
            </div>
        </div>
        <div style="margin-top:1.2rem;">
            <button type="button" onclick="closeModal()" class="btn-cancel">Đóng</button>
        </div>
    `;
    
    document.getElementById('collectionModal').style.display = 'flex';
    renderVocabularyListPage(vocabItems);
}

function renderVocabularyListPage(vocabItems) {
    const tbody = document.getElementById('vocabularyListBody');
    if (!tbody) return;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = vocabItems.slice(startIndex, endIndex);

    tbody.innerHTML = pageItems.map((item, idx) => `
        <tr>
            <td>${startIndex + idx + 1}</td>
            <td>${item.word}</td>
            <td>${item.meaning}</td>
            <td>${item.type}</td>
            <td>${item.level}</td>
        </tr>
    `).join('');
}

function changePage(newPage) {
    currentPage = newPage;
    const collectionId = parseInt(document.querySelector('.vocabulary-list-container').dataset.collectionId);
    showVocabularyList(collectionId);
}
