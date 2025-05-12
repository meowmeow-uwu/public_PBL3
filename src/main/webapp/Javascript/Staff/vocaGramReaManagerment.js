// Javascript/Staff/vocaGramReaManagerment.js
// Dữ liệu mẫu
let vocabulary = [];
let vocabPage = 1;
let vocabSize = 10;
let vocabTotal = 0;
let vocabKeyword = '';
let vocabLang = 1; // hoặc lấy từ select nếu có

let grammar = [
    {
        id: 1,
        name: "Thì hiện tại đơn",
        structure: "S + V(s/es) + O",
        description: "Dùng để nói về thói quen, sự thật",
        example: "She walks to school every day.",
        level: "A1",
        course: "A1 - Ngữ pháp 1"
    }
];

let readings = [
    {
        id: 1,
        title: "The Life of a Farmer",
        content: "<p>Farming is a difficult but rewarding job...</p>",
        questions: [
            {
                question: "What does the farmer do every day?",
                options: ["A. Sleep", "B. Work in the field", "C. Watch TV", "D. Go shopping"],
                answer: "B"
            }
        ],
        level: "B1",
        topic: "Nghề nghiệp",
        course: "B1 - Reading Unit 2"
    }
];

let currentTab = 'vocabulary';

async function loadVocabulary() {
    try {
        const data = await getWordList({ page: vocabPage, size: vocabSize, language_id: vocabLang, keyword: vocabKeyword });
        vocabulary = data.words || data; // Tùy backend trả về
        vocabTotal = data.total || vocabulary.length;
        renderVocabularyTable();
        renderVocabPagination();
    } catch (e) {
        alert(e.message);
    }
}

