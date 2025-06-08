// js/Staff/grammarManagement/eventHandlers.js

// 1. IMPORT: Nhập các thành phần cần thiết từ các module khác
import { state, updateState } from './state.js';
import { elements } from './main.js';
import { 
    renderTable, 
    renderQuestionsForExam, 
    manageAnswersForQuestion as manageAnswersUI, 
    openFormModal as openFormModalUI, 
    closeModal as closeModalUI, 
    viewDetail as viewDetailUI 
} from './ui.js';
import { getEntityTypeDisplayName } from './utils.js';

// 2. API OBJECTS: Sử dụng các object API đã được nạp sẵn vào `window`
const { 
    TOPIC_MANAGEMENT_API, 
    SUB_TOPIC_MANAGEMENT_API, 
    POST_MANAGEMENT_API, 
    EXAM_MANAGEMENT_API, 
    QUESTION_MANAGEMENT_API, 
    ANSWER_MANAGEMENT_API 
} = window;

// --- NAVIGATION HANDLERS ---

/**
 * Điều hướng đến một cấp độ xem khác (topics, subtopics, posts, exams).
 * @param {string} level - Cấp độ muốn đến.
 * @param {number|null} id - ID của mục cha (ví dụ: topicId khi đến subtopics).
 * @param {string} name - Tên của mục cha.
 */
export function navigateToLevel(level, id = null, name = '') {
    const newState = {
        currentView: level,
        currentPage: 1,
        currentKeyword: '',
        currentPostId: null,
        currentPostName: '',
        currentExamId: null,
        currentExamName: '',
        currentQuestionId: null,
        currentQuestionContent: ''
    };

    if (level === 'topics') {
        Object.assign(newState, { currentTopicId: null, currentTopicName: '', currentSubTopicId: null, currentSubTopicName: '' });
    } else if (level === 'subtopics') {
        Object.assign(newState, { currentTopicId: id, currentTopicName: name, currentSubTopicId: null, currentSubTopicName: '' });
    } else if (level === 'posts' || level === 'exams') {
        Object.assign(newState, { currentSubTopicId: id, currentSubTopicName: name, currentContentListType: level });
    }

    updateState(newState);
    elements.searchInput.value = '';
    closeModalUI('detailModal'); // Đóng các modal đang mở khi điều hướng
    closeModalUI('formModal');
    renderTable();
}

/**
 * Xử lý khi người dùng click vào một hàng trong bảng.
 * @param {number} id - ID của hàng được click.
 * @param {string} name - Tên của hàng được click.
 */
export function handleRowClick(id, name) {
    switch (state.currentView) {
        case 'topics':
            navigateToLevel('subtopics', id, name);
            break;
        case 'subtopics':
            navigateToLevel('posts', id, name);
            break;
        case 'posts':
            handleViewDetail('post', id);
            break;
        case 'exams':
            handleViewDetail('exam', id);
            break;
    }
}

/**
 * Xử lý khi click nút "Trở lại".
 */
export function handleBackClick() {
    switch (state.currentView) {
        case 'subtopics':
            navigateToLevel('topics');
            break;
        case 'posts':
        case 'exams':
            navigateToLevel('subtopics', state.currentTopicId, state.currentTopicName);
            break;
        case 'postDetail':
            navigateToLevel('posts', state.currentSubTopicId, state.currentSubTopicName);
            break;
        case 'examDetail':
        case 'questionDetail':
            navigateToLevel('exams', state.currentSubTopicId, state.currentSubTopicName);
            break;
    }
}

/**
 * Chuyển đổi giữa tab "Bài học" và "Bài kiểm tra".
 * @param {string} type - 'posts' hoặc 'exams'.
 */
export function handleSwitchContentType(type) {
    if (state.currentSubTopicId) {
        navigateToLevel(type, state.currentSubTopicId, state.currentSubTopicName);
    }
}

// --- DATA & UI HANDLERS ---

/**
 * Xử lý tìm kiếm.
 */
export function handleSearch() {
    updateState({
        currentKeyword: elements.searchInput.value.trim(),
        currentPage: 1
    });
    renderTable();
}

/**
 * Xử lý chuyển trang.
 * @param {number} pageNumber - Số trang muốn đến.
 */
export function handleChangePage(pageNumber) {
    if (pageNumber < 1 || pageNumber > state.totalPages || pageNumber === state.currentPage) return;
    updateState({ currentPage: pageNumber });
    renderTable();
}

// --- MODAL & FORM HANDLERS ---

/**
 * Xử lý click nút "Thêm mới".
 */
export function handleAddNewClick() {
    const { entityType, parentId } = elements.addNewBtn.dataset;
    if (entityType) {
        handleOpenFormModal('add', entityType, null, parentId ? parseInt(parentId, 10) : null);
    }
}

/**
 * Mở form modal để thêm hoặc sửa.
 * @param {string} mode - 'add' hoặc 'edit'.
 * @param {string} entityType - Loại thực thể.
 * @param {number|null} id - ID thực thể (nếu là 'edit').
 * @param {number|null} parentId - ID của mục cha (nếu có).
 */
