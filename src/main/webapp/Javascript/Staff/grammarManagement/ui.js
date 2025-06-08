import { state, updateState } from './state.js';
import { elements } from './main.js';
import { getEntityTypeDisplayName, escapeHTML } from './utils.js';

// API objects để renderTable có thể lấy dữ liệu
const { 
    TOPIC_MANAGEMENT_API, 
    SUB_TOPIC_MANAGEMENT_API, 
    POST_MANAGEMENT_API, 
    EXAM_MANAGEMENT_API
} = window;

// --- BREADCRUMBS, TITLE, TABS ---
// Giữ nguyên các hàm này vì chúng đã hoạt động đúng
export function renderBreadcrumbs() { /* ... code đã hoàn thiện ở lần trước ... */ }
export function updateManagementTitleAndButton() { /* ... code đã hoàn thiện ở lần trước ... */ }
export function setActiveTabButton(activeType) { /* ... code đã hoàn thiện ở lần trước ... */ }

// --- TABLE & ROWS RENDERING ---
// Giữ nguyên các hàm render headers và rows, chúng chỉ tạo HTML và đã dùng data-attributes
function renderTopicHeaders() { elements.dataTableThead.innerHTML = `<tr><th>ID</th><th>Tên Chủ đề</th><th>Hành động</th></tr>`; }
function renderTopicRows(topics) { /* ... */ }
function renderSubTopicHeaders() { elements.dataTableThead.innerHTML = `<tr><th>ID</th><th>Tên Chủ đề con</th><th>Hành động</th></tr>`; }
function renderSubTopicRows(subtopics) { /* ... */ }
function renderPostHeaders() { elements.dataTableThead.innerHTML = `<tr><th>ID</th><th>Tên Bài học</th><th>Hành động</th></tr>`; }
function renderPostRows(posts) { /* ... */ }
function renderExamHeaders() { elements.dataTableThead.innerHTML = `<tr><th>ID</th><th>Tên Bài kiểm tra</th><th>Hành động</th></tr>`; }
function renderExamRows(exams) { /* ... */ }

// --- MAIN RENDER FUNCTION ---
// Hàm này được sửa lại để gọi đúng API cho 'exams'
export async function renderTable() {
    if (!elements.dataTableTbody || !elements.dataTableThead) return;

    elements.dataTableThead.innerHTML = '';
    elements.dataTableTbody.innerHTML = '<tr><td colspan="3">Đang tải dữ liệu...</td></tr>';
    elements.paginationContainer.innerHTML = '';

    try {
        let result = {};
        let data = [];
        let totalPages = 0;

        switch (state.currentView) {
            case 'topics':
                renderTopicHeaders();
                result = await TOPIC_MANAGEMENT_API.fetchTopicList({ page: state.currentPage, pageSize: 10, keyword: state.currentKeyword });
                data = result.topics;
                totalPages = result.totalPages;
                renderTopicRows(data);
                break;
            case 'subtopics':
                renderSubTopicHeaders();
                result = await SUB_TOPIC_MANAGEMENT_API.fetchSubTopicList({ page: state.currentPage, pageSize: 10, topicId: state.currentTopicId, keyword: state.currentKeyword });
                data = result.subTopics;
                totalPages = result.totalPages;
                renderSubTopicRows(data);
                break;
            case 'posts':
                renderPostHeaders();
                result = await POST_MANAGEMENT_API.fetchPostList({ page: state.currentPage, pageSize: 10, subTopicId: state.currentSubTopicId, keyword: state.currentKeyword });
                data = result.posts;
                totalPages = result.totalPages;
                renderPostRows(data);
                break;
            case 'exams':
                renderExamHeaders();
                // ✅ SỬA LỖI: Dùng đúng API gốc, không có phân trang
                data = await SUB_TOPIC_MANAGEMENT_API.getSubTopicExams(state.currentSubTopicId);
                totalPages = 0; // Không có phân trang cho view này
                renderExamRows(data);
                break;
            default:
                elements.dataTableTbody.innerHTML = '';
                totalPages = 0;
        }
        
        updateState({ totalPages: totalPages, currentDataCache: data });
        if (totalPages > 0) {
            renderPagination();
        }
        updateManagementTitleAndButton();
        renderBreadcrumbs();

    } catch (error) {
        console.error("Lỗi khi render bảng:", error);
        elements.dataTableTbody.innerHTML = `<tr><td colspan="3">Lỗi tải dữ liệu: ${error.message}</td></tr>`;
    }
}


