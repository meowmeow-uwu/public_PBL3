// Biến cục bộ cho việc phân trang và tìm kiếm
let currentPage = 1;
const pageSize = 10; // Số lượng người dùng trên mỗi trang
let totalPages = 1;
let currentKeyword = "";

async function fetchAPI(url, options = {}) {
    const currentToken = window.USER_API.getBearerToken();
    // 1. Lấy headers tùy chỉnh từ options, mặc định là đối tượng rỗng
    const customHeaders = options.headers || {};

    // 2. Tạo một bản sao của options ĐỂ XÓA headers đi
    const otherOptions = { ...options };
    delete otherOptions.headers; // Xóa key 'headers' để nó không ghi đè khi spread

    const response = await fetch(`${window.APP_CONFIG.API_BASE_URL}${url}`, {
        // 4. Spread các options khác (method, body,...)
        ...otherOptions,
        // 3. Xây dựng headers bằng cách merge
        headers: {
            'Authorization': currentToken,
            'Content-Type': 'application/json',
            ...customHeaders, // Merge các headers tùy chỉnh vào đây
        },
    });

    // 1. Xử lý các phản hồi lỗi (!response.ok)
    if (!response.ok) {
        let errorData = { error: `HTTP error! status: ${response.status}` }; // Default error
        try {
            // Cố gắng đọc lỗi dưới dạng JSON (vì nhiều API trả lỗi JSON)
            const errorJson = await response.json();
            errorData = errorJson || errorData;
        } catch (e) {
            try {
                // Nếu không phải JSON, thử đọc text
                const errorText = await response.text();
                errorData = { error: errorText || errorData.error };
            } catch (textError) {
                // Nếu không đọc được gì, giữ lỗi default
            }
        }
        // Ném lỗi với thông điệp rõ ràng
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    }

    // 2. Xử lý các phản hồi thành công (response.ok)

    // Nếu là 204 No Content, trả về null
    if (response.status === 204) {
        return null;
    }

    // Lấy Content-Type header
    const contentType = response.headers.get("content-type");

    // Nếu header chỉ ra là JSON, thì parse JSON
    if (contentType && contentType.includes("application/json")) {
        try {
            return await response.json();
        } catch (jsonError) {
            // Xử lý trường hợp header nói là JSON nhưng body rỗng hoặc lỗi
            console.warn("Server indicated JSON, but parsing failed. Body might be empty.", jsonError);
            return null; // Hoặc trả về một giá trị mặc định khác
        }
    }
    // Nếu không phải JSON (hoặc không có header), thì trả về text
    else {
        try {
            return await response.text();
        } catch (textError) {
            console.error("Could not read response body as text.", textError);
            throw new Error("Failed to read server response.");
        }
    }
}

// State variables
let currentView = 'topics';
let currentTopicId = null;
let currentTopicName = '';
let currentSubTopicId = null;
let currentSubTopicName = '';
let currentPostId = null;
let currentPostName = '';
let currentExamId = null;
let currentExamName = '';
let currentQuestionId = null;
let currentQuestionContent = '';
let currentContentListType = 'posts';
let currentEditingId = null;
let currentEntityType = '';
let currentParentId = null;
let currentDataCache = [];
let currentExamIdForQuestionsManagement = null;

// DOM Elements
let managementTitle, breadcrumbsContainer, searchInput, searchBtn, addNewBtn,
    dataTableThead, dataTableTbody, paginationContainer, contentTabs,
    formModal, modalTitle, formFields, entityForm,
    detailModal, detailModalTitle, detailModalContent,
    examQuestionsSection, examQuestionsList, addQuestionToExamBtn;

// --- RENDER FUNCTIONS ---
function renderBreadcrumbs() {
    if (!breadcrumbsContainer) {
        console.error("Breadcrumbs container not found");
        return;
    }
    let html = `<span class="breadcrumb-item ${currentView === 'topics' ? 'active' : ''}" data-level="topics" onclick="navigateToLevel('topics')">Tất cả Chủ đề</span>`; // Đã sửa: không cần window. ở đây vì hàm sẽ được gán vào window sau
    if (currentTopicId && currentTopicName) {
        html += ` &gt; <span class="breadcrumb-item ${currentView === 'subtopics' || ['posts', 'exams', 'postDetail', 'examDetail', 'questionDetail'].includes(currentView) ? 'active' : ''}" data-level="subtopics" data-id="${currentTopicId}" onclick="navigateToLevel('subtopics', ${currentTopicId}, '${currentTopicName.replace(/'/g, "\\'")}')">${currentTopicName}</span>`;
    }
    if (currentSubTopicId && currentSubTopicName) {
        if (['posts', 'exams', 'postDetail', 'examDetail', 'questionDetail'].includes(currentView)) {
            html += ` &gt; <span class="breadcrumb-item ${(currentView === 'posts' || currentView === 'exams') ? 'active' : ''}" data-level="${currentContentListType}" data-id="${currentSubTopicId}" onclick="navigateToLevel('${currentContentListType}', ${currentSubTopicId}, '${currentSubTopicName.replace(/'/g, "\\'")}')">${currentSubTopicName}</span>`;
        }
    }
    if (currentView === 'postDetail' && currentPostName) {
        html += ` &gt; <span class="breadcrumb-item active">${currentPostName.replace(/"/g, '&quot;')} (Bài học)</span>`;
    }
    if (currentView === 'examDetail' && currentExamName) {
        html += ` &gt; <span class="breadcrumb-item active">${currentExamName.replace(/"/g, '&quot;')} (Bài KT)</span>`;
    }
    if (currentView === 'questionDetail' && currentQuestionContent) {
        html += ` &gt; <span class="breadcrumb-item" data-level="exams" data-id="${currentExamIdForQuestionsManagement}" onclick="viewDetail('exam', ${currentExamIdForQuestionsManagement})">${currentExamName.replace(/"/g, '&quot;')}</span>`;
        html += ` &gt; <span class="breadcrumb-item active">QL Đáp án cho: "${currentQuestionContent.substring(0, 20).replace(/"/g, '&quot;')}..."</span>`;
    }
    breadcrumbsContainer.innerHTML = html;
}

function updateManagementTitleAndButton() {
    if (!managementTitle || !addNewBtn || !contentTabs) {
        console.error("Missing core UI elements for title/button update");
        return;
    }
    let title = "Quản lý ";
    let btnText = "Thêm ";
    let showAddNew = true;

    switch (currentView) {
        case 'topics':
            title += "Chủ đề";
            btnText += "Chủ đề mới";
            contentTabs.style.display = 'none';
            addNewBtn.onclick = () => openFormModal('add', 'topic');
            break;
        case 'subtopics':
            title += `Chủ đề con của "${currentTopicName}"`;
            btnText += "Chủ đề con mới";
            contentTabs.style.display = 'none';
            addNewBtn.onclick = () => openFormModal('add', 'subtopic', null, currentTopicId);
            break;
        case 'posts':
            title += `Bài học của "${currentSubTopicName}"`;
            btnText += "Bài học mới";
            contentTabs.style.display = 'flex';
            setActiveTabButton('posts');
            addNewBtn.onclick = () => openFormModal('add', 'post', null, currentSubTopicId);
            break;
        case 'exams':
            title += `Bài KT của "${currentSubTopicName}"`;
            btnText += "Bài KT mới";
            contentTabs.style.display = 'flex';
            setActiveTabButton('exams');
            addNewBtn.onclick = () => openFormModal('add', 'exam', null, currentSubTopicId);
            break;
        case 'postDetail':
            title = `Chi tiết Bài học: ${currentPostName.replace(/"/g, '&quot;')}`;
            showAddNew = false;
            contentTabs.style.display = 'none';
            break;
        case 'examDetail':
            title = `Chi tiết Bài KT: ${currentExamName.replace(/"/g, '&quot;')}`;
            showAddNew = false;
            contentTabs.style.display = 'none';
            break;
        case 'questionDetail':
            title = `Quản lý Đáp án cho Câu hỏi Q${currentQuestionId}`;
            showAddNew = false;
            contentTabs.style.display = 'none';
            break;
        default:
            title = "Quản lý";
            showAddNew = false;
            contentTabs.style.display = 'none';
    }
    managementTitle.textContent = title;
    if (showAddNew) {
        addNewBtn.innerHTML = `<i class="fas fa-plus"></i> ${btnText}`;
        addNewBtn.style.display = 'inline-flex';
    } else {
        addNewBtn.style.display = 'none';
    }
}