export async function handleOpenFormModal(mode, entityType, id = null, parentId = null) {
    updateState({ currentEditingId: id, currentEntityType: entityType, currentParentId: parentId });

    let entityData = {};
    if (mode === 'edit' && id) {
        try {
            switch (entityType) {
                case 'topic': entityData = await TOPIC_MANAGEMENT_API.getTopicById(id); break;
                case 'subtopic': entityData = await SUB_TOPIC_MANAGEMENT_API.getSubTopicById(id); break;
                case 'post': entityData = await POST_MANAGEMENT_API.getPostById(id); break;
                case 'exam': entityData = await EXAM_MANAGEMENT_API.getExamById(id); break;
                case 'question': entityData = await QUESTION_MANAGEMENT_API.getQuestionById(id); break;
                case 'answer': entityData = await ANSWER_MANAGEMENT_API.getAnswerById(id); break;
            }
        } catch (error) {
            showToast('error', 'Lỗi tải dữ liệu', error.message);
            return;
        }
    }
    openFormModalUI(mode, entityType, entityData);
}

/**
 * Xử lý submit form.
 * @param {Event} event - Sự kiện submit.
 */
export async function handleFormSubmit1(event) {
    event.preventDefault();
    const formData = new FormData(elements.entityForm);
    let data = Object.fromEntries(formData.entries());
    const { currentEntityType: entityType, currentEditingId: entityId, currentParentId } = state;

    try {
        // Chuẩn bị dữ liệu payload
        if (entityType === 'answer') {
            const isCorrectCheckbox = document.getElementById('modalIsCorrect');
            data.is_correct = isCorrectCheckbox ? isCorrectCheckbox.checked : false;
        } else if (entityType === 'subtopic' || entityType === 'post' || entityType === 'exam') {
            data[entityType === 'subtopic' ? 'topic_id' : 'sub_topic_id'] = currentParentId;
        }
        
        if (entityId) data[`${entityType}_id`] = entityId;

        let apiCall;
        switch (entityType) {
            case 'topic': apiCall = entityId ? TOPIC_MANAGEMENT_API.updateTopic(entityId, data) : TOPIC_MANAGEMENT_API.createTopic(data); break;
            case 'subtopic': apiCall = entityId ? SUB_TOPIC_MANAGEMENT_API.updateSubTopic(entityId, data) : SUB_TOPIC_MANAGEMENT_API.createSubTopic(data); break;
            case 'post': apiCall = entityId ? POST_MANAGEMENT_API.updatePost(entityId, data) : POST_MANAGEMENT_API.createPost(data); break;
            case 'exam': apiCall = entityId ? EXAM_MANAGEMENT_API.updateExam(entityId, data) : EXAM_MANAGEMENT_API.createExam(data); break;
            case 'question': apiCall = entityId ? QUESTION_MANAGEMENT_API.updateQuestion(entityId, data) : QUESTION_MANAGEMENT_API.createQuestion(currentParentId, data); break;
            case 'answer': apiCall = entityId ? ANSWER_MANAGEMENT_API.updateAnswer(entityId, data) : ANSWER_MANAGEMENT_API.createAnswer(data); break;
            default: throw new Error("Loại thực thể không xác định.");
        }

        const result = await apiCall;
        if (result.status < 200 || result.status >= 300) throw new Error(result.message || "Thao tác thất bại");
        
        showToast('success', 'Thành công!', `${entityId ? 'Cập nhật' : 'Thêm mới'} thành công.`);
        closeModalUI('formModal');

        // Render lại giao diện phù hợp
        if (entityType === 'question') await renderQuestionsForExam(state.currentExamIdForQuestionsManagement);
        else if (entityType === 'answer') await manageAnswersUI(state.currentQuestionId, state.currentQuestionContent);
        else renderTable();
    } catch (error) {
        showToast('error', 'Lỗi', error.message);
    }
}

// ... (các hàm import và các hàm khác giữ nguyên)

