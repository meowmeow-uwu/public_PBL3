document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Lấy danh sách bộ sưu tập cá nhân
        const collections = await window.collectionsAPI.getUserCollections();
        console.log('Danh sách bộ sưu tập:', collections);

        // Tìm thẻ stat-card chứa "Bộ sưu tập"
        const collectionCard = Array.from(document.querySelectorAll('.stat-card')).find(card => 
            card.querySelector('h3').textContent === 'Bộ sưu tập'
        );

        if (collectionCard) {
            // Cập nhật số lượng bộ sưu tập
            const collectionStat = collectionCard.querySelector('.stat-value');
            if (collectionStat) {
                collectionStat.textContent = collections.length;
            }

            // Cập nhật label
            const collectionLabel = collectionCard.querySelector('.stat-label');
            if (collectionLabel) {
                const totalWords = collections.reduce((sum, collection) => sum + (collection.wordCount || 0), 0);
                collectionLabel.textContent = ` đã lưu`;
            }
        }
        const totalPost = await window.historyAPI.getTotalHistory(2);
        const totalWord = await window.historyAPI.getTotalHistory(1);
        const wordCard = Array.from(document.querySelectorAll('.stat-card')).find(card => 
                card.querySelector('h3').textContent === 'Từ vựng');
        const postCard = Array.from(document.querySelectorAll('.stat-card')).find(c => c.querySelector('h3').textContent === 'Ngữ pháp');
        if(wordCard) {
            const wordStat = wordCard.querySelector('.stat-value');
            if(wordStat) {
                wordStat.textContent = totalWord; 
            }
        }
        if(postCard) {
            const postStat = postCard.querySelector('.stat-value');
            if(postStat) {
                postStat.textContent = totalPost; 
            }
        }

        // Xử lý các nút Continue
        document.querySelectorAll('.continue-btn').forEach(button => {
            button.addEventListener('click', function() {
                const cardType = this.closest('.learning-card').querySelector('h3').textContent;
                switch(cardType) {
                    case 'Từ vựng':
                        window.location.href = 'vocabulary.html';
                        break;
                    case 'Ngữ pháp':
                        window.location.href = 'grammar.html';
                        break;
                }
            });
        });

        // Lấy lịch sử gần đây
        let historyWordRecently = [];
        let historyPostRecently = [];
        let examRecently = [];

        try {
            historyWordRecently = await window.historyAPI.getHistoryRecently(1);
            console.log('Lịch sử từ vựng gần đây:', historyWordRecently);
        } catch (error) {
            console.log('Không có lịch sử từ vựng:', error);
        }

        try {
            historyPostRecently = await window.historyAPI.getHistoryRecently(2);
            console.log('Lịch sử bài học gần đây:', historyPostRecently);
        } catch (error) {
            console.log('Không có lịch sử bài học:', error);
        }

        try {
            examRecently = await window.historyAPI.getExamRecently();
            console.log('Lịch sử bài kiểm tra gần đây:', examRecently);
        } catch (error) {
            console.log('Không có lịch sử bài kiểm tra:', error);
        }

        // Hiển thị lịch sử gần đây
        const activityList = document.querySelector('.activity-list');
        if (activityList) {
            activityList.innerHTML = '';
            let hasAnyActivity = false;

            // Hiển thị 1 từ đã tra gần đây
            if (historyWordRecently) {
                try {
                    const wordHistory = historyWordRecently;
                    const wordDetails = await window.historyAPI.getWordDetails(wordHistory.key_id);
                    if (wordDetails) {
                        hasAnyActivity = true;
                        const activityItem = document.createElement('div');
                        activityItem.className = 'activity-item';
                        activityItem.innerHTML = `
                            <div class="activity-icon">
                                <i class="fas fa-book"></i>
                            </div>
                            <div class="activity-content">
                                <div class="activity-text">Bạn đã tra từ "${wordDetails.word || 'N/A'}"</div>
                                <div class="activity-time">${new Date(wordHistory.history_date).toLocaleString('vi-VN')}</div>
                            </div>
                        `;
                        activityList.appendChild(activityItem);
                    }
                } catch (error) {
                    console.log('Không thể lấy chi tiết từ vựng:', error);
                }
            }

            // Hiển thị 1 bài học đã học gần đây
            if (historyPostRecently) {
                try {
                    const postHistory = historyPostRecently;
                    const postDetails = await window.historyAPI.getPostDetails(postHistory.key_id);
                    if (postDetails) {
                        hasAnyActivity = true;
                        const activityItem = document.createElement('div');
                        activityItem.className = 'activity-item';
                        activityItem.innerHTML = `
                            <div class="activity-icon">
                                <i class="fas fa-graduation-cap"></i>
                            </div>
                            <div class="activity-content">
                                <div class="activity-text">Bạn đã học bài "${postDetails.post_name || postDetails.name || 'N/A'}"</div>
                                <div class="activity-time">${new Date(postHistory.history_date).toLocaleString('vi-VN')}</div>
                            </div>
                        `;
                        activityList.appendChild(activityItem);
                    }
                } catch (error) {
                    console.log('Không thể lấy chi tiết bài học:', error);
                }
            }

            // Hiển thị 1 bài kiểm tra gần đây
            if (examRecently) {
                try {
                    const examHistory = examRecently;
                    const examName = await window.historyAPI.getExamName(examHistory.exam_id);
                    if (examName) {
                        hasAnyActivity = true;
                        const activityItem = document.createElement('div');
                        activityItem.className = 'activity-item';
                        activityItem.innerHTML = `
                            <div class="activity-icon">
                                <i class="fas fa-tasks"></i>
                            </div>
                            <div class="activity-content">
                                <div class="activity-text">Bạn đã hoàn thành bài kiểm tra "${examName.name || 'N/A'}" với ${examHistory.correct_number}/${examHistory.total_question} câu đúng</div>
                                <div class="activity-time">${new Date(examHistory.created_at).toLocaleString('vi-VN')}</div>
                            </div>
                        `;
                        activityList.appendChild(activityItem);
                    }
                } catch (error) {
                    console.log('Không thể lấy chi tiết bài kiểm tra:', error);
                }
            }

            // Nếu không có hoạt động nào
            if (!hasAnyActivity) {
                const noActivityItem = document.createElement('div');
                noActivityItem.className = 'activity-item';
                noActivityItem.innerHTML = `
                    <div class="activity-icon">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-text">Chưa có hoạt động nào gần đây</div>
                    </div>
                `;
                activityList.appendChild(noActivityItem);
            }
        }

    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        // Hiển thị thông báo lỗi cho người dùng
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #dc3545;"></i>
                <h3 style="margin: 10px 0;">Có lỗi xảy ra</h3>
                <p>Không thể tải dữ liệu. Vui lòng thử lại sau.</p>
            </div>
        `;
        document.querySelector('.home-container').prepend(errorMessage);
    }
});
