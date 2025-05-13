let currentPage = 1;
let totalPages = 1;
let currentAnswerId = null;

document.addEventListener('DOMContentLoaded', function() {
    loadAnswers();
    setupEventListeners();
});

function setupEventListeners() {
    // Search
    document.getElementById('searchInput').addEventListener('input', debounce(loadAnswers, 300));
    
    // Filters
    document.getElementById('topicFilter').addEventListener('change', loadAnswers);
    document.getElementById('typeFilter').addEventListener('change', loadAnswers);
    
    // Pagination
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadAnswers();
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadAnswers();
        }
    });
    
    // Form submit
    document.getElementById('answerForm').addEventListener('submit', handleFormSubmit);
}

async function loadAnswers() {
    try {
        const searchQuery = document.getElementById('searchInput').value;
        const topic = document.getElementById('topicFilter').value;
        const type = document.getElementById('typeFilter').value;
        
        const answers = await getAnswers({
            page: currentPage,
            search: searchQuery,
            topic: topic,
            type: type
        });
        
        displayAnswers(answers.data);
        updatePagination(answers.total);
    } catch (error) {
        console.error('Lỗi khi tải danh sách câu hỏi:', error);
        alert('Có lỗi xảy ra khi tải danh sách câu hỏi');
    }
}

function displayAnswers(answers) {
    const tbody = document.getElementById('answersTableBody');
    tbody.innerHTML = '';
    
    answers.forEach(answer => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${answer.id}</td>
            <td>${answer.question}</td>
            <td>${answer.topic}</td>
            <td>${answer.type === 1 ? 'Câu hỏi thường' : 'Câu hỏi đọc hiểu'}</td>
            <td>${String.fromCharCode(65 + answer.correctAnswer)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-edit" onclick="editAnswer(${answer.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="openDeleteModal(${answer.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updatePagination(total) {
    totalPages = Math.ceil(total / 10); // Assuming 10 items per page
    document.getElementById('pageInfo').textContent = `Trang ${currentPage} / ${totalPages}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

function openAddAnswerModal() {
    currentAnswerId = null;
    document.getElementById('modalTitle').textContent = 'Thêm câu hỏi mới';
    document.getElementById('answerForm').reset();
    document.getElementById('answerModal').style.display = 'block';
}

function openEditModal(answer) {
    currentAnswerId = answer.id;
    document.getElementById('modalTitle').textContent = 'Sửa câu hỏi';
    
    // Fill form with answer data
    document.getElementById('questionText').value = answer.question;
    document.getElementById('topic').value = answer.topic;
    document.getElementById('type').value = answer.type;
    document.getElementById('explanation').value = answer.explanation;
    
    // Fill options
    const options = document.querySelectorAll('.option-item input[type="text"]');
    answer.options.forEach((option, index) => {
        options[index].value = option;
    });
    
    // Set correct answer
    document.querySelector(`input[name="correctAnswer"][value="${answer.correctAnswer}"]`).checked = true;
    
    document.getElementById('answerModal').style.display = 'block';
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        question: document.getElementById('questionText').value,
        topic: document.getElementById('topic').value,
        type: document.getElementById('type').value,
        options: Array.from(document.querySelectorAll('.option-item input[type="text"]')).map(input => input.value),
        correctAnswer: parseInt(document.querySelector('input[name="correctAnswer"]:checked').value),
        explanation: document.getElementById('explanation').value
    };
    
    try {
        if (currentAnswerId) {
            await updateAnswer(currentAnswerId, formData);
        } else {
            await createAnswer(formData);
        }
        
        closeAnswerModal();
        loadAnswers();
        alert(currentAnswerId ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
    } catch (error) {
        console.error('Lỗi khi lưu câu hỏi:', error);
        alert('Có lỗi xảy ra khi lưu câu hỏi');
    }
}

function closeAnswerModal() {
    document.getElementById('answerModal').style.display = 'none';
    document.getElementById('answerForm').reset();
}

function openDeleteModal(id) {
    currentAnswerId = id;
    document.getElementById('deleteModal').style.display = 'block';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    currentAnswerId = null;
}

async function confirmDelete() {
    try {
        await deleteAnswer(currentAnswerId);
        closeDeleteModal();
        loadAnswers();
        alert('Xóa thành công!');
    } catch (error) {
        console.error('Lỗi khi xóa câu hỏi:', error);
        alert('Có lỗi xảy ra khi xóa câu hỏi');
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