function setActiveTabButton(activeType) {
    if (!contentTabs)
        return;
    contentTabs.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.contentType === activeType)
            btn.classList.add('active');
    });
}

async function renderTable() {
    if (!dataTableTbody || !dataTableThead) {
        console.error("dataTableTbody or dataTableThead is not found in renderTable!");
        return;
    }
    dataTableTbody.innerHTML = '<tr><td colspan="3">Đang tải dữ liệu...</td></tr>';
    dataTableThead.innerHTML = '';

    try {
        let data = [];
        currentDataCache = [];

        if (currentView === 'topics') {
            renderTopicHeaders();
            const result = await window.TOPIC_MANAGEMENT_API.fetchTopicList({
                page: currentPage,
                pageSize: pageSize,
                keyword: currentKeyword
            });
            data = result.topics;
            totalPages = result.totalPages;
            currentDataCache = data;
            renderTopicRows(data);
            renderPagination(totalPages);
        } else if (currentView === 'subtopics' && currentTopicId) {
            renderSubTopicHeaders();
            if (!window.SUB_TOPIC_MANAGEMENT_API) {
                console.error("SUB_TOPIC_MANAGEMENT_API is not defined");
                dataTableTbody.innerHTML = '<tr><td colspan="3">Lỗi: API không khả dụng</td></tr>';
                return;
            }
            try {
                const result = await window.SUB_TOPIC_MANAGEMENT_API.fetchSubTopicList({
                    page: currentPage,
                    pageSize: pageSize,
                    topicId: currentTopicId,
                    keyword: currentKeyword
                });
                data = result.subTopics;
                totalPages = result.totalPages;
                currentDataCache = data;
                renderSubTopicRows(data);
                renderPagination(totalPages);
            } catch (error) {
                console.error("Lỗi khi tải danh sách chủ đề con:", error);
                dataTableTbody.innerHTML = `<tr><td colspan="3">Lỗi tải danh sách chủ đề con: ${error.message}</td></tr>`;
            }
        } else if (currentView === 'posts' && currentSubTopicId) {
            renderPostHeaders();
            try {
                const postResult = await window.POST_MANAGEMENT_API.fetchPostList({
                    page: currentPage,
                    pageSize: pageSize,
                    subTopicId: currentSubTopicId,
                    keyword: currentKeyword
                });
                data = postResult.posts;
                totalPages = postResult.totalPages;
                console.log(totalPages);
                currentDataCache = data;
                renderPostRows(data);
                renderPagination(totalPages);
            } catch (error) {
                console.error("Lỗi khi tải danh sách bài viết:", error);
                dataTableTbody.innerHTML = `<tr><td colspan="3">Lỗi tải danh sách bài viết: ${error.message}</td></tr>`;
            }
        } else if (currentView === 'exams' && currentSubTopicId) {
            renderExamHeaders();
            data = await window.SUB_TOPIC_MANAGEMENT_API.getSubTopicExams(currentSubTopicId);
            currentDataCache = data.filter(item => !item.is_deleted);
            renderExamRows(currentDataCache);
        } else if (['postDetail', 'examDetail', 'questionDetail'].includes(currentView)) {
            dataTableTbody.innerHTML = '';
        }
        updateManagementTitleAndButton();
        renderBreadcrumbs();
    } catch (error) {
        dataTableTbody.innerHTML = `<tr><td colspan="3">Lỗi tải dữ liệu: ${error.message}</td></tr>`;
        console.error("Error rendering table:", error);
    }
}


/**
 * Hiển thị các nút phân trang.
 * @param {number} totalPagesParam - Tổng số trang.
 */
function renderPagination(totalPagesParam) {
    totalPages = totalPagesParam;
    let paginationHTML = '';

    if (totalPages <= 0) {
        paginationContainer.innerHTML = '';
        return;
    }

    // Nút Previous
    paginationHTML += `
        <button class="btnn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} title="Trang trước">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    // Logic hiển thị các nút số trang
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
        endPage = Math.min(totalPages, 5);
    }
    if (currentPage > totalPages - 3) {
        startPage = Math.max(1, totalPages - 4);
    }

    if (startPage > 1) {
        paginationHTML += `<button class="btnn" onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<button class="btnn" disabled>...</button>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="btnn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<button class="btnn" disabled>...</button>`;
        }
        paginationHTML += `<button class="btnn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }

    // Nút Next
    paginationHTML += `
        <button class="btnn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} title="Trang sau">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    paginationContainer.innerHTML = paginationHTML;
}

/**
 * Chuyển trang khi người dùng nhấp vào nút phân trang.
 * @param {number} pageNumber - Số trang muốn chuyển đến.
 */
function changePage(pageNumber) {
    if (pageNumber < 1 || pageNumber > totalPages || pageNumber === currentPage) return;
    currentPage = pageNumber;
    renderTable();
}


// Cập nhật hàm xử lý tìm kiếm
if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
        currentKeyword = searchInput.value.trim();
        currentPage = 1; // Reset về trang 1 khi tìm kiếm
        renderTable();
    });

    // Thêm xử lý khi nhấn Enter trong ô tìm kiếm
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentKeyword = searchInput.value.trim();
            currentPage = 1;
            renderTable();
        }
    });
}

function renderTopicHeaders() {
    if (dataTableThead)
        dataTableThead.innerHTML = `<tr><th>ID</th><th>Tên Chủ đề</th><th>Hành động</th></tr>`;
}
function renderTopicRows(topics) {
    if (!dataTableTbody)
        return;
    dataTableTbody.innerHTML = (!topics || topics.length === 0) ? '<tr><td colspan="3">Chưa có chủ đề nào.</td></tr>' :
        topics.map(topic => `
            <tr data-id="${topic.topic_id}" data-name="${topic.name.replace(/"/g, '&quot;')}" class="clickable-row">
                <td>${topic.topic_id}</td><td>${topic.name}</td>
                <td>
                    <button class="action-btn edit" onclick="event.stopPropagation(); window.openFormModal('edit', 'topic', ${topic.topic_id})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" onclick="event.stopPropagation(); window.deleteEntity('topic', ${topic.topic_id})"><i class="fas fa-trash"></i></button>
                </td></tr>`).join('');
    addRowClickListeners();
}

