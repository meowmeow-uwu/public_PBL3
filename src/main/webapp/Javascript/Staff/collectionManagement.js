document.addEventListener('DOMContentLoaded', function() {
    const collectionForm = document.getElementById('collectionForm');
    const collectionsList = document.getElementById('collectionsList');
    const addBtn = document.getElementById('addCollectionBtn');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const modal = document.getElementById('collectionModal');
    const modalTitle = document.getElementById('modalTitle');
    const closeBtn = document.querySelector('.close-btn');
    const cancelBtn = document.getElementById('cancelBtn');
    const collectionNameInput = document.getElementById('collectionName');
//    const isPublicCheckbox = document.getElementById('isPublic');
    let editingId = null;
    let allCollections = [];
    let currentCollectionIdForAdd = null;
    let selectedWordIds = [];
    let currentPage = 1, totalPages = 1, currentLang = 1, currentKeyword = '';

    // Load collections
    async function loadCollections() {
        try {
            allCollections = await window.collectionManagementAPI.getAllCollections();
            renderCollections(allCollections);
        } catch (err) {
            collectionsList.innerHTML = `<tr><td colspan="4" class="text-center text-danger">${err.message}</td></tr>`;
        }
    }

    function renderCollections(collections) {
        if (!collections || collections.length === 0) {
            collectionsList.innerHTML = `<tr><td colspan="4" class="text-center">Không có chủ đề nào</td></tr>`;
            return;
        }
        collectionsList.innerHTML = collections.map(col => `
            <tr>
                <td>${col.collectionId}</td>
                <td>${col.name}</td>
                <td><span class="badge bg-success">Công khai</span></td>
                <td>${col.wordCount}</td>
                <td>
                    <button class="btn btn-primary" onclick="editCollection('${col.collectionId}')"><i class="fas fa-edit"></i> Sửa</button>
                    <button class="btn btn-danger" onclick="deleteCollection('${col.collectionId}')"><i class="fas fa-trash"></i> Xoá</button>
                    <button class="btn btn-secondary" onclick="addWord('${col.collectionId}')"><i class="fas fa-plus"></i> Thêm từ</button>
                </td>
            </tr>
        `).join('');
    }

    // Search
    function searchCollections() {
        const keyword = searchInput.value.trim().toLowerCase();
        const filtered = allCollections.filter(col => col.name.toLowerCase().includes(keyword));
        renderCollections(filtered);
    }

    // Modal logic
    addBtn.onclick = function() {
        editingId = null;
        collectionForm.reset();
//        isPublicCheckbox.checked = true;
        modalTitle.textContent = 'Thêm chủ đề mới';
        modal.classList.add('active');
    };
    closeBtn.onclick = cancelBtn.onclick = function() {
        modal.classList.remove('active');
        collectionForm.reset();
        editingId = null;
    };

    // Submit form
    collectionForm.onsubmit = async function(e) {
        e.preventDefault();
        const name = collectionNameInput.value.trim();
        if (!name) return showToast('warning', 'Cảnh báo', 'Nhập tên chủ đề!');
        try {
            if (editingId) {
                await window.collectionManagementAPI.updateCollection(editingId, name, true);
            } else {
                await window.collectionManagementAPI.createCollection(name);
            }
            modal.classList.remove('active');
            loadCollections();
        } catch (err) {
            showToast('error', 'Lỗi',err.message);
        }
    };

    // Edit
    window.editCollection = async function(id) {
        const col = allCollections.find(c => c.collectionId == id);
        if (!col) return;
        editingId = id;
        collectionNameInput.value = col.name;
//        isPublicCheckbox.checked = true;
        modalTitle.textContent = 'Sửa chủ đề';
        modal.classList.add('active');

        // Lấy và hiển thị danh sách từ trong bộ sưu tập (dùng collectionsAPI)
        const wordListDiv = document.getElementById('collectionWordsList');
        if (wordListDiv) {
            wordListDiv.innerHTML = 'Đang tải...';
            try {
                const words = await window.collectionsAPI.getWordsInCollection(id);
                if (!words.length) {
                    wordListDiv.innerHTML = '<div>Chưa có từ nào trong chủ đề này.</div>';
                } else {
                    wordListDiv.innerHTML = `
                        <ul>
                            ${words.map(w => `
                                    <li style="display: flex; justify-content: space-between; align-items: center;">
                                        <div>
                                            <b>${w.word}</b>
                                            ${w.pronunciation ? `<span style="color:#888;"> [${w.pronunciation}]</span>` : ''}
                                        </div>
                                        <button class="btn btn-danger btn-sm" onclick="removeWordFromCollection('${id}', '${w.wordId}')">Xóa</button>
                                </li>
                            `).join('')}
                        </ul>
                    `;
                }
            } catch (err) {
                wordListDiv.innerHTML = `<div class="text-danger">${err.message}</div>`;
            }
        }
    };

    // Delete
    window.deleteCollection = async function(id) {
        if (!confirm('Bạn có chắc muốn xoá?')) return;
        try {
            await window.collectionManagementAPI.deleteCollection(id);
            loadCollections();
        } catch (err) {
            showToast('error', 'Lỗi',err.message);
        }
    };

    // Add word (chuyển trang hoặc mở popup tuỳ bạn)
    window.addWord = function(collectionId) {
        currentCollectionIdForAdd = collectionId;
        selectedWordIds = [];
        currentPage = 1;
        currentLang = 1;
        currentKeyword = '';
        document.getElementById('wordSearchInput').value = '';
        document.getElementById('languageSelect').value = '1';
        showWordsModal();
    };

    function showWordsModal() {
        loadWords();
        document.getElementById('addWordModal').classList.add('active');
    }

    document.getElementById('closeAddWordModal').onclick = function() {
        document.getElementById('addWordModal').classList.remove('active');
    };

    document.getElementById('wordSearchBtn').onclick = function() {
        currentKeyword = document.getElementById('wordSearchInput').value.trim();
        currentLang = document.getElementById('languageSelect').value;
        currentPage = 1;
        loadWords();
    };

    document.getElementById('languageSelect').onchange = function() {
        currentLang = this.value;
        currentPage = 1;
        loadWords();
    };

    async function loadWords() {
        try {
            const data = await getWordsByPageLanguageKeyword(currentPage, 10, currentLang, currentKeyword);
            renderWordsTable(data.words || []);
            renderPagination(data.totalPages || 1);
        } catch (err) {
            document.getElementById('wordsTableContainer').innerHTML = `<div class="text-danger">${err.message}</div>`;
        }
    }

    function renderWordsTable(words) {
        if (!words.length) {
            document.getElementById('wordsTableContainer').innerHTML = '<div>Không có từ nào.</div>';
            return;
        }
        document.getElementById('wordsTableContainer').innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Từ</th>
                        <th>Phát âm</th>
                        <th>Ngôn ngữ</th>
                        <th>Ảnh</th>
                    </tr>
                </thead>
                <tbody>
                    ${words.map(w => `
                        <tr>
                            <td><input type="checkbox" class="word-checkbox" value="${w.word.word_id}" ${selectedWordIds.includes(w.word.word_id) ? 'checked' : ''}></td>
                            <td>${w.word.word_name}</td>
                            <td>${w.word.pronunciation || ''}</td>
                            <td>${w.word.language_id == 1 ? 'EN' : 'VI'}</td>
                            <td>${w.word.image ? `<img src="${w.word.image}" style="width:40px;">` : ''}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        document.querySelectorAll('.word-checkbox').forEach(cb => {
            cb.onchange = function() {
                const id = Number(this.value);
                if (this.checked) {
                    if (!selectedWordIds.includes(id)) selectedWordIds.push(id);
                } else {
                    selectedWordIds = selectedWordIds.filter(x => x !== id);
                }
            };
        });
    }

    function renderPagination(total) {
        totalPages = total;
        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="btn btn-sm ${i === currentPage ? 'btn-primary' : ''}" onclick="gotoPage(${i})">${i}</button> `;
        }
        document.getElementById('pagination').innerHTML = html;
    }

    window.gotoPage = function(page) {
        currentPage = page;
        loadWords();
    };

    document.getElementById('addWordsToCollectionBtn').onclick = async function() {
        if (!selectedWordIds.length) return showToast('warning', 'Cảnh báo', 'Chọn ít nhất 1 từ!');
        try {
            for (const wordId of selectedWordIds) {
                await window.collectionManagementAPI.addWordToCollection(currentCollectionIdForAdd, wordId);
            }
            showToast('success', 'Thành công!',  'Đã thêm từ vào chủ đề!');
            loadCollections();
            document.getElementById('addWordModal').classList.remove('active');
        } catch (err) {
            showToast('error', 'Lỗi','Lỗi khi thêm từ: ' + err.message);
        }
    };

    
    // Search event
    searchBtn.onclick = searchCollections;
    searchInput.onkeypress = function(e) { if (e.key === 'Enter') searchCollections(); };

    // Delete word from system
    window.removeWordFromCollection = async function(collectionId ,wordId) {
        if (!confirm('Bạn có chắc muốn xóa từ này khỏi hệ thống?')) return;
        try {
            await  window.collectionManagementAPI.deleteWordFromCollection(collectionId ,wordId);
            showToast('success', 'Thành công!',  'Đã xóa từ khỏi hệ thống!');
            // Sau khi xóa, reload lại danh sách từ trong bộ sưu tập
            window.editCollection(collectionId);
        } catch (err) {
            showToast('error', 'Lỗi','Lỗi khi xóa từ khỏi hệ thống: ' + err.message);
        }
    };

    // Init
    loadCollections();
});