function renderVocabularyTable() {
    const tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = vocabulary.map((v, idx) => `
        <tr>
            <td>${(vocabPage - 1) * vocabSize + idx + 1}</td>
            <td>${v.word}</td>
            <td>${v.pronunciation || ''}</td>
            <td>${v.meaning}</td>
            <td>${v.type}</td>
            <td>${v.example || ''}</td>
            <td>${v.level}</td>
            <td>
                <button class="action-btn" title="Chỉnh sửa" onclick="showEdit('vocabulary', ${v.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn" title="Xóa" onclick="deleteItem('vocabulary', ${v.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderVocabPagination() {
    const totalPages = Math.ceil(vocabTotal / vocabSize);
    // Thêm HTML phân trang vào đâu đó, ví dụ:
    // <div id="vocabPagination"></div>
    const pag = document.getElementById('vocabPagination');
    if (!pag) return;
    let html = '';
    html += `<button onclick="changeVocabPage(-1)" ${vocabPage === 1 ? 'disabled' : ''}>Trước</button>`;
    html += ` Trang ${vocabPage} / ${totalPages} `;
    html += `<button onclick="changeVocabPage(1)" ${vocabPage === totalPages ? 'disabled' : ''}>Sau</button>`;
    pag.innerHTML = html;
}

function changeVocabPage(delta) {
    const totalPages = Math.ceil(vocabTotal / vocabSize);
    vocabPage += delta;
    if (vocabPage < 1) vocabPage = 1;
    if (vocabPage > totalPages) vocabPage = totalPages;
    loadVocabulary();
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    renderTable();
}

function renderTable() {
    const tbody = document.querySelector('#dataTable tbody');
    let html = '';

    switch(currentTab) {
        case 'vocabulary':
            loadVocabulary();
            break;

        case 'grammar':
            html = grammar.map((g, idx) => `
                <tr>
                    <td>${idx + 1}</td>
                    <td>${g.name}</td>
                    <td>${g.structure}</td>
                    <td>${g.description}</td>
                    <td>${g.level}</td>
                    <td>
                        <button class="action-btn" title="Chỉnh sửa" onclick="showEdit('grammar', ${g.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" title="Xóa" onclick="deleteItem('grammar', ${g.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
            break;

        case 'reading':
            html = readings.map((r, idx) => `
                <tr>
                    <td>${idx + 1}</td>
                    <td>${r.title}</td>
                    <td>${r.level}</td>
                    <td>${r.topic}</td>
                    <td>${r.questions.length}</td>
                    <td>
                        <button class="action-btn" title="Chỉnh sửa" onclick="showEdit('reading', ${r.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" title="Xóa" onclick="deleteItem('reading', ${r.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
            break;
    }

    tbody.innerHTML = html;
}

function showAdd() {
    let content = '';
    switch(currentTab) {
        case 'vocabulary':
            content = `
                <h2>Thêm từ vựng mới</h2>
                <form onsubmit="saveAdd(event)">
                    <div class="form-group">
                        <label>Từ vựng:</label>
                        <input type="text" id="addWord" required>
                    </div>
                    <div class="form-group">
                        <label>Phiên âm:</label>
                        <input type="text" id="addPronunciation" required>
                    </div>
                    <div class="form-group">
                        <label>Loại từ:</label>
                        <select id="addType" required>
                            <option value="danh từ">Danh từ</option>
                            <option value="động từ">Động từ</option>
                            <option value="tính từ">Tính từ</option>
                            <option value="trạng từ">Trạng từ</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Nghĩa tiếng Việt:</label>
                        <input type="text" id="addMeaning" required>
                    </div>
                    <div class="form-group">
                        <label>Ví dụ:</label>
                        <textarea id="addExample" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Cấp độ:</label>
                        <select id="addLevel" required>
                            <option value="A1">A1</option>
                            <option value="A2">A2</option>
                            <option value="B1">B1</option>
                            <option value="B2">B2</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Khóa học:</label>
                        <input type="text" id="addCourse" required>
                    </div>
                    <button type="submit" class="add-btn">Thêm từ vựng</button>
                </form>
            `;
            break;

        case 'grammar':
            content = `
                <h2>Thêm ngữ pháp mới</h2>
                <form onsubmit="saveAdd(event)">
                    <div class="form-group">
                        <label>Tên mẫu ngữ pháp:</label>
                        <input type="text" id="addName" required>
                    </div>
                    <div class="form-group">
                        <label>Cấu trúc:</label>
                        <input type="text" id="addStructure" required>
                    </div>
                    <div class="form-group">
                        <label>Mô tả:</label>
                        <textarea id="addDescription" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Ví dụ:</label>
                        <textarea id="addExample" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Cấp độ:</label>
                        <select id="addLevel" required>
                            <option value="A1">A1</option>
                            <option value="A2">A2</option>
                            <option value="B1">B1</option>
                            <option value="B2">B2</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Khóa học:</label>
                        <input type="text" id="addCourse" required>
                    </div>
                    <button type="submit" class="add-btn">Thêm ngữ pháp</button>
                </form>
            `;
            break;

        case 'reading':
            content = `
                <h2>Thêm bài đọc mới</h2>
                <form onsubmit="saveAdd(event)">
                    <div class="form-group">
                        <label>Tiêu đề:</label>
                        <input type="text" id="addTitle" required>
                    </div>
                    <div class="form-group">
                        <label>Nội dung:</label>
                        <textarea id="addContent" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Cấp độ:</label>
                        <select id="addLevel" required>
                            <option value="A1">A1</option>
                            <option value="A2">A2</option>
                            <option value="B1">B1</option>
                            <option value="B2">B2</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Chủ đề:</label>
                        <input type="text" id="addTopic" required>
                    </div>
                    <div class="form-group">
                        <label>Khóa học:</label>
                        <input type="text" id="addCourse" required>
                    </div>
                    <div class="questions-container">
                        <h3>Câu hỏi</h3>
                        <div id="questionsList"></div>
                        <button type="button" onclick="addQuestion()" class="add-btn">Thêm câu hỏi</button>
                    </div>
                    <button type="submit" class="add-btn">Thêm bài đọc</button>
                </form>
            `;
            break;
    }

    document.getElementById('editContent').innerHTML = content;
    document.getElementById('editModal').style.display = 'flex';
}

function addQuestion() {
    const questionsList = document.getElementById('questionsList');
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-item';
    questionDiv.innerHTML = `
        <div class="form-group">
            <label>Câu hỏi:</label>
            <input type="text" name="question" required>
        </div>
        <div class="form-group">
            <label>Đáp án:</label>
            <div class="options">
                <input type="text" name="optionA" placeholder="A" required>
                <input type="text" name="optionB" placeholder="B" required>
                <input type="text" name="optionC" placeholder="C" required>
                <input type="text" name="optionD" placeholder="D" required>
            </div>
        </div>
        <div class="form-group">
            <label>Đáp án đúng:</label>
            <select name="correctAnswer" required>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
            </select>
        </div>
        <button type="button" onclick="this.parentElement.remove()" class="action-btn">
            <i class="fas fa-trash"></i> Xóa câu hỏi
        </button>
    `;
    questionsList.appendChild(questionDiv);
}

function saveAdd(e) {
    e.preventDefault();
    let newItem;

    switch(currentTab) {
        case 'vocabulary':
            const vocabularyData = {
                word: document.getElementById('addWord').value,
                pronunciation: document.getElementById('addPronunciation').value,
                type: document.getElementById('addType').value,
                meaning: document.getElementById('addMeaning').value,
                example: document.getElementById('addExample').value,
                level: document.getElementById('addLevel').value,
                course: document.getElementById('addCourse').value
            };

            // Gọi API thêm từ vựng
            createWord(vocabLang, vocabularyData)
                .then(response => {
                    closeModal('editModal');
                    loadVocabulary();
                })
                .catch(error => {
                    alert('Error adding vocabulary: ' + error.message);
                });
            return;

        case 'grammar':
            newItem = {
                id: grammar.length + 1,
                name: document.getElementById('addName').value,
                structure: document.getElementById('addStructure').value,
                description: document.getElementById('addDescription').value,
                example: document.getElementById('addExample').value,
                level: document.getElementById('addLevel').value,
                course: document.getElementById('addCourse').value
            };
            grammar.push(newItem);
            break;

        case 'reading':
            const questions = Array.from(document.querySelectorAll('.question-item')).map(q => ({
                question: q.querySelector('[name="question"]').value,
                options: [
                    q.querySelector('[name="optionA"]').value,
                    q.querySelector('[name="optionB"]').value,
                    q.querySelector('[name="optionC"]').value,
                    q.querySelector('[name="optionD"]').value
                ],
                answer: q.querySelector('[name="correctAnswer"]').value
            }));

            newItem = {
                id: readings.length + 1,
                title: document.getElementById('addTitle').value,
                content: document.getElementById('addContent').value,
                questions: questions,
                level: document.getElementById('addLevel').value,
                topic: document.getElementById('addTopic').value,
                course: document.getElementById('addCourse').value
            };
            readings.push(newItem);
            break;
    }

    closeModal('editModal');
    renderTable();
}

function showEdit(type, id) {
    let item;
    switch(type) {
        case 'vocabulary':
            item = vocabulary.find(v => v.id === id);
            break;
        case 'grammar':
            item = grammar.find(g => g.id === id);
            break;
        case 'reading':
            item = readings.find(r => r.id === id);
            break;
    }

    if (!item) return;

    let content = '';
    switch(type) {
        case 'vocabulary':
            content = `
                <h2>Chỉnh sửa từ vựng</h2>
                <form onsubmit="saveEdit(event, ${id})">
                    <div class="form-group">
                        <label>Từ vựng:</label>
                        <input type="text" id="editWord" value="${item.word}" required>
                    </div>
                    <div class="form-group">
                        <label>Phiên âm:</label>
                        <input type="text" id="editPronunciation" value="${item.pronunciation}" required>
                    </div>
                    <div class="form-group">
                        <label>Loại từ:</label>
                        <select id="editType" required>
                            <option value="danh từ" ${item.type === 'danh từ' ? 'selected' : ''}>Danh từ</option>
                            <option value="động từ" ${item.type === 'động từ' ? 'selected' : ''}>Động từ</option>
                            <option value="tính từ" ${item.type === 'tính từ' ? 'selected' : ''}>Tính từ</option>
                            <option value="trạng từ" ${item.type === 'trạng từ' ? 'selected' : ''}>Trạng từ</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Nghĩa tiếng Việt:</label>
                        <input type="text" id="editMeaning" value="${item.meaning}" required>
                    </div>
                    <div class="form-group">
                        <label>Ví dụ:</label>
                        <textarea id="editExample" required>${item.example}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Cấp độ:</label>
                        <select id="editLevel" required>
                            <option value="A1" ${item.level === 'A1' ? 'selected' : ''}>A1</option>
                            <option value="A2" ${item.level === 'A2' ? 'selected' : ''}>A2</option>
                            <option value="B1" ${item.level === 'B1' ? 'selected' : ''}>B1</option>
                            <option value="B2" ${item.level === 'B2' ? 'selected' : ''}>B2</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Khóa học:</label>
                        <input type="text" id="editCourse" value="${item.course}" required>
                    </div>
                    <button type="submit" class="add-btn">Lưu thay đổi</button>
                </form>
            `;
            break;

        case 'grammar':
            content = `
                <h2>Chỉnh sửa ngữ pháp</h2>
                <form onsubmit="saveEdit(event, ${id})">
                    <div class="form-group">
                        <label>Tên mẫu ngữ pháp:</label>
                        <input type="text" id="editName" value="${item.name}" required>
                    </div>
                    <div class="form-group">
                        <label>Cấu trúc:</label>
                        <input type="text" id="editStructure" value="${item.structure}" required>
                    </div>
                    <div class="form-group">
                        <label>Mô tả:</label>
                        <textarea id="editDescription" required>${item.description}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Ví dụ:</label>
                        <textarea id="editExample" required>${item.example}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Cấp độ:</label>
                        <select id="editLevel" required>
                            <option value="A1" ${item.level === 'A1' ? 'selected' : ''}>A1</option>
                            <option value="A2" ${item.level === 'A2' ? 'selected' : ''}>A2</option>
                            <option value="B1" ${item.level === 'B1' ? 'selected' : ''}>B1</option>
                            <option value="B2" ${item.level === 'B2' ? 'selected' : ''}>B2</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Khóa học:</label>
                        <input type="text" id="editCourse" value="${item.course}" required>
                    </div>
                    <button type="submit" class="add-btn">Lưu thay đổi</button>
                </form>
            `;
            break;

        case 'reading':
            content = `
                <h2>Chỉnh sửa bài đọc</h2>
                <form onsubmit="saveEdit(event, ${id})">
                    <div class="form-group">
                        <label>Tiêu đề:</label>
                        <input type="text" id="editTitle" value="${item.title}" required>
                    </div>
                    <div class="form-group">
                        <label>Nội dung:</label>
                        <textarea id="editContent" required>${item.content}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Cấp độ:</label>
                        <select id="editLevel" required>
                            <option value="A1" ${item.level === 'A1' ? 'selected' : ''}>A1</option>
                            <option value="A2" ${item.level === 'A2' ? 'selected' : ''}>A2</option>
                            <option value="B1" ${item.level === 'B1' ? 'selected' : ''}>B1</option>
                            <option value="B2" ${item.level === 'B2' ? 'selected' : ''}>B2</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Chủ đề:</label>
                        <input type="text" id="editTopic" value="${item.topic}" required>
                    </div>
                    <div class="form-group">
                        <label>Khóa học:</label>
                        <input type="text" id="editCourse" value="${item.course}" required>
                    </div>
                    <div class="questions-container">
                        <h3>Câu hỏi</h3>
                        <div id="questionsList">
                            ${item.questions.map((q, idx) => `
                                <div class="question-item">
                                    <div class="form-group">
                                        <label>Câu hỏi:</label>
                                        <input type="text" name="question" value="${q.question}" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Đáp án:</label>
                                        <div class="options">
                                            <input type="text" name="optionA" value="${q.options[0]}" placeholder="A" required>
                                            <input type="text" name="optionB" value="${q.options[1]}" placeholder="B" required>
                                            <input type="text" name="optionC" value="${q.options[2]}" placeholder="C" required>
                                            <input type="text" name="optionD" value="${q.options[3]}" placeholder="D" required>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label>Đáp án đúng:</label>
                                        <select name="correctAnswer" required>
                                            <option value="A" ${q.answer === 'A' ? 'selected' : ''}>A</option>
                                            <option value="B" ${q.answer === 'B' ? 'selected' : ''}>B</option>
                                            <option value="C" ${q.answer === 'C' ? 'selected' : ''}>C</option>
                                            <option value="D" ${q.answer === 'D' ? 'selected' : ''}>D</option>
                                        </select>
                                    </div>
                                    <button type="button" onclick="this.parentElement.remove()" class="action-btn">
                                        <i class="fas fa-trash"></i> Xóa câu hỏi
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                        <button type="button" onclick="addQuestion()" class="add-btn">Thêm câu hỏi</button>
                    </div>
                    <button type="submit" class="add-btn">Lưu thay đổi</button>
                </form>
            `;
            break;
    }

    document.getElementById('editContent').innerHTML = content;
    document.getElementById('editModal').style.display = 'flex';
}

function saveEdit(e, id) {
    e.preventDefault();
    let item;

    switch(currentTab) {
        case 'vocabulary':
            item = vocabulary.find(v => v.id === id);
            if (item) {
                item.word = document.getElementById('editWord').value;
                item.pronunciation = document.getElementById('editPronunciation').value;
                item.type = document.getElementById('editType').value;
                item.meaning = document.getElementById('editMeaning').value;
                item.example = document.getElementById('editExample').value;
                item.level = document.getElementById('editLevel').value;
                item.course = document.getElementById('editCourse').value;
            }
            break;

        case 'grammar':
            item = grammar.find(g => g.id === id);
            if (item) {
                item.name = document.getElementById('editName').value;
                item.structure = document.getElementById('editStructure').value;
                item.description = document.getElementById('editDescription').value;
                item.example = document.getElementById('editExample').value;
                item.level = document.getElementById('editLevel').value;
                item.course = document.getElementById('editCourse').value;
            }
            break;

        case 'reading':
            item = readings.find(r => r.id === id);
            if (item) {
                const questions = Array.from(document.querySelectorAll('.question-item')).map(q => ({
                    question: q.querySelector('[name="question"]').value,
                    options: [
                        q.querySelector('[name="optionA"]').value,
                        q.querySelector('[name="optionB"]').value,
                        q.querySelector('[name="optionC"]').value,
                        q.querySelector('[name="optionD"]').value
                    ],
                    answer: q.querySelector('[name="correctAnswer"]').value
                }));

                item.title = document.getElementById('editTitle').value;
                item.content = document.getElementById('editContent').value;
                item.questions = questions;
                item.level = document.getElementById('editLevel').value;
                item.topic = document.getElementById('editTopic').value;
                item.course = document.getElementById('editCourse').value;
            }
            break;
    }

    closeModal('editModal');
    renderTable();
}

async function deleteItem(type, id) {
    if (type === 'vocabulary') {
        if (!confirm('Bạn chắc chắn muốn xóa từ này?')) return;
        try {
            await deleteWord(id);
            loadVocabulary();
        } catch (e) {
            alert(e.message);
        }
    } else {
        if (!confirm('Bạn chắc chắn muốn xóa mục này?')) return;

        switch(type) {
            case 'grammar':
                const gIdx = grammar.findIndex(g => g.id === id);
                if (gIdx > -1) grammar.splice(gIdx, 1);
                break;
            case 'reading':
                const rIdx = readings.findIndex(r => r.id === id);
                if (rIdx > -1) readings.splice(rIdx, 1);
                break;
        }

        renderTable();
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function searchItems() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const level = document.getElementById('levelFilter').value;
    const type = document.getElementById('typeFilter').value;

    let filtered;
    switch(currentTab) {
        case 'vocabulary':
            filtered = vocabulary.filter(v =>
                v.word.toLowerCase().includes(keyword) &&
                (level === "" || v.level === level) &&
                (type === "" || v.type === type)
            );
            break;
        case 'grammar':
            filtered = grammar.filter(g =>
                g.name.toLowerCase().includes(keyword) &&
                (level === "" || g.level === level)
            );
            break;
        case 'reading':
            filtered = readings.filter(r =>
                r.title.toLowerCase().includes(keyword) &&
                (level === "" || r.level === level) &&
                (type === "" || r.topic === type)
            );
            break;
    }

    renderTable(filtered);
}

// Khởi tạo trang
document.addEventListener('DOMContentLoaded', () => {
    switchTab('vocabulary');
});