function renderSubTopicHeaders() {
    if (dataTableThead)
        dataTableThead.innerHTML = `<tr><th>ID</th><th>Tên Chủ đề con</th><th>Hành động</th></tr>`;
}
function renderSubTopicRows(subtopics) {
    if (!dataTableTbody)
        return;
    dataTableTbody.innerHTML = (!subtopics || subtopics.length === 0) ? `<tr><td colspan="3">Chủ đề này chưa có chủ đề con.</td></tr>` :
        subtopics.map(sub => `
            <tr data-id="${sub.sub_topic_id}" data-name="${sub.name.replace(/"/g, '&quot;')}" class="clickable-row">
                <td>${sub.sub_topic_id}</td><td>${sub.name}</td>
                <td>
                    <button class="action-btn edit" onclick="event.stopPropagation(); window.openFormModal('edit', 'subtopic', ${sub.sub_topic_id}, ${currentTopicId})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" onclick="event.stopPropagation(); window.deleteEntity('subtopic', ${sub.sub_topic_id})"><i class="fas fa-trash"></i></button>
                </td></tr>`).join('');
    addRowClickListeners();
}

function renderPostHeaders() {
    if (dataTableThead)
        dataTableThead.innerHTML = `<tr><th>ID</th><th>Tên Bài học</th><th>Hành động</th></tr>`;
}
function renderPostRows(posts) {
    if (!dataTableTbody)
        return;
    dataTableTbody.innerHTML = (!posts || posts.length === 0) ? `<tr><td colspan="3">Chưa có bài học nào.</td></tr>` :
        posts.map(post => `
            <tr data-id="${post.post_id}" data-name="${post.post_name.replace(/"/g, '&quot;')}" class="clickable-row">
                <td>${post.post_id}</td><td>${post.post_name}</td>
                <td>
                    <button class="action-btn view" onclick="event.stopPropagation(); window.viewDetail('post', ${post.post_id})"><i class="fas fa-eye"></i></button>
                    <button class="action-btn edit" onclick="event.stopPropagation(); window.openFormModal('edit', 'post', ${post.post_id}, ${currentSubTopicId})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" onclick="event.stopPropagation(); window.deleteEntity('post', ${post.post_id})"><i class="fas fa-trash"></i></button>
                </td></tr>`).join('');
    addRowClickListeners();
}

function renderExamHeaders() {
    if (dataTableThead)
        dataTableThead.innerHTML = `<tr><th>ID</th><th>Tên Bài kiểm tra</th><th>Hành động</th></tr>`;
}
function renderExamRows(exams) {
    if (!dataTableTbody)
        return;
    dataTableTbody.innerHTML = (!exams || exams.length === 0) ? `<tr><td colspan="3">Chưa có bài kiểm tra nào.</td></tr>` :
        exams.map(exam => `
            <tr data-id="${exam.exam_id}" data-name="${exam.name.replace(/"/g, '&quot;')}" class="clickable-row">
                <td>${exam.exam_id}</td><td>${exam.name}</td>
                <td>
                    <button class="action-btn view" onclick="event.stopPropagation(); window.viewDetail('exam', ${exam.exam_id})"><i class="fas fa-eye"></i></button>
                    <button class="action-btn edit" onclick="event.stopPropagation(); window.openFormModal('edit', 'exam', ${exam.exam_id}, ${currentSubTopicId})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" onclick="event.stopPropagation(); window.deleteEntity('exam', ${exam.exam_id})"><i class="fas fa-trash"></i></button>
                </td></tr>`).join('');
    addRowClickListeners();
}

function addRowClickListeners() {
    if (!dataTableTbody)
        return;
    dataTableTbody.querySelectorAll('tr.clickable-row').forEach(row => {
        row.addEventListener('click', () => {
            const id = parseInt(row.dataset.id);
            const name = row.dataset.name;
            if (currentView === 'topics')
                window.navigateToLevel('subtopics', id, name);
            else if (currentView === 'subtopics')
                window.navigateToLevel('posts', id, name);
            else if (currentView === 'posts')
                window.viewDetail('post', id);
            else if (currentView === 'exams')
                window.viewDetail('exam', id);
        });
    });
}

// --- GLOBAL FUNCTIONS (called from HTML) ---
window.navigateToLevel = (level, id = null, name = '') => {
    currentView = level;
    if (level === 'topics') {
        currentTopicId = null;
        currentTopicName = '';
        currentSubTopicId = null;
        currentSubTopicName = '';
        currentPostId = null;
        currentPostName = '';
        currentExamId = null;
        currentExamName = '';
    } else if (level === 'subtopics') {
        currentTopicId = id;
        currentTopicName = name;
        currentSubTopicId = null;
        currentSubTopicName = '';
        currentPostId = null;
        currentPostName = '';
        currentExamId = null;
        currentExamName = '';
    } else if (level === 'posts' || level === 'exams') {
        currentSubTopicId = id;
        currentSubTopicName = name;
        currentContentListType = level;
        currentPostId = null;
        currentPostName = '';
        currentExamId = null;
        currentExamName = '';
    }
    if (detailModal)
        detailModal.style.display = 'none';
    if (examQuestionsSection)
        examQuestionsSection.style.display = 'none';
    if (formModal)
        formModal.style.display = 'none';
    renderTable();
};

window.switchContentType = (type) => {
    currentContentListType = type;
    currentView = type;
    renderTable();
};

// Định nghĩa các hàm global
function loadTopic(page = 1) {
    const keyword = document.getElementById('searchTopic').value;

    window.TOPIC_MANAGEMENT_API.fetchTopicList({
        page: page,
        pageSize: 10,
        keyword: keyword
    }).then(response => {
        const topicList = document.getElementById('topicList');
        topicList.innerHTML = '';

        if (!response.topics || response.topics.length === 0) {
            topicList.innerHTML = '<div class="no-data">Không tìm thấy topic nào</div>';
            return;
        }

        // Tạo danh sách topic
        const list = document.createElement('div');
        list.className = 'topic-list-container';

        response.topics.forEach(topic => {
            const item = document.createElement('div');
            item.className = 'topic-item';
            item.dataset.topicId = topic.topic_id;
            item.dataset.topicName = topic.name;

            item.innerHTML = `
                <div class="topic-info">
                    <span class="topic-id">#${topic.topic_id}</span>
                    <span class="topic-name">${topic.name}</span>
                </div>
                <button type="button" class="select-btn" onclick="selectTopic(${topic.topic_id}, '${topic.name.replace(/'/g, "\\'")}')">
                        <i class="fas fa-check"></i> Chọn
                    </button>
            `;

            // Thêm sự kiện click cho toàn bộ item
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.select-btn')) {
                    selectTopic(topic.topic_id, topic.name);
                }
            });

            list.appendChild(item);
        });

        topicList.appendChild(list);

        // Hiển thị phân trang
        displayTranslationPagination(response.totalPages, page);
    }).catch(error => {
        console.error('Lỗi khi tìm kiếm topic:', error);
        showToast('error', 'Lỗi', 'Không thể tìm kiếm topic. Vui lòng thử lại sau.');
    });
}

function selectTopic(topicId, topicName) {
    // Cập nhật hiển thị topic được chọn
    document.getElementById('currentTopicDisplay').value = topicName;
    currentParentId = topicId;

    // Đánh dấu topic được chọn trong danh sách
    const items = document.querySelectorAll('.topic-item');
    items.forEach(item => {
        if (item.dataset.topicId === topicId.toString()) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });

    // Hiển thị thông báo
    showToast('success', 'Thành công', `Đã chọn topic: ${topicName}`);
}

