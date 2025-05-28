// BỎ ĐI KHAI BÁO getToken NẾU NÓ ĐÃ CÓ Ở FILE KHÁC ĐƯỢC NHÚNG VÀO HTML
// Ví dụ: Nếu bạn có một file utils.js chứa getToken và đã được nhúng, thì xóa dòng dưới:
// const getToken = () => `Bearer ${localStorage.getItem('token')}`; 
// Nếu getToken chỉ dùng ở đây và không có ở file khác, hãy giữ lại và kiểm tra xem
// lessonManagerment.js có bị nhúng 2 lần vào HTML không.

async function fetchAPI(url, options = {}) {
    const currentToken = getToken(); 

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

// --- API Definitions ---
const topicAPI = {
    getAll: () => fetchAPI('/topic/'),
    getById: (id) => fetchAPI(`/topic/${id}`),
    getSubTopics: (topicId) => fetchAPI(`/topic/${topicId}/subtopics`),
    create: (data) => fetchAPI('/topic/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchAPI(`/topic/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchAPI(`/topic/${id}`, { method: 'DELETE' }),
};
const subTopicAPI = {
    getById: (id) => fetchAPI(`/subtopic/${id}`),
    getPosts: (subTopicId) => fetchAPI(`/subtopic/${subTopicId}/posts`),
    getExams: (subTopicId) => fetchAPI(`/subtopic/${subTopicId}/exams`),
    create: (data) => fetchAPI('/subtopic/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchAPI(`/subtopic/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchAPI(`/subtopic/${id}`, { method: 'DELETE' }),
};
const postAPI = {
    getById: (id) => fetchAPI(`/post/${id}`),
    create: (data) => fetchAPI('/post/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchAPI(`/post/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchAPI(`/post/delete/${id}`, { method: 'PUT'}),
};
const examAPI = {
    getById: (id) => fetchAPI(`/exam/${id}`),
    create: (data) => fetchAPI('/exam/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchAPI(`/exam/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchAPI(`/exam/delete/${id}`, { method: 'PUT'}),
};
const questionAPI = {
    getByExamId: (examId) => fetchAPI(`/questions/exam/${examId}`),
    getById: (id) => fetchAPI(`/questions/${id}`),
    create: (id, data) => fetchAPI(`/questions/${id}`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchAPI(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchAPI(`/questions/${id}`, { method: 'DELETE' }),
};
const answerAPI = {
    getByQuestionId: (questionId) => fetchAPI(`/questions/${questionId}/answers`),
    getById: (id) => fetchAPI(`/answers/${id}`, { headers: { 'type': '0' } }),
    create: (data) => fetchAPI('/answers/', { method: 'POST', body: JSON.stringify(data), headers: { 'type': '0' } }),
    update: (id, data) => fetchAPI(`/answers/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'type': '0' } }),
    delete: (id) => fetchAPI(`/answers/${id}`, { method: 'DELETE', headers: { 'type': '0' } }),
};

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
    if (!breadcrumbsContainer) { console.error("Breadcrumbs container not found"); return; }
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
    if(currentView === 'questionDetail' && currentQuestionContent) {
         html += ` &gt; <span class="breadcrumb-item" data-level="exams" data-id="${currentExamIdForQuestionsManagement}" onclick="viewDetail('exam', ${currentExamIdForQuestionsManagement})">${currentExamName.replace(/"/g, '&quot;')}</span>`;
         html += ` &gt; <span class="breadcrumb-item active">QL Đáp án cho: "${currentQuestionContent.substring(0,20).replace(/"/g, '&quot;')}..."</span>`;
    }
    breadcrumbsContainer.innerHTML = html;
}

function updateManagementTitleAndButton() {
    if (!managementTitle || !addNewBtn || !contentTabs) {console.error("Missing core UI elements for title/button update"); return;}
    let title = "Quản lý ";
    let btnText = "Thêm ";
    let showAddNew = true;

    switch (currentView) {
        case 'topics':
            title += "Chủ đề"; btnText += "Chủ đề mới";
            contentTabs.style.display = 'none';
            addNewBtn.onclick = () => openFormModal('add', 'topic');
            break;
        case 'subtopics':
            title += `Chủ đề con của "${currentTopicName}"`; btnText += "Chủ đề con mới";
            contentTabs.style.display = 'none';
            addNewBtn.onclick = () => openFormModal('add', 'subtopic', null, currentTopicId);
            break;
        case 'posts':
            title += `Bài học của "${currentSubTopicName}"`; btnText += "Bài học mới";
            contentTabs.style.display = 'flex'; setActiveTabButton('posts');
            addNewBtn.onclick = () => openFormModal('add', 'post', null, currentSubTopicId);
            break;
        case 'exams':
            title += `Bài KT của "${currentSubTopicName}"`; btnText += "Bài KT mới";
            contentTabs.style.display = 'flex'; setActiveTabButton('exams');
            addNewBtn.onclick = () => openFormModal('add', 'exam', null, currentSubTopicId);
            break;
        case 'postDetail':
            title = `Chi tiết Bài học: ${currentPostName.replace(/"/g, '&quot;')}`; showAddNew = false;
            contentTabs.style.display = 'none';
            break;
        case 'examDetail':
            title = `Chi tiết Bài KT: ${currentExamName.replace(/"/g, '&quot;')}`; showAddNew = false; 
            contentTabs.style.display = 'none';
            break;
        case 'questionDetail':
            title = `Quản lý Đáp án cho Câu hỏi Q${currentQuestionId}`; showAddNew = false;
            contentTabs.style.display = 'none';
            break;
        default:
            title = "Quản lý"; showAddNew = false;
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
    if (!contentTabs) return;
    contentTabs.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.contentType === activeType) btn.classList.add('active');
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
            renderTopicHeaders(); data = await topicAPI.getAll();
            currentDataCache = data; renderTopicRows(data);
        } else if (currentView === 'subtopics' && currentTopicId) {
            renderSubTopicHeaders(); data = await topicAPI.getSubTopics(currentTopicId);
            currentDataCache = data; renderSubTopicRows(data);
        } else if (currentView === 'posts' && currentSubTopicId) {
            renderPostHeaders(); data = await subTopicAPI.getPosts(currentSubTopicId);
            currentDataCache = data.filter(item => !item.is_deleted); renderPostRows(currentDataCache);
        } else if (currentView === 'exams' && currentSubTopicId) {
            renderExamHeaders(); data = await subTopicAPI.getExams(currentSubTopicId);
            currentDataCache = data.filter(item => !item.is_deleted); renderExamRows(currentDataCache);
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

function renderTopicHeaders() { if(dataTableThead) dataTableThead.innerHTML = `<tr><th>ID</th><th>Tên Chủ đề</th><th>Hành động</th></tr>`; }
function renderTopicRows(topics) {
    if (!dataTableTbody) return;
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

function renderSubTopicHeaders() { if(dataTableThead) dataTableThead.innerHTML = `<tr><th>ID</th><th>Tên Chủ đề con</th><th>Hành động</th></tr>`; }
function renderSubTopicRows(subtopics) {
    if (!dataTableTbody) return;
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

function renderPostHeaders() { if(dataTableThead) dataTableThead.innerHTML = `<tr><th>ID</th><th>Tên Bài học</th><th>Hành động</th></tr>`; }
function renderPostRows(posts) {
    if (!dataTableTbody) return;
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

function renderExamHeaders() { if(dataTableThead) dataTableThead.innerHTML = `<tr><th>ID</th><th>Tên Bài kiểm tra</th><th>Hành động</th></tr>`;}
function renderExamRows(exams) {
    if (!dataTableTbody) return;
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
    if(!dataTableTbody) return;
    dataTableTbody.querySelectorAll('tr.clickable-row').forEach(row => {
        row.addEventListener('click', () => {
            const id = parseInt(row.dataset.id);
            const name = row.dataset.name;
            if (currentView === 'topics') window.navigateToLevel('subtopics', id, name);
            else if (currentView === 'subtopics') window.navigateToLevel('posts', id, name);
            else if (currentView === 'posts') window.viewDetail('post', id);
            else if (currentView === 'exams') window.viewDetail('exam', id);
        });
    });
}

// --- GLOBAL FUNCTIONS (called from HTML) ---
window.navigateToLevel = (level, id = null, name = '') => {
    currentView = level;
    if (level === 'topics') {
        currentTopicId = null; currentTopicName = ''; currentSubTopicId = null; currentSubTopicName = '';
        currentPostId = null; currentPostName = ''; currentExamId = null; currentExamName = '';
    } else if (level === 'subtopics') {
        currentTopicId = id; currentTopicName = name; currentSubTopicId = null; currentSubTopicName = '';
        currentPostId = null; currentPostName = ''; currentExamId = null; currentExamName = '';
    } else if (level === 'posts' || level === 'exams') {
        currentSubTopicId = id; currentSubTopicName = name; currentContentListType = level;
        currentPostId = null; currentPostName = ''; currentExamId = null; currentExamName = '';
    }
    if(detailModal) detailModal.style.display = 'none';
    if(examQuestionsSection) examQuestionsSection.style.display = 'none';
    if(formModal) formModal.style.display = 'none';
    renderTable();
};

window.switchContentType = (type) => {
    currentContentListType = type;
    currentView = type;
    renderTable();
};

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
            if (entityType === 'topic') entityData = await topicAPI.getById(id);
            else if (entityType === 'subtopic') entityData = await subTopicAPI.getById(id);
            else if (entityType === 'post') entityData = await postAPI.getById(id);
            else if (entityType === 'exam') entityData = await examAPI.getById(id);
            else if (entityType === 'question') entityData = await questionAPI.getById(id);
            else if (entityType === 'answer') entityData = await answerAPI.getById(id);
        } catch (error) {
            alert(`Lỗi tải dữ liệu để sửa: ${error.message}`);
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
            fieldsHtml = `
                <div class="form-group">
                    <label for="modalEntityName">Tên Chủ đề con:</label>
                    <input type="text" id="modalEntityName" name="name" value="${(entityData.name || '').replace(/"/g, '&quot;')}" required>
                </div>
                <input type="hidden" name="topic_id" value="${currentParentId || entityData.topic_id || currentTopicId}">`; // SỬA: topic_id
            break;

        case 'post':
            fieldsHtml = `
                <div class="form-group">
                    <label for="modalEntityName">Tên Bài học:</label>
                    <input type="text" id="modalEntityName" name="post_name" value="${(entityData.post_name || '').replace(/"/g, '&quot;')}" required></div>
                <div class="form-group">
                    <label for="modalContent">Nội dung:</label>
                    <textarea id="modalContent" name="content" rows="10" required>${contentValue}</textarea>
                </div>
                <input type="hidden" name="sub_topic_id" value="${currentParentId || entityData.sub_topic_id || currentSubTopicId}">`; // SỬA: sub_topic_id
            break;

        case 'exam':
            fieldsHtml = `
                <div class="form-group">
                    <label for="modalEntityName">Tên Bài KT:</label>
                    <input type="text" id="modalEntityName" name="name" value="${(entityData.name || '').replace(/"/g, '&quot;')}" required>
                </div>
                <input type="hidden" name="sub_topic_id" value="${currentParentId || entityData.sub_topic_id || currentSubTopicId}">`;
                // <input type="hidden" name="is_deleted" value="false"> // SỬA: sub_topic_id
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
        if(modalId == 'formModal'){
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
                apiCallPromise = topicAPI.delete(id);
                break;
            case 'subtopic':
                apiCallPromise = subTopicAPI.delete(id);
                break;
            case 'post':
                apiCallPromise = postAPI.delete(id);
                break;
            case 'exam':
                apiCallPromise = examAPI.delete(id);
                break;
            case 'question':
                apiCallPromise = questionAPI.delete(id);
                break;
            case 'answer':
                apiCallPromise = answerAPI.delete(id);
                break;
            default:
                alert("Lỗi: Loại thực thể không xác định để xóa!");
                return; // Dừng nếu không hợp lệ
        }

        // 2. Thực hiện lời gọi API và xử lý kết quả
        try {
            console.log(`Đang xóa ${entityType} với ID: ${id}`);
            
            // Đợi API hoàn thành (sử dụng fetchAPI đã cải tiến)
            const result = await apiCallPromise; 
            
            console.log("Phản hồi xóa:", result); // Log kết quả (có thể là text hoặc null)

            // Thông báo thành công
            alert(`Xóa ${displayName} thành công!`);

            // 3. Render lại giao diện phù hợp
            // (Giữ nguyên logic render phức tạp của bạn)
            if (entityType === 'question' && currentExamIdForQuestionsManagement) {
                await renderQuestionsForExam(currentExamIdForQuestionsManagement);
            } else if (entityType === 'answer' && currentQuestionId) {
                 // Giả sử các biến này tồn tại và được quản lý đúng
                const formModal = document.getElementById('formModal'); 
                const detailModal = document.getElementById('detailModal');

                if(formModal && formModal.style.display === 'flex' && currentView === 'questionDetail') { 
                    await window.manageAnswersForQuestion(currentQuestionId, currentQuestionContent, currentExamIdForQuestionsManagement);
                } else if (detailModal && detailModal.style.display === 'flex' && currentExamIdForQuestionsManagement){
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
                alert(`Không thể xoá ${displayName} mặc định.`);
            } else {
                alert(`Lỗi xóa ${displayName}: ${error.message}`);
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
            entityData = await postAPI.getById(id);
            currentPostId = id; currentPostName = entityData.post_name;
            detailModalTitle.textContent = `Chi tiết Bài học: ${entityData.post_name}`;
            contentHtml = `<h4>ID: ${entityData.post_id}</h4><p><strong>Tên:</strong> ${entityData.post_name}</p>
                           <p><strong>Nội dung:</strong></p><div class="content-display">${entityData.content ? entityData.content.replace(/\n/g, '<br>') : 'Chưa có nội dung.'}</div>`;
            currentView = 'postDetail'; 
            detailModalContent.innerHTML = contentHtml;
        } else if (entityType === 'exam') {
            entityData = await examAPI.getById(id);
            currentExamId = id; currentExamName = entityData.name;
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
    if (entityType === 'topic') return 'Chủ đề';
    if (entityType === 'subtopic') return 'Chủ đề con';
    if (entityType === 'post') return 'Bài học';
    if (entityType === 'exam') return 'Bài kiểm tra';
    if (entityType === 'question') return 'Câu hỏi';
    if (entityType === 'answer') return 'Câu trả lời';
    return 'mục';
}

async function renderQuestionsForExam(examId) {
    if (!examQuestionsList || !addQuestionToExamBtn) {
        console.error("examQuestionsList or addQuestionToExamBtn not found in renderQuestionsForExam"); return;
    }
    examQuestionsList.innerHTML = '<li>Đang tải câu hỏi...</li>';
    addQuestionToExamBtn.onclick = () => window.openFormModal('add', 'question', null, examId);

    try {
        const questions = await questionAPI.getByExamId(examId);
        if (!questions || questions.length === 0) {
            examQuestionsList.innerHTML = '<li class="list-group-item">Bài kiểm tra này chưa có câu hỏi nào.</li>'; return;
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
                        </div></div></li>`;
        }
        questionsHtml += '</ul>';
        examQuestionsList.innerHTML = questionsHtml;
    } catch (error) {
        examQuestionsList.innerHTML = `<li class="list-group-item text-danger">Lỗi tải câu hỏi: ${error.message}</li>`;
    }
}

window.manageAnswersForQuestion = async (questionId, questionContent, examIdForReturn = null) => {
    if (!formModal || !modalTitle || !formFields || !entityForm) {
         console.error("Modal elements not found in manageAnswersForQuestion"); return;
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
        const answers = await answerAPI.getByQuestionId(questionId);
        if (answers && answers.length > 0) {
            answersHtml += answers.map(ans => `
    <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>${ans.content} ${ans.isCorrect ? '<i class="fas fa-check-circle text-success ml-2"></i>' : ''}</span>
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
    if (submitButton) submitButton.style.display = 'none';
    formModal.classList.add('front'); 
    formModal.style.display = 'flex';
    renderBreadcrumbs();
};


// --- MAIN SCRIPT EXECUTION ---
document.addEventListener('DOMContentLoaded', () => {
    // Gán các DOM elements
    managementTitle = document.getElementById('managementTitle');
    breadcrumbsContainer = document.getElementById('breadcrumbs');
    searchInput = document.getElementById('searchInput');
    searchBtn = document.getElementById('searchBtn');
    addNewBtn = document.getElementById('addNewBtn');
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
        if (currentEntityType === 'subtopic') data.topic_id = parseInt(currentParentId);
        else if (currentEntityType === 'post') data.sub_topic_id = parseInt(currentParentId);
        else if (currentEntityType === 'exam') data.sub_topic_id = parseInt(currentParentId);
        // else if (currentEntityType === 'question') data.exam_id = parseInt(currentParentId);
        else if (currentEntityType === 'answer') data.question_id = parseInt(currentParentId);

        // Chuyển đổi kiểu dữ liệu nếu cần
        if (data.question_type_id) data.question_type_id = parseInt(data.question_type_id);
        // if(data.is_deleted) {
        // const value = data.is_deleted;
        // const isDeleted = value === "true" ? true : false;
        // data.is_deleted = isDeleted;
    // }

        // Xử lý checkbox 'isCorrect'
        if (currentEntityType === 'answer') {
            const isCorrectCheckbox = document.getElementById('modalIsCorrect');
            data.is_correct = isCorrectCheckbox ? isCorrectCheckbox.checked : false;
        }

        // Gán ID thực thể khi chỉnh sửa (cho payload)
        if (currentEditingId) {
            if (currentEntityType === 'topic') data.topic_id = currentEditingId;
            else if (currentEntityType === 'subtopic') data.sub_topic_id = currentEditingId;
            else if (currentEntityType === 'post') data.post_id = currentEditingId;
            else if (currentEntityType === 'exam') data.exam_id = currentEditingId;
            else if (currentEntityType === 'question') data.question_id = currentEditingId;
            else if (currentEntityType === 'answer') data.answer_id = currentEditingId;
        }

        // --- 2. Xác định API cần gọi ---
        let apiCallPromise;
        const entityId = currentEditingId;

        switch (currentEntityType) {
            case 'topic':
                apiCallPromise = entityId ? topicAPI.update(entityId, data) : topicAPI.create(data);
                break;
            case 'subtopic':
                apiCallPromise = entityId ? subTopicAPI.update(entityId, data) : subTopicAPI.create(data);
                break;
            case 'post':
                apiCallPromise = entityId ? postAPI.update(entityId, data) : postAPI.create(data);
                break;
            case 'exam':
                apiCallPromise = entityId ? examAPI.update(entityId, data) : examAPI.create(data);
                break;
            case 'question':
                apiCallPromise = entityId ? questionAPI.update(entityId, data) : questionAPI.create(currentParentId, data);
                break;
            case 'answer':
                apiCallPromise = entityId ? answerAPI.update(entityId, data) : answerAPI.create(data);
                break;
            default:
                alert("Lỗi: Loại thực thể không xác định!");
                return; // Dừng nếu không có API phù hợp
        }

        // --- 3. Thực hiện và xử lý kết quả ---
        try {
            console.log(`Đang ${entityId ? 'cập nhật' : 'tạo mới'} ${currentEntityType}:`, data);
            
            // Đợi lời gọi API hoàn thành. Hàm fetchAPI sẽ trả về null (cho 204)
            // hoặc đối tượng JSON, hoặc ném lỗi.
            const result = await apiCallPromise; 

            console.log("Phản hồi từ API:", result);

            // Nếu không có lỗi nào được ném ra, tức là thành công
            await alert(`${entityId ? 'Cập nhật' : 'Thêm mới'} thành công!`);
            window.closeModal('formModal');

            // Render lại giao diện
            if (currentEntityType === 'question' && currentExamIdForQuestionsManagement) {
                await renderQuestionsForExam(currentExamIdForQuestionsManagement);
            } else if (currentEntityType === 'answer' && currentQuestionId) {
                await window.manageAnswersForQuestion(currentQuestionId, currentQuestionContent, currentExamIdForQuestionsManagement);
            } else {
                renderTable(); // Hàm render chung
            }

        } catch (error) {
            // Bất kỳ lỗi nào từ fetchAPI (bao gồm lỗi mạng, lỗi !response.ok, 
            // và lỗi parse JSON) sẽ được bắt ở đây.
            console.error("Đã xảy ra lỗi trong quá trình xử lý form:", error);
            alert(`Xảy ra lỗi: ${error.message}`);
        }
    };
}

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const searchTerm = searchInput.value.toLowerCase();
            if (!currentDataCache) return;
            const filteredData = currentDataCache.filter(item => {
                const name = item.name || item.post_name;
                return name && name.toLowerCase().includes(searchTerm);
            });

            if (currentView === 'topics') renderTopicRows(filteredData);
            else if (currentView === 'subtopics') renderSubTopicRows(filteredData);
            else if (currentView === 'posts') renderPostRows(filteredData);
            else if (currentView === 'exams') renderExamRows(filteredData);
        });
    }
    
    if (addNewBtn) {
        addNewBtn.addEventListener('click', () => {
            let typeToAdd = '';
            let parentIdForNew = null;

            if (currentView === 'topics') { typeToAdd = 'topic'; }
            else if (currentView === 'subtopics') { typeToAdd = 'subtopic'; parentIdForNew = currentTopicId; }
            else if (currentView === 'posts') { typeToAdd = 'post'; parentIdForNew = currentSubTopicId; }
            else if (currentView === 'exams') { typeToAdd = 'exam'; parentIdForNew = currentSubTopicId; }
            
            if (typeToAdd) {
                window.openFormModal('add', typeToAdd, null, parentIdForNew);
            } else {
                console.warn("Cannot determine entity type to add for currentView:", currentView);
            }
        });
    }
    
    window.onclick = function(event) {
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

    // Initial Load
    window.navigateToLevel('topics');
});