// --- PAGINATION ---
export function renderPagination() { /* ... Giữ nguyên code đã hoàn thiện ... */ }


// --- MODAL & DETAIL UI (PHẦN QUAN TRỌNG NHẤT) ---

/**
 * Hàm này giờ đây tái tạo 100% logic giao diện của form gốc.
 * @param {string} mode - 'add' hoặc 'edit'.
 * @param {string} entityType - Loại thực thể.
 * @param {object} entityData - Dữ liệu của thực thể (rỗng nếu là 'add').
 */
// ... (Các hàm import và các hàm khác giữ nguyên)

export function openFormModal(mode, entityType, entityData) {
    elements.entityForm.reset();
    elements.modalTitle.textContent = `${mode === 'edit' ? 'Chỉnh sửa' : 'Thêm mới'} ${getEntityTypeDisplayName(entityType)}`;

    let fieldsHtml = '';
    const nameValue = escapeHTML(entityData.name || entityData.post_name || '');
    const contentValue = escapeHTML(entityData.content || '');
    
    // Trường ẩn để lưu ID cha ban đầu khi edit, phòng trường hợp không chọn cha mới
    const originalParentIdField = entityType === 'subtopic' ? 
        `<input type="hidden" id="originalParentId" value="${entityData.topic_id || ''}">` :
        (entityType === 'post' || entityType === 'exam') ? 
        `<input type="hidden" id="originalParentId" value="${entityData.sub_topic_id || ''}">` : '';

    switch (entityType) {
        case 'topic':
            fieldsHtml = `<div class="form-group">
                            <label for="modalEntityName">Tên Chủ đề:</label>
                            <input type="text" id="modalEntityName" name="name" value="${nameValue}" required>
                          </div>`;
            break;

        case 'subtopic':
            fieldsHtml = `<div class="form-group">
                            <label for="modalEntityName">Tên Chủ đề con:</label>
                            <input type="text" id="modalEntityName" name="name" value="${nameValue}" required>
                          </div>
                          <div class="form-group">
                            <label>Topic cha:</label>
                            <input type="text" class="parent-display" id="parentDisplay" value="${escapeHTML(state.currentTopicName)}" readonly>
                          </div>
                          ${originalParentIdField}`;
            if (mode === 'edit') {
                fieldsHtml += `<div class="form-group">
                                 <label>Đổi Topic cha (tùy chọn):</label>
                                 <div class="modal-search-box">
                                   <input type="text" id="parentSearchInput" placeholder="Tìm Topic...">
                                   <button type="button" class="btn-primary" data-action="load-parents" data-parent-type="topic">Tìm</button>
                                 </div>
                                 <div class="parent-list" id="parentListContainer"></div>
                               </div>`;
            }
            break;

        case 'post':
        case 'exam':
            fieldsHtml = `<div class="form-group">
                            <label for="modalEntityName">Tên ${entityType === 'post' ? 'Bài học' : 'Bài KT'}:</label>
                            <input type="text" id="modalEntityName" name="${entityType === 'post' ? 'post_name' : 'name'}" value="${nameValue}" required>
                          </div>`;
            if (entityType === 'post') {
                fieldsHtml += `<div class="form-group">
                                 <label for="modalContent">Nội dung:</label>
                                 <textarea id="modalContent" name="content" rows="10" required>${contentValue}</textarea>
                               </div>`;
            }
            fieldsHtml += `<div class="form-group">
                             <label>Chủ đề con:</label>
                             <input type="text" class="parent-display" id="parentDisplay" value="${escapeHTML(state.currentSubTopicName)}" readonly>
                           </div>
                           ${originalParentIdField}`;
            if (mode === 'edit') {
                fieldsHtml += `<div class="form-group">
                                 <label>Đổi Chủ đề con (tùy chọn):</label>
                                 <div class="modal-search-box">
                                   <input type="text" id="parentSearchInput" placeholder="Tìm Chủ đề con...">
                                   <button type="button" class="btn-primary" data-action="load-parents" data-parent-type="subtopic">Tìm</button>
                                 </div>
                                 <div class="parent-list" id="parentListContainer"></div>
                               </div>`;
            }
            break;
            
        case 'question':
            const questionTypeValue = entityData.question_type_id || 1;
            const questionContentValue = entityData.content || '';
            
            fieldsHtml = `
                <div class="form-group">
                    <label for="modalContent">Nội dung câu hỏi:</label>
                    <textarea id="modalContent" name="content" rows="3" required>${escapeHTML(questionContentValue)}</textarea>
                </div>
                <div class="form-group">
                    <label for="modalQuestionTypeId">Loại câu hỏi:</label>
                    <select id="modalQuestionTypeId" name="question_type_id" required>
                        <option value="1" ${questionTypeValue == 1 ? 'selected' : ''}>Một lựa chọn</option>
                        <option value="2" ${questionTypeValue == 2 ? 'selected' : ''}>Nhiều lựa chọn</option>
                    </select>
                </div>`;
            break;

        case 'answer':
            const answerContentValue = entityData.content || '';
            const isCorrectValue = entityData.is_correct || false;

            fieldsHtml = `
                <div class="form-group">
                    <label for="modalContentAns">Nội dung câu trả lời:</label>
                    <input type="text" id="modalContentAns" name="content" value="${escapeHTML(answerContentValue)}" required>
                </div>
                <div class="checkbox-modern">
                    <input type="checkbox" id="modalIsCorrect" name="is_correct" ${isCorrectValue ? 'checked' : ''}>
                    <label for="modalIsCorrect">
                        <span style="color:#34c759;font-size:1.2em;">&#10003;</span>
                        Là đáp án đúng?
                    </label>
                </div>`;
            break;
        // ================================================================
        // ✅ PHẦN HOÀN THIỆN KẾT THÚC TẠI ĐÂY
        // ================================================================

        default:
            fieldsHtml = `<p class="error-message">Loại thực thể không được hỗ trợ: ${entityType}</p>`;
            break;
    }

    elements.formFields.innerHTML = fieldsHtml + originalParentIdField; // Thêm trường ẩn vào cuối
    elements.formModal.style.display = 'flex';
    elements.formModal.querySelector('button[type="submit"]').style.display = 'block';

    // Logic tự động tải danh sách cha khi edit
    if (mode === 'edit' && (entityType === 'subtopic' || entityType === 'post' || entityType === 'exam')) {
        setTimeout(() => {
            const loadButton = elements.formModal.querySelector('button[data-action="load-parents"]');
            if(loadButton) loadButton.click();
        }, 100);
    }
}

/**
 * Render danh sách các mục cha để lựa chọn trong modal.
 */
export function renderParentList(items, parentType) {
    const container = document.getElementById('parentListContainer');
    if (!container) return;
    if (!items || items.length === 0) {
        container.innerHTML = '<div class="no-data">Không tìm thấy kết quả.</div>';
        return;
    }
    container.innerHTML = items.map(item => {
        const id = item.topic_id || item.sub_topic_id;
        const name = item.name;
        return `<div class="parent-item" data-action="select-parent" data-id="${id}" data-name="${escapeHTML(name)}">
                    <span>#${id} - ${escapeHTML(name)}</span>
                </div>`;
    }).join('');
}


// Các hàm UI còn lại như closeModal, viewDetail, renderQuestionsForExam... giữ nguyên
export function closeModal(modalId) { /* ... */ }
export async function viewDetail(entityType, entityData) { /* ... */ }
export async function renderQuestionsForExam(examId) { /* ... */ }
export async function manageAnswersForQuestion(questionId, questionContent) { /* ... */ }