function displayTranslationPagination(totalPages, currentPage) {
    const topicList = document.getElementById('topicList');
    if (!topicList) {
        console.error('Không tìm thấy phần tử topicList');
        return;
    }

    // Xóa phân trang cũ nếu có
    const oldPagination = topicList.querySelector('.pagination');
    if (oldPagination) {
        oldPagination.remove();
    }

    const pagination = document.createElement('div');
    pagination.className = 'pagination';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = i === currentPage ? 'active' : '';
        button.onclick = () => loadSubTopic(i);
        pagination.appendChild(button);
    }

    topicList.appendChild(pagination);
}

window.openFormModal = async (mode, entityType, id = null, parentIdFromCall = null) => {
    // 1. Kiểm tra các thành phần Modal
    if (!formModal || !modalTitle || !formFields || !entityForm) {
        console.error("Modal elements not found in openFormModal");
        return;
    }

    // 2. Cập nhật biến toàn cục
    currentEditingId = id;
    currentEntityType = entityType;
    currentParentId = parentIdFromCall;

    // 3. Reset form và chuẩn bị dữ liệu
    entityForm.reset();
    formFields.innerHTML = '';
    let entityData = {};
    modalTitle.textContent = `${mode === 'edit' ? 'Chỉnh sửa' : 'Thêm mới'} ${getEntityTypeDisplayName(entityType)}`;

    // 4. Lấy dữ liệu nếu là chế độ chỉnh sửa
    if (mode === 'edit' && id !== null) {
        try {
            // Lấy dữ liệu từ API tương ứng
            if (entityType === 'topic')
                entityData = await window.TOPIC_MANAGEMENT_API.getTopicById(id);
            else if (entityType === 'subtopic')
                entityData = await window.SUB_TOPIC_MANAGEMENT_API.getSubTopicById(id);
            else if (entityType === 'post')
                entityData = await window.POST_MANAGEMENT_API.getPostById(id);
            else if (entityType === 'exam')
                entityData = await window.EXAM_MANAGEMENT_API.getExamById(id);
            else if (entityType === 'question')
                entityData = await window.QUESTION_MANAGEMENT_API.getQuestionById(id);
            else if (entityType === 'answer')
                entityData = await window.ANSWER_MANAGEMENT_API.getAnswerById(id);
        } catch (error) {
            showToast('error', 'Lỗi', `Lỗi tải dữ liệu để sửa: ${error.message}`);
            return;
        }
    }

    // 5. Tạo HTML cho các trường nhập liệu bằng switch case (SỬ DỤNG SNAKE_CASE)
    let fieldsHtml = '';

    // Lấy giá trị tên và nội dung (ưu tiên snake_case nếu có)
    const nameValue = entityData.name || entityData.post_name || '';
    const contentValue = entityData.content || '';

    switch (entityType) {
        case 'topic':
            fieldsHtml = `
                <div class="form-group">
                    <label for="modalEntityName">Tên Chủ đề:</label>
                    <input type="text" id="modalEntityName" name="name" value="${(entityData.name || '').replace(/"/g, '&quot;')}" required>
                </div>`;
            break;

        case 'subtopic':
            if (mode === 'add') {
                // Form thêm mới - chỉ hiển thị topic hiện tại
                fieldsHtml = `
                    <div class="form-group">
                        <label for="modalEntityName">Tên Chủ đề con:</label>
                        <input type="text" id="modalEntityName" name="name" value="${(entityData.name || '').replace(/"/g, '&quot;')}" required>
                    </div>
                    <div class="form-group">
                        <label>Topic hiện tại:</label>
                        <input type="text" id="currentTopicDisplay" value="${currentTopicName}" readonly>
                    </div>
                    <input type="hidden" name="topic_id" value="${currentParentId || entityData.topic_id || currentTopicId}">`;
            } else {
                // Form chỉnh sửa - cho phép chọn topic khác
                fieldsHtml = `
                    <div class="form-group">
                        <label for="modalEntityName">Tên Chủ đề con:</label>
                        <input type="text" id="modalEntityName" name="name" value="${(entityData.name || '').replace(/"/g, '&quot;')}" required>
                    </div>
                    <div class="form-group">
                        <label>Topic hiện tại:</label>
                        <input type="text" id="currentTopicDisplay" value="${currentTopicName}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Chọn topic mới:</label>
                        <div class="modal-search-box">
                            <input type="text" id="searchTopic" placeholder="Nhập topic cần tìm...">
                            <button type="button" onclick="loadTopic()">Tìm kiếm</button>
                        </div>
                        <div id="topicList" class="topic-list">
                            <!-- Danh sách topic sẽ được hiển thị ở đây -->
                        </div>
                    </div>
                    <input type="hidden" name="topic_id" value="${currentParentId || entityData.topic_id || currentTopicId}">`;
            }
            break;

        case 'post':
            if (mode === 'add') {
                // Form thêm mới - chỉ hiển thị subtopic hiện tại
                fieldsHtml = `
                    <div class="form-group">
                        <label for="modalEntityName">Tên Bài học:</label>
                        <input type="text" id="modalEntityName" name="post_name" value="${(entityData.post_name || '').replace(/"/g, '&quot;')}" required>
                    </div>
                    <div class="form-group">
                        <label>Chủ đề con hiện tại:</label>
                        <input type="text" id="currentSubTopicDisplay" value="${currentSubTopicName}" readonly>
                    </div>
                    <div class="form-group">
                        <label for="modalContent">Nội dung:</label>
                        <textarea id="modalContent" name="content" rows="10" required>${contentValue}</textarea>
                    </div>
                    <input type="hidden" name="sub_topic_id" value="${currentParentId || entityData.sub_topic_id || currentSubTopicId}">`;
            } else {
                // Form chỉnh sửa - cho phép chọn subtopic khác
                fieldsHtml = `
                        <div class="form-group">
                            <label for="modalEntityName">Tên Bài học:</label>
                            <input type="text" id="modalEntityName" name="post_name" value="${(entityData.post_name || '').replace(/"/g, '&quot;')}" required>
                        </div>
                        <div class="form-group">
                            <label>Chủ đề con hiện tại:</label>
                            <input type="text" id="currentSubTopicDisplay" value="${currentSubTopicName}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Chọn chủ đề con mới:</label>
                            <div class="modal-search-box">
                                <input type="text" id="searchSubTopic" placeholder="Nhập chủ đề con cần tìm...">
                                <button type="button" onclick="loadSubTopic()">Tìm kiếm</button>
                            </div>
                            <div id="subTopicList" class="topic-list">
                                <!-- Danh sách chủ đề con sẽ được hiển thị ở đây -->
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="modalContent">Nội dung:</label>
                            <textarea id="modalContent" name="content" rows="10" required>${contentValue}</textarea>
                        </div>
                        <input type="hidden" name="sub_topic_id" value="${currentParentId || entityData.sub_topic_id || currentSubTopicId}">`;
            }
            break;

        case 'exam':
            if (mode === 'add') {
                // Form thêm mới - chỉ hiển thị subtopic hiện tại
                fieldsHtml = `
                    <div class="form-group">
                        <label for="modalEntityName">Tên Bài KT:</label>
                        <input type="text" id="modalEntityName" name="name" value="${(entityData.name || '').replace(/"/g, '&quot;')}" required>
                    </div>
                    <div class="form-group">
                        <label>Chủ đề con hiện tại:</label>
                        <input type="text" id="currentSubTopicDisplay" value="${currentSubTopicName}" readonly>
                    </div>
                    <input type="hidden" name="sub_topic_id" value="${currentParentId || entityData.sub_topic_id || currentSubTopicId}">`;
            } else {
                // Form chỉnh sửa - cho phép chọn subtopic khác
                fieldsHtml = `
                    <div class="form-group">
                        <label for="modalEntityName">Tên Bài KT:</label>
                        <input type="text" id="modalEntityName" name="name" value="${(entityData.name || '').replace(/"/g, '&quot;')}" required>
                    </div>
                    <div class="form-group">
                        <label>Chủ đề con hiện tại:</label>
                        <input type="text" id="currentSubTopicDisplay" value="${currentSubTopicName}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Chọn chủ đề con mới:</label>
                        <div class="modal-search-box">
                            <input type="text" id="searchSubTopic" placeholder="Nhập chủ đề con cần tìm...">
                            <button type="button" onclick="loadSubTopic()">Tìm kiếm</button>
                        </div>
                        <div id="subTopicList" class="topic-list">
                            <!-- Danh sách chủ đề con sẽ được hiển thị ở đây -->
                        </div>
                    </div>
                    <input type="hidden" name="sub_topic_id" value="${currentParentId || entityData.sub_topic_id || currentSubTopicId}">`;
            }
            break;

        case 'question':
            const questionTypeValue = entityData.question_type_id || 1; // SỬA: question_type_id
            const levelValue = entityData.level || 1;
            const questionContentValue = entityData.content || ''; // SỬA: content
            const examIdValue = currentParentId || entityData.exam_id || currentExamIdForQuestionsManagement; // SỬA: exam_id

            fieldsHtml = `
                <div class="form-group">
                    <label for="modalContent">Nội dung câu hỏi:</label>
                    <textarea id="modalContent" name="content" rows="3" required>${questionContentValue}</textarea></div> 

                <div class="form-group">
                    <label for="modalQuestionTypeId">Loại câu hỏi:</label>
                    <select id="modalQuestionTypeId" name="question_type_id" required> 
                        <option value="1" ${questionTypeValue === 1 ? 'selected' : ''}>Multi Choice</option>
                        <option value="2" ${questionTypeValue === 2 ? 'selected' : ''}>Fill a blank</option>
                        </select>
                </div>`

            break;

        case 'answer':
            const answerContentValue = entityData.content || '';
            const isCorrectValue = entityData.is_correct || false;
            const questionIdValue = currentParentId || entityData.question_id || currentQuestionId; // SỬA: question_id

            fieldsHtml = `
                <div class="form-group">
                    <label for="modalContentAns">Nội dung câu trả lời:</label>
                    <input type="text" id="modalContentAns" name="content" value="${answerContentValue}" required>
                </div>
                <div class="form-group">
                    <label for="modalIsCorrect">Là đáp án đúng?</label>
                    <input type="checkbox" id="modalIsCorrect" ${isCorrectValue ? 'checked' : ''}>
                </div>
                <input type="hidden" name="question_id" value="${questionIdValue}">`; // SỬA: name="question_id"
            break;

        default:
            fieldsHtml = `<p class="error-message">Loại thực thể không được hỗ trợ: ${entityType}</p>`;
            break;
    }

    // 6. Hiển thị form
    formFields.innerHTML = fieldsHtml;
    const submitButton = entityForm.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.style.display = fieldsHtml.includes('<p class="error-message">') ? 'none' : 'block';
    }

    formModal.style.display = 'flex';
    formModal.classList.add('front');

    // Cập nhật phần tự động tìm kiếm khi mở form
    if (entityType === 'subtopic' && mode === 'edit') {
        setTimeout(() => {
            loadTopic();
        }, 100);
    } else if ((entityType === 'post' || entityType === 'exam') && mode === 'edit') {
        setTimeout(() => {
            loadSubTopic();
        }, 100);
    }
};

