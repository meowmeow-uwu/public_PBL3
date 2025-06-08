// js/Staff/grammarManagement/main.js

// 1. IMPORT: Nhập tất cả các hàm xử lý logic từ module eventHandlers
import {
    navigateToLevel,
    handleSearch,
    handleChangePage,
    handleFormSubmit,
    handleDelete,
    handleOpenFormModal,
    handleViewDetail,
    handleRowClick,
    handleSwitchContentType,
    handleBackClick,
    handleCloseModal,
    handleAddNewClick,
    handleWindowClick
} from './eventHandlers.js'; // Giả sử các hàm này đã được định nghĩa trong eventHandlers.js

// 2. EXPORT: Xuất object chứa các element DOM để các module khác có thể tái sử dụng
export const elements = {
    managementTitle: document.getElementById('managementTitle'),
    breadcrumbsContainer: document.getElementById('breadcrumbs'),
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    addNewBtn: document.getElementById('addNewBtn'),
    backBtn: document.getElementById('backBtn'),
    contentTabs: document.getElementById('contentTabs'),
    dataTable: document.getElementById('dataTable'),
    dataTableThead: document.querySelector('#dataTable thead'),
    dataTableTbody: document.querySelector('#dataTable tbody'),
    paginationContainer: document.getElementById('pagination'),
    
    // Modal elements
    formModal: document.getElementById('formModal'),
    modalTitle: document.getElementById('modalTitle'),
    formFields: document.getElementById('formFields'),
    entityForm: document.getElementById('entityForm'),
    closeFormModal: document.getElementById('closeFormModal'),

    detailModal: document.getElementById('detailModal'),
    detailModalTitle: document.getElementById('detailModalTitle'),
    detailModalContent: document.getElementById('detailModalContent'),
    closeDetailModal: document.getElementById('closeDetailModal'),
    
    examQuestionsSection: document.getElementById('examQuestionsSection'),
    examQuestionsList: document.getElementById('examQuestionsList'),
    addQuestionToExamBtn: document.getElementById('addQuestionToExamBtn'),
};

// 3. HÀM KHỞI TẠO: Gắn kết tất cả lại với nhau
function initialize() {
    if (!elements.dataTableTbody) {
        console.error("CRITICAL: Table body not found! Application cannot start.");
        return;
    }

    // --- GÁN CÁC EVENT LISTENER TẬP TRUNG ---

    // Các sự kiện đơn giản
    elements.searchBtn.addEventListener('click', handleSearch);
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    elements.entityForm.addEventListener('submit', handleFormSubmit);
    elements.addNewBtn.addEventListener('click', handleAddNewClick);
    elements.backBtn.addEventListener('click', handleBackClick);
    elements.closeFormModal.addEventListener('click', () => handleCloseModal('formModal'));
    elements.closeDetailModal.addEventListener('click', () => handleCloseModal('detailModal'));

    // Sử dụng Event Delegation cho các phần tử được tạo động hoặc có nhiều nút con
    
    // Pagination
    elements.paginationContainer.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-action="change-page"]');
        if (button && !button.disabled) {
            const pageNumber = parseInt(button.dataset.pageNumber, 10);
            handleChangePage(pageNumber);
        }
    });

    // Content Tabs (Bài học / Bài kiểm tra)
    elements.contentTabs.addEventListener('click', (event) => {
        const button = event.target.closest('.tab-button');
        if (button && !button.classList.contains('active')) {
            handleSwitchContentType(button.dataset.contentType);
        }
    });

    // Breadcrumbs
    elements.breadcrumbsContainer.addEventListener('click', (event) => {
        const item = event.target.closest('.breadcrumb-item[data-action="navigate"]');
        if (item) {
            const { level, id, name } = item.dataset;
            navigateToLevel(level, id ? parseInt(id, 10) : null, name);
        }
    });

    // Table Body (xử lý click cho cả hàng và các nút hành động bên trong)
    elements.dataTableTbody.addEventListener('click', (event) => {
        const target = event.target;
        const actionBtn = target.closest('.action-btn');
        const clickableRow = target.closest('tr.clickable-row');

        if (actionBtn) { // Ưu tiên xử lý click vào nút
            event.stopPropagation();
            const { action, entityType, id, parentId } = actionBtn.dataset;
            const entityId = parseInt(id, 10);
            const parentIdInt = parentId ? parseInt(parentId, 10) : null;
            
            if (action === 'open-modal') {
                handleOpenFormModal('edit', entityType, entityId, parentIdInt);
            } else if (action === 'delete') {
                handleDelete(entityType, entityId);
            } else if (action === 'view') {
                handleViewDetail(entityType, entityId);
            }
        } else if (clickableRow) { // Nếu không phải click vào nút thì xử lý click vào hàng
            const { id, name } = clickableRow.dataset;
            handleRowClick(parseInt(id, 10), name);
        }
    });
    
    // Đóng modal khi click ra ngoài
    window.addEventListener('click', (event) => handleWindowClick(event));

    // --- KHỞI CHẠY ỨNG DỤNG ---
    console.log("Application initialized successfully.");
    navigateToLevel('topics');
}

// 4. ĐIỂM BẮT ĐẦU: Chạy hàm initialize khi trang đã tải xong
document.addEventListener('DOMContentLoaded', initialize);