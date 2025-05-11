document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const searchInput = document.querySelector('.search-box input');
    const filterBtn = document.querySelector('.filter-btn');
    const filterTags = document.querySelectorAll('.filter-tag');
    const startButtons = document.querySelectorAll('.start-btn');
    const examCards = document.querySelectorAll('.exam-card');
    const homeBtn = document.querySelector('.home-btn');
    const historyBtn = document.querySelector('.history-btn');
    const progressBtn = document.querySelector('.progress-btn');

    // Filter Modal Elements (to be created dynamically)
    let filterModal;

    // Search Functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterExams(searchTerm);
    });

    // Filter Functionality
    filterBtn.addEventListener('click', () => {
        showFilterModal();
    });

    // Remove Filter Tags
    filterTags.forEach(tag => {
        tag.querySelector('i').addEventListener('click', () => {
            tag.remove();
            updateFilters();
        });
    });

    // Start Exam Buttons
    startButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.exam-card');
            const topic = card.querySelector('h3').textContent;
            const level = card.querySelector('.level-badge').textContent;
            startExam(topic, level);
        });
    });

    // Navigation Buttons
    homeBtn.addEventListener('click', () => {
        window.location.href = '/Pages/User/home.html';
    });

    historyBtn.addEventListener('click', () => {
        window.location.href = '/Pages/User/history.html';
    });

    progressBtn.addEventListener('click', () => {
        window.location.href = '/Pages/User/progress.html';
    });

    // Filter Exams Function
    function filterExams(searchTerm) {
        examCards.forEach(card => {
            const title = card.querySelector('h4').textContent.toLowerCase();
            const topic = card.querySelector('h3').textContent.toLowerCase();
            const level = card.querySelector('.level-badge').textContent.toLowerCase();
            const skill = card.querySelector('.skill-tag').textContent.toLowerCase();

            const matchesSearch = title.includes(searchTerm) || 
                                topic.includes(searchTerm) || 
                                level.includes(searchTerm) || 
                                skill.includes(searchTerm);

            const matchesFilters = checkFilters(card);

            card.style.display = matchesSearch && matchesFilters ? 'block' : 'none';
        });
    }

    // Check Filters Function
    function checkFilters(card) {
        const activeFilters = Array.from(document.querySelectorAll('.filter-tag'))
            .map(tag => tag.textContent.trim().toLowerCase());

        if (activeFilters.length === 0) return true;

        const cardLevel = card.querySelector('.level-badge').textContent.toLowerCase();
        const cardSkill = card.querySelector('.skill-tag').textContent.toLowerCase();

        return activeFilters.some(filter => 
            cardLevel.includes(filter) || cardSkill.includes(filter)
        );
    }

    // Show Filter Modal
    function showFilterModal() {
        // Create modal if it doesn't exist
        if (!filterModal) {
            filterModal = document.createElement('div');
            filterModal.className = 'filter-modal';
            filterModal.innerHTML = `
                <div class="modal-content">
                    <h3>Bộ lọc</h3>
                    <div class="filter-section">
                        <h4>Cấp độ</h4>
                        <div class="filter-options">
                            <label><input type="checkbox" value="A1"> A1</label>
                            <label><input type="checkbox" value="A2"> A2</label>
                            <label><input type="checkbox" value="B1"> B1</label>
                            <label><input type="checkbox" value="B2"> B2</label>
                        </div>
                    </div>
                    <div class="filter-section">
                        <h4>Kỹ năng</h4>
                        <div class="filter-options">
                            <label><input type="checkbox" value="Từ vựng"> Từ vựng</label>
                            <label><input type="checkbox" value="Ngữ pháp"> Ngữ pháp</label>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="apply-btn">Áp dụng</button>
                        <button class="cancel-btn">Hủy</button>
                    </div>
                </div>
            `;

            // Add modal styles
            const style = document.createElement('style');
            style.textContent = `
                .filter-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }

                .modal-content {
                    background-color: white;
                    padding: 2rem;
                    border-radius: var(--border-radius);
                    width: 90%;
                    max-width: 500px;
                }

                .filter-section {
                    margin-bottom: 1.5rem;
                }

                .filter-options {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                    gap: 1rem;
                    margin-top: 0.5rem;
                }

                .filter-options label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }

                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    margin-top: 1.5rem;
                }

                .apply-btn, .cancel-btn {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: var(--border-radius);
                    cursor: pointer;
                }

                .apply-btn {
                    background-color: var(--primary-color);
                    color: white;
                }

                .cancel-btn {
                    background-color: #eee;
                }
            `;
            document.head.appendChild(style);
            document.body.appendChild(filterModal);

            // Add event listeners
            const applyBtn = filterModal.querySelector('.apply-btn');
            const cancelBtn = filterModal.querySelector('.cancel-btn');
            const checkboxes = filterModal.querySelectorAll('input[type="checkbox"]');

            applyBtn.addEventListener('click', () => {
                const selectedFilters = Array.from(checkboxes)
                    .filter(cb => cb.checked)
                    .map(cb => cb.value);

                updateFilterTags(selectedFilters);
                filterModal.style.display = 'none';
            });

            cancelBtn.addEventListener('click', () => {
                filterModal.style.display = 'none';
            });
        }

        filterModal.style.display = 'flex';
    }

    // Update Filter Tags
    function updateFilterTags(filters) {
        const activeFilters = document.querySelector('.active-filters');
        activeFilters.innerHTML = '';

        filters.forEach(filter => {
            const tag = document.createElement('span');
            tag.className = 'filter-tag';
            tag.innerHTML = `${filter} <i class="fas fa-times"></i>`;
            tag.querySelector('i').addEventListener('click', () => {
                tag.remove();
                updateFilters();
            });
            activeFilters.appendChild(tag);
        });

        updateFilters();
    }

    // Update Filters
    function updateFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        filterExams(searchTerm);
    }

    // Start Exam Function
    function startExam(topic, level) {
        // Store exam info in localStorage
        localStorage.setItem('currentExam', JSON.stringify({
            topic,
            level,
            startTime: new Date().toISOString()
        }));

        // Redirect to exam page
        window.location.href = '/Pages/User/exam.html';
    }
}); 