// Hàm trợ giúp (bạn cần có hàm này)
function getEntityTypeDisplayName(type) {
    const names = {
        topic: 'Chủ đề',
        subtopic: 'Chủ đề con',
        post: 'Bài viết',
        exam: 'Bài kiểm tra',
        question: 'Câu hỏi',
        answer: 'Câu trả lời'
    };
    return names[type] || type;
}

window.closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        if (modalId == 'formModal') {
            modal.classList.remove('front');
        }
    }
    if (modalId === 'detailModal') {
        if (currentView === 'postDetail' && currentSubTopicId && currentSubTopicName) {
            window.navigateToLevel('posts', currentSubTopicId, currentSubTopicName);
        } else if ((currentView === 'examDetail' || currentView === 'questionDetail') && currentSubTopicId && currentSubTopicName) {
            window.navigateToLevel('exams', currentSubTopicId, currentSubTopicName);
        }
    } else if (modalId === 'formModal') {
        if (currentView === 'questionDetail' && currentExamIdForQuestionsManagement) {
            window.viewDetail('exam', currentExamIdForQuestionsManagement);
        }
        // Reset currentEntityType và currentEditingId khi đóng form để tránh nhầm lẫn
        currentEntityType = '';
        currentEditingId = null;
    }
};

/**
 * Xử lý việc xóa một thực thể (Topic, SubTopic, Post, Exam, Question, Answer).
 * @param {string} entityType - Loại thực thể cần xóa ('topic', 'subtopic', v.v.).
 * @param {number|string} id - ID của thực thể cần xóa.
 */
window.deleteEntity = async (entityType, id) => {
    // Hàm này (bạn cần tự định nghĩa) để lấy tên hiển thị đẹp hơn
    const getEntityTypeDisplayName = (type) => {
        const names = {
            topic: 'Chủ đề',
            subtopic: 'Chủ đề con',
            post: 'Bài viết',
            exam: 'Bài kiểm tra',
            question: 'Câu hỏi',
            answer: 'Câu trả lời'
        };
        return names[type] || type;
    };

    const displayName = getEntityTypeDisplayName(entityType);

    // Xác nhận trước khi xóa
    if (confirm(`Bạn có chắc muốn xóa ${displayName} này (ID: ${id}) không?`)) {

        let apiCallPromise;

        // 1. Xác định API cần gọi bằng switch case
        switch (entityType) {
            case 'topic':
                apiCallPromise = window.TOPIC_MANAGEMENT_API.deleteTopic(id);
                break;
            case 'subtopic':
                apiCallPromise = window.SUB_TOPIC_MANAGEMENT_API.deleteSubTopic(id);
                break;
            case 'post':
                apiCallPromise = window.POST_MANAGEMENT_API.deletePost(id);
                break;
            case 'exam':
                apiCallPromise = window.EXAM_MANAGEMENT_API.deleteExam(id);
                break;
            case 'question':
                apiCallPromise = window.QUESTION_MANAGEMENT_API.deleteQuestion(id);
                break;
            case 'answer':
                apiCallPromise = window.ANSWER_MANAGEMENT_API.deleteAnswer(id);
                break;
            default:
                showToast('error', 'Lỗi', "Lỗi: Loại thực thể không xác định để xóa!");
                return;
        }

        // 2. Thực hiện lời gọi API và xử lý kết quả
        try {
            console.log(`Đang xóa ${entityType} với ID: ${id}`);

            // Đợi API hoàn thành (sử dụng fetchAPI đã cải tiến)
            const result = await apiCallPromise;

            console.log("Phản hồi xóa:", result); // Log kết quả (có thể là text hoặc null)

            // Thông báo thành công
            showToast('success', 'Thành công!', `Xóa ${displayName} thành công!`);

            // 3. Render lại giao diện phù hợp
            // (Giữ nguyên logic render phức tạp của bạn)
            if (entityType === 'question' && currentExamIdForQuestionsManagement) {
                await renderQuestionsForExam(currentExamIdForQuestionsManagement);
            } else if (entityType === 'answer' && currentQuestionId) {
                // Giả sử các biến này tồn tại và được quản lý đúng
                const formModal = document.getElementById('formModal');
                const detailModal = document.getElementById('detailModal');

                if (formModal && formModal.style.display === 'flex' && currentView === 'questionDetail') {
                    await window.manageAnswersForQuestion(currentQuestionId, currentQuestionContent, currentExamIdForQuestionsManagement);
                } else if (detailModal && detailModal.style.display === 'flex' && currentExamIdForQuestionsManagement) {
                    await renderQuestionsForExam(currentExamIdForQuestionsManagement);
                } else {
                    renderTable(); // Fallback nếu không khớp
                }
            } else {
                renderTable(); // Render lại bảng chính
            }

        } catch (error) {
            // 4. Xử lý lỗi
            console.error(`Lỗi khi xóa ${displayName}:`, error);
            // Kiểm tra thông báo lỗi cụ thể (ví dụ: không cho xóa mặc định)
            if (error.message && error.message.toLowerCase().includes("can't delete default")) {
                showToast('error', 'Lỗi', `Không thể xoá ${displayName} mặc định.`);
            } else {
                showToast('error', 'Lỗi', `Lỗi xóa ${displayName}: ${error.message}`);
            }
        }
    }
};