export async function handleFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(elements.entityForm);
    let data = Object.fromEntries(formData.entries());
    const { currentEntityType: entityType, currentEditingId: entityId, currentParentId } = state;

    try {
        // ✅ SỬA LỖI LOGIC: Xử lý giá trị từ checkbox
        if (entityType === 'answer') {
            // Chuyển đổi giá trị 'on' thành true, và undefined thành false.
            data.is_correct = data.is_correct === 'on';
        }
        
        // Logic xác định ID cha một cách chính xác
        const originalParentId = document.getElementById('originalParentId')?.value;
        if (entityType === 'subtopic') {
            data.topic_id = currentParentId || originalParentId || state.currentTopicId;
        } else if (entityType === 'post' || entityType === 'exam') {
            data.sub_topic_id = currentParentId || originalParentId || state.currentSubTopicId;
        }
        
        if (entityId) data[`${entityType}_id`] = entityId;

        let apiCall;
        switch (entityType) {
            case 'topic': apiCall = entityId ? TOPIC_MANAGEMENT_API.updateTopic(entityId, data) : TOPIC_MANAGEMENT_API.createTopic(data); break;
            case 'subtopic': apiCall = entityId ? SUB_TOPIC_MANAGEMENT_API.updateSubTopic(entityId, data) : SUB_TOPIC_MANAGEMENT_API.createSubTopic(data); break;
            case 'post': apiCall = entityId ? POST_MANAGEMENT_API.updatePost(entityId, data) : POST_MANAGEMENT_API.createPost(data); break;
            case 'exam': apiCall = entityId ? EXAM_MANAGEMENT_API.updateExam(entityId, data) : EXAM_MANAGEMENT_API.createExam(data); break;
            case 'question': apiCall = entityId ? QUESTION_MANAGEMENT_API.updateQuestion(entityId, data) : QUESTION_MANAGEMENT_API.createQuestion(currentParentId, data); break;
            case 'answer': apiCall = entityId ? ANSWER_MANAGEMENT_API.updateAnswer(entityId, data) : ANSWER_MANAGEMENT_API.createAnswer(data); break;
            default: throw new Error("Loại thực thể không xác định.");
        }

        const result = await apiCall;
        if (result.status < 200 || result.status >= 300) throw new Error(result.message || "Thao tác thất bại");
        
        showToast('success', 'Thành công!', `${entityId ? 'Cập nhật' : 'Thêm mới'} thành công.`);
        closeModalUI('formModal');

        // Render lại giao diện phù hợp
        if (entityType === 'question') await renderQuestionsForExam(state.currentExamIdForQuestionsManagement);
        else if (entityType === 'answer') await manageAnswersUI(state.currentQuestionId, state.currentQuestionContent);
        else renderTable();

    } catch (error) {
        showToast('error', 'Lỗi', error.message);
    }
}

// ... (các hàm khác giữ nguyên)

/**
 * Xử lý xóa một thực thể.
 * @param {string} entityType - Loại thực thể.
 * @param {number} id - ID của thực thể.
 */
export async function handleDelete(entityType, id) {
    const displayName = getEntityTypeDisplayName(entityType);
    if (!confirm(`Bạn có chắc muốn xóa ${displayName} (ID: ${id}) không?`)) return;

    try {
        let apiCall;
        switch (entityType) {
            case 'topic': apiCall = TOPIC_MANAGEMENT_API.deleteTopic(id); break;
            case 'subtopic': apiCall = SUB_TOPIC_MANAGEMENT_API.deleteSubTopic(id); break;
            case 'post': apiCall = POST_MANAGEMENT_API.deletePost(id); break;
            case 'exam': apiCall = EXAM_MANAGEMENT_API.deleteExam(id); break;
            case 'question': apiCall = QUESTION_MANAGEMENT_API.deleteQuestion(id); break;
            case 'answer': apiCall = ANSWER_MANAGEMENT_API.deleteAnswer(id); break;
            default: throw new Error("Loại thực thể không xác định.");
        }
        await apiCall;
        showToast('success', 'Thành công', `Đã xóa ${displayName}.`);
        
        if (entityType === 'question') await renderQuestionsForExam(state.currentExamIdForQuestionsManagement);
        else if (entityType === 'answer') await manageAnswersUI(state.currentQuestionId, state.currentQuestionContent);
        else renderTable();
    } catch (error) {
        showToast('error', 'Lỗi', error.message);
    }
}

/**
 * Xử lý xem chi tiết một thực thể.
 * @param {string} entityType - Loại thực thể.
 * @param {number} id - ID của thực thể.
 */
export async function handleViewDetail(entityType, id) {
    try {
        let entityData;
        if (entityType === 'post') {
            entityData = await POST_MANAGEMENT_API.getPostById(id);
            updateState({ currentPostId: id, currentPostName: entityData.post_name, currentView: 'postDetail' });
        } else if (entityType === 'exam') {
            entityData = await EXAM_MANAGEMENT_API.getExamById(id);
            updateState({ currentExamId: id, currentExamName: entityData.name, currentExamIdForQuestionsManagement: id, currentView: 'examDetail' });
        } else return;
        
        viewDetailUI(entityType, entityData);
    } catch (error) {
        showToast('error', 'Lỗi tải chi tiết', error.message);
    }
}

/**
 * Xử lý đóng modal.
 * @param {string} modalId - ID của modal cần đóng.
 */
export function handleCloseModal(modalId) {
    if (modalId === 'detailModal' && (state.currentView === 'postDetail' || state.currentView === 'examDetail')) {
        handleBackClick();
    } else {
        closeModalUI(modalId);
    }
}

/**
 * Xử lý khi click ra ngoài modal.
 * @param {Event} event - Sự kiện click.
 */
export function handleWindowClick(event) {
    if (event.target === elements.formModal) handleCloseModal('formModal');
    if (event.target === elements.detailModal) handleCloseModal('detailModal');
}