window.viewDetail = async (entityType, id) => { /* ... logic như cũ ... */
    if (!detailModal || !detailModalContent || !detailModalTitle || !examQuestionsSection || !examQuestionsList) {
        console.error("Detail modal elements not found!");
        return;
    }

    detailModalContent.innerHTML = '<p>Đang tải chi tiết...</p>';
    examQuestionsSection.style.display = 'none';
    examQuestionsList.innerHTML = '';
    detailModal.style.display = 'flex';
    let entityData = {};
    let contentHtml = '';

    try {
        if (entityType === 'post') {
            entityData = await window.POST_MANAGEMENT_API.getPostById(id);
            currentPostId = id;
            currentPostName = entityData.post_name;
            detailModalTitle.textContent = `Chi tiết Bài học: ${entityData.post_name}`;
            contentHtml = `<h4>ID: ${entityData.post_id}</h4><p><strong>Tên:</strong> ${entityData.post_name}</p>
                           <p><strong>Nội dung:</strong></p><div class="content-display">${entityData.content ? entityData.content.replace(/\n/g, '<br>') : 'Chưa có nội dung.'}</div>`;
            currentView = 'postDetail';
            detailModalContent.innerHTML = contentHtml;
        } else if (entityType === 'exam') {
            entityData = await window.EXAM_MANAGEMENT_API.getExamById(id);
            currentExamId = id;
            currentExamName = entityData.name;
            currentExamIdForQuestionsManagement = id;
            detailModalTitle.textContent = `Chi tiết Bài KT: ${entityData.name}`;
            contentHtml = `<h4>ID: ${entityData.exam_id}</h4><p><strong>Tên:</strong> ${entityData.name}</p>`;
            currentView = 'examDetail';
            detailModalContent.innerHTML = contentHtml;
            await renderQuestionsForExam(id);
            examQuestionsSection.style.display = 'block';
        }
        renderBreadcrumbs();
    } catch (error) {
        detailModalContent.innerHTML = `<p>Lỗi tải chi tiết: ${error.message}</p>`;
    }
};

function getEntityTypeDisplayName(entityType) { /* ... logic như cũ ... */
    if (entityType === 'topic')
        return 'Chủ đề';
    if (entityType === 'subtopic')
        return 'Chủ đề con';
    if (entityType === 'post')
        return 'Bài học';
    if (entityType === 'exam')
        return 'Bài kiểm tra';
    if (entityType === 'question')
        return 'Câu hỏi';
    if (entityType === 'answer')
        return 'Câu trả lời';
    return 'mục';
}

async function renderQuestionsForExam(examId) {
    if (!examQuestionsList || !addQuestionToExamBtn) {
        console.error("examQuestionsList or addQuestionToExamBtn not found in renderQuestionsForExam");
        return;
    }
    examQuestionsList.innerHTML = '<li>Đang tải câu hỏi...</li>';
    addQuestionToExamBtn.onclick = () => window.openFormModal('add', 'question', null, examId);

    try {
        const questions = await window.QUESTION_MANAGEMENT_API.getQuestionsByExamId(examId);
        if (!questions || questions.length === 0) {
            examQuestionsList.innerHTML = '<li class="list-group-item">Bài kiểm tra này chưa có câu hỏi nào.</li>';
            return;
        }
        let questionsHtml = '<ul class="list-group">';
        for (const q of questions) {
            questionsHtml += `
                <li class="list-group-item">
                    <div class="question-item-header">
                        <span><strong>Q${q.question_id}:</strong> ${q.content} (Loại: ${q.question_type_id})</span>
                        <div class="question-actions">
                            <button type="button" class="btn btn-sm btn-info" onclick="window.openFormModal('edit', 'question', ${q.question_id}, ${examId})"><i class="fas fa-edit"></i> Sửa</button>
                            <button type="button" class="btn btn-sm btn-danger" onclick="window.deleteEntity('question', ${q.question_id})"><i class="fas fa-trash"></i> Xóa</button>
                            <button type="button" class="btn btn-sm btn-primary" onclick="window.manageAnswersForQuestion(${q.question_id}, '${q.content.replace(/'/g, "\\'")}', ${examId})"><i class="fas fa-list-ol"></i> Đáp án</button>
                        </div>
                    </div>
                </li>`;
        }
        questionsHtml += '</ul>';
        examQuestionsList.innerHTML = questionsHtml;
    } catch (error) {
        console.error('Lỗi khi tải danh sách câu hỏi:', error);
        examQuestionsList.innerHTML = `<li class="list-group-item text-danger">Lỗi tải câu hỏi: ${error.message}</li>`;
    }
}

window.manageAnswersForQuestion = async (questionId, questionContent, examIdForReturn = null) => {
    if (!formModal || !modalTitle || !formFields || !entityForm) {
        console.error("Modal elements not found in manageAnswersForQuestion");
        return;
    }
    currentQuestionId = questionId;
    currentQuestionContent = questionContent;
    currentExamIdForQuestionsManagement = examIdForReturn || currentExamIdForQuestionsManagement;

    currentEditingId = null;
    currentEntityType = 'answer';
    currentView = 'questionDetail';

    modalTitle.textContent = `Quản lý Đáp án cho: "${questionContent.substring(0, 30).replace(/"/g, '&quot;')}..." (QID: ${questionId})`;

    let answersHtml = '<h4>Danh sách câu trả lời:</h4><ul id="answerListForQuestion" class="list-group mb-3">';
    try {
        const answers = await window.ANSWER_MANAGEMENT_API.getAnswersByQuestionId(questionId);
        if (answers && answers.length > 0) {
            answersHtml += answers.map(ans => `
    <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>${ans.content} ${ans.is_correct ? '<i class="fas fa-check-circle text-success ml-2" title="Đáp án đúng"></i>' : ''}</span>
        <div>
            <button type="button" class="btn btn-sm btn-info" onclick="window.openFormModal('edit', 'answer', ${ans.answer_id}, ${questionId})"><i class="fas fa-edit"></i></button> 
            <button type="button" class="btn btn-sm btn-danger" onclick="window.deleteEntity('answer', ${ans.answer_id})"><i class="fas fa-trash"></i></button> 
        </div></li>`).join('');
        } else {
            answersHtml += '<li class="list-group-item">Chưa có câu trả lời.</li>';
        }
    } catch (e) {
        answersHtml += `<li class="list-group-item text-danger">Lỗi tải câu trả lời: ${e.message}</li>`;
    }
    answersHtml += '</ul>';
    answersHtml += `<button type="button" class="btn btn-success btn-sm mt-2" onclick="window.openFormModal('add', 'answer', null, ${questionId})"><i class="fas fa-plus"></i> Thêm đáp án mới</button>`;

    formFields.innerHTML = answersHtml;
    const submitButton = entityForm.querySelector('button[type="submit"]');
    if (submitButton)
        submitButton.style.display = 'none';
    formModal.classList.add('front');
    formModal.style.display = 'flex';
    renderBreadcrumbs();
};

// Thêm hàm loadSubTopic
async function loadSubTopic(page = 1) {
    const searchInput = document.getElementById('searchSubTopic');
    if (!searchInput) {
        console.error('Không tìm thấy phần tử searchSubTopic');
        return;
    }

    const keyword = searchInput.value;
    const subTopicList = document.getElementById('subTopicList');
    if (!subTopicList) {
        console.error('Không tìm thấy phần tử subTopicList');
        return;
    }

    try {
        const result = await window.SUB_TOPIC_MANAGEMENT_API.fetchSubTopicList({
            page: page,
            pageSize: 10,
            topicId: 0,
            keyword: keyword
        });

        subTopicList.innerHTML = '';

        if (!result.subTopics || result.subTopics.length === 0) {
            subTopicList.innerHTML = '<div class="no-data">Không tìm thấy chủ đề con nào</div>';
            return;
        }

        // Tạo danh sách chủ đề con
        const list = document.createElement('div');
        list.className = 'topic-list-container';

        result.subTopics.forEach(subTopic => {
            const item = document.createElement('div');
            item.className = 'topic-item';
            item.dataset.subTopicId = subTopic.sub_topic_id;
            item.dataset.subTopicName = subTopic.name;

            item.innerHTML = `
                <div class="topic-info">
                    <span class="topic-id">#${subTopic.sub_topic_id}</span>
                    <span class="topic-name">${subTopic.name}</span>
                </div>
                <button type="button" class="select-btn" onclick="selectSubTopic(${subTopic.sub_topic_id}, '${subTopic.name.replace(/'/g, "\\'")}')">
                    <i class="fas fa-check"></i> Chọn
                </button>
            `;

            // Thêm sự kiện click cho toàn bộ item
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.select-btn')) {
                    selectSubTopic(subTopic.sub_topic_id, subTopic.name);
                }
            });

            list.appendChild(item);
        });

        subTopicList.appendChild(list);

        // Hiển thị phân trang
        displayTranslationPagination(result.totalPages, page);
    } catch (error) {
        console.error('Lỗi khi tìm kiếm chủ đề con:', error);
        showToast('error', 'Lỗi', 'Không thể tìm kiếm chủ đề con. Vui lòng thử lại sau.');
    }
}

// Thêm hàm selectSubTopic
function selectSubTopic(subTopicId, subTopicName) {
    // Cập nhật hiển thị chủ đề con được chọn
    document.getElementById('currentSubTopicDisplay').value = subTopicName;
    currentParentId = subTopicId;

    // Đánh dấu chủ đề con được chọn trong danh sách
    const items = document.querySelectorAll('.topic-item');
    items.forEach(item => {
        if (parseInt(item.dataset.subTopicId) === subTopicId) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });

    // Hiển thị thông báo
    showToast('success', 'Thành công', `Đã chọn chủ đề con: ${subTopicName}`);
}

// --- MAIN SCRIPT EXECUTION ---
document.addEventListener('DOMContentLoaded', () => {
    // Gán các DOM elements
    managementTitle = document.getElementById('managementTitle');
    breadcrumbsContainer = document.getElementById('breadcrumbs');
    searchInput = document.getElementById('searchInput');
    searchBtn = document.getElementById('searchBtn');
    addNewBtn = document.getElementById('addNewBtn');
    const backBtn = document.getElementById('backBtn');
    dataTableThead = document.querySelector('#dataTable thead');
    dataTableTbody = document.querySelector('#dataTable tbody');
    paginationContainer = document.getElementById('pagination');
    contentTabs = document.getElementById('contentTabs');
    formModal = document.getElementById('formModal');
    modalTitle = document.getElementById('modalTitle');
    formFields = document.getElementById('formFields');
    entityForm = document.getElementById('entityForm');
    detailModal = document.getElementById('detailModal');
    detailModalTitle = document.getElementById('detailModalTitle');
    detailModalContent = document.getElementById('detailModalContent');
    examQuestionsSection = document.getElementById('examQuestionsSection');
    examQuestionsList = document.getElementById('examQuestionsList');
    addQuestionToExamBtn = document.getElementById('addQuestionToExamBtn');

    if (!dataTableTbody || !dataTableThead) {
        console.error("CRITICAL: dataTableTbody or dataTableThead is not found immediately after DOMContentLoaded!");
    }

    // Gán event listeners
    if (entityForm) {
        entityForm.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            let data = Object.fromEntries(formData.entries());

            // --- 1. Chuẩn bị dữ liệu ---
            // Gán ID cha (parent_id)
            if (currentEntityType === 'subtopic') {
                // Chuẩn bị data cho subtopic
                data = {
                    name: data.name,
                    topic_id: parseInt(currentParentId || entityData.topic_id || currentTopicId)
                };
                // Thêm sub_topic_id nếu là cập nhật
                if (currentEditingId) {
                    data.sub_topic_id = currentEditingId;
                }
                // Kiểm tra tên không được để trống
                if (!data.name || data.name.trim() === '') {
                    showToast('error', 'Lỗi', 'Tên chủ đề con không được để trống');
                    return;
                }
            } else if (currentEntityType === 'post') {
                // Chuẩn bị data cho post
                const postData = {
                    post_id: 0,
                    post_name: data.post_name,
                    content: data.content,
                    sub_topic_id: parseInt(currentParentId || entityData.sub_topic_id || currentSubTopicId),
                    _deleted: false
                };

                // Thêm post_id nếu là cập nhật
                if (currentEditingId) {
                    postData.post_id = parseInt(currentEditingId);
                }

                // Kiểm tra tên không được để trống
                if (!postData.post_name || postData.post_name.trim() === '') {
                    showToast('error', 'Lỗi', 'Tên bài học không được để trống');
                    return;
                }
                // Kiểm tra nội dung không được để trống
                if (!postData.content || postData.content.trim() === '') {
                    showToast('error', 'Lỗi', 'Nội dung bài học không được để trống');
                    return;
                }
                // Kiểm tra sub_topic_id phải là số hợp lệ
                if (isNaN(postData.sub_topic_id) || postData.sub_topic_id <= 0) {
                    showToast('error', 'Lỗi', 'Chủ đề con không hợp lệ');
                    return;
                }

                // Gán lại data đã được xử lý
                data = postData;
            } else if (currentEntityType === 'exam')
                data.sub_topic_id = parseInt(currentParentId);
            else if (currentEntityType === 'answer')
                data.question_id = parseInt(currentParentId);

            // Chuyển đổi kiểu dữ liệu nếu cần
            if (data.question_type_id)
                data.question_type_id = parseInt(data.question_type_id);

            // Xử lý checkbox 'isCorrect'
            if (currentEntityType === 'answer') {
                const isCorrectCheckbox = document.getElementById('modalIsCorrect');
                data.is_correct = isCorrectCheckbox ? isCorrectCheckbox.checked : false;
            }

            // Gán ID thực thể khi chỉnh sửa (cho payload)
            if (currentEditingId) {
                if (currentEntityType === 'topic')
                    data.topic_id = currentEditingId;
                else if (currentEntityType === 'subtopic')
                    data.sub_topic_id = currentEditingId;
                else if (currentEntityType === 'post')
                    data.post_id = currentEditingId;
                else if (currentEntityType === 'exam')
                    data.exam_id = currentEditingId;
                else if (currentEntityType === 'question')
                    data.question_id = currentEditingId;
                else if (currentEntityType === 'answer')
                    data.answer_id = currentEditingId;
            }

            // --- 2. Xác định API cần gọi ---
            let apiCallPromise;
            const entityId = currentEditingId;
            let render  = 1;
            try {
                console.log(`Đang ${entityId ? 'cập nhật' : 'tạo mới'} ${currentEntityType}:`, data);

                switch (currentEntityType) {
                    case 'topic':
                        apiCallPromise = entityId ?
                            window.TOPIC_MANAGEMENT_API.updateTopic(entityId, data) :
                            window.TOPIC_MANAGEMENT_API.createTopic(data);
                        break;
                    case 'subtopic':
                        apiCallPromise = entityId ?
                            window.SUB_TOPIC_MANAGEMENT_API.updateSubTopic(entityId, data) :
                            window.SUB_TOPIC_MANAGEMENT_API.createSubTopic(data);
                        break;
                    case 'post':
                        apiCallPromise = entityId ?
                            window.POST_MANAGEMENT_API.updatePost(entityId, data) :
                            window.POST_MANAGEMENT_API.createPost(data);
                        break;
                    case 'exam':
                        apiCallPromise = entityId ?
                            window.EXAM_MANAGEMENT_API.updateExam(entityId, data) :
                            window.EXAM_MANAGEMENT_API.createExam(data);
                        break;
                    case 'question':
                        apiCallPromise = entityId ?
                            window.QUESTION_MANAGEMENT_API.updateQuestion(entityId, data) :
                            window.QUESTION_MANAGEMENT_API.createQuestion(currentParentId, data);
                        render = 2;
                        break;
                    case 'answer':
                        apiCallPromise = entityId ?
                            window.ANSWER_MANAGEMENT_API.updateAnswer(entityId, data) :
                            window.ANSWER_MANAGEMENT_API.createAnswer(data);
                        render = 3;
                        break;
                    default:
                        showToast('error', 'Lỗi', "Lỗi: Loại thực thể không xác định!");
                        return;
                }

                // Đợi lời gọi API hoàn thành
                const result = await apiCallPromise;

                // Kiểm tra status code
                if (result.status >= 200 && result.status < 300) {
                    showToast('success', 'Thành công!', `${entityId ? 'Cập nhật' : 'Thêm mới'} thành công!`);
                    window.closeModal('formModal');

                    console.log("hvd ...");
                    // Render lại giao diện
                    if (render == 2) {
                        console.log("render quesstion");
                        await renderQuestionsForExam(currentExamIdForQuestionsManagement);

                    } else if (render == 3) {

                        console.log("render answer");
                        await window.manageAnswersForQuestion(currentQuestionId, currentQuestionContent, currentExamIdForQuestionsManagement);
                    } else {
                        console.log("render ...");
                        console.log(render);
                       
                        //   await window.manageAnswersForQuestion(currentQuestionId, currentQuestionContent, currentExamIdForQuestionsManagement);

                        renderTable(); // Hàm render chung
                    }
                } else {
                    throw new Error(result.message || 'Có lỗi xảy ra khi xử lý yêu cầu');
                }

            } catch (error) {
                console.error("Đã xảy ra lỗi trong quá trình xử lý form:", error);
                // Hiển thị thông báo lỗi từ server nếu có
                const errorMessage = error.message || 'Có lỗi xảy ra khi xử lý yêu cầu';
                showToast('error', 'Lỗi', errorMessage);
            }
        };
    }

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const searchTerm = searchInput.value.toLowerCase();
            if (!currentDataCache)
                return;
            const filteredData = currentDataCache.filter(item => {
                const name = item.name || item.post_name;
                return name && name.toLowerCase().includes(searchTerm);
            });

            if (currentView === 'topics')
                renderTopicRows(filteredData);
            else if (currentView === 'subtopics')
                renderSubTopicRows(filteredData);
            else if (currentView === 'posts')
                renderPostRows(filteredData);
            else if (currentView === 'exams')
                renderExamRows(filteredData);
        });
    }

    if (addNewBtn) {
        addNewBtn.addEventListener('click', () => {
            let typeToAdd = '';
            let parentIdForNew = null;

            if (currentView === 'topics') {
                typeToAdd = 'topic';
            } else if (currentView === 'subtopics') {
                typeToAdd = 'subtopic';
                parentIdForNew = currentTopicId;
            } else if (currentView === 'posts') {
                typeToAdd = 'post';
                parentIdForNew = currentSubTopicId;
            } else if (currentView === 'exams') {
                typeToAdd = 'exam';
                parentIdForNew = currentSubTopicId;
            }

            if (typeToAdd) {
                window.openFormModal('add', typeToAdd, null, parentIdForNew);
            } else {
                console.warn("Cannot determine entity type to add for currentView:", currentView);
            }
        });
    }

    window.onclick = function (event) {
        if (formModal && event.target === formModal) {
            window.closeModal('formModal');
            if (currentView === 'questionDetail' && currentExamIdForQuestionsManagement) {
                window.viewDetail('exam', currentExamIdForQuestionsManagement);
            }
        }
        if (detailModal && event.target === detailModal) {
            window.closeModal('detailModal');
        }
    };

    // Thêm xử lý cho nút trở lại
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (currentView === 'subtopics') {
                window.navigateToLevel('topics');
            } else if (currentView === 'posts' || currentView === 'exams') {
                window.navigateToLevel('subtopics', currentTopicId, currentTopicName);
            } else if (currentView === 'postDetail') {
                window.navigateToLevel('posts', currentSubTopicId, currentSubTopicName);
            } else if (currentView === 'examDetail') {
                window.navigateToLevel('exams', currentSubTopicId, currentSubTopicName);
            } else if (currentView === 'questionDetail') {
                window.viewDetail('exam', currentExamIdForQuestionsManagement);
            }
        });
    }

    // Cập nhật hàm navigateToLevel để hiển thị/ẩn nút trở lại
    const originalNavigateToLevel = window.navigateToLevel;
    window.navigateToLevel = (level, id = null, name = '') => {
        originalNavigateToLevel(level, id, name);
        if (backBtn) {
            backBtn.style.display = level === 'topics' ? 'none' : 'inline-flex';
        }
    };

    // Cập nhật hàm viewDetail để hiển thị nút trở lại
    const originalViewDetail = window.viewDetail;
    window.viewDetail = async (entityType, id) => {
        await originalViewDetail(entityType, id);
        if (backBtn) {
            backBtn.style.display = 'inline-flex';
        }
    };

    // Initial Load
    window.navigateToLevel('topics');
});