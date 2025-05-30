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

        // Xử lý checkbox trong Today's Goals
        // document.querySelectorAll('.goal-checkbox').forEach(checkbox => {
        //     checkbox.addEventListener('click', function() {
        //         this.classList.toggle('checked');
        //         // TODO: Gọi API để cập nhật trạng thái mục tiêu
        //     });
        // });

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

        // Cập nhật thời gian hoạt động
        function updateActivityTimes() {
            document.querySelectorAll('.activity-time').forEach(timeElement => {
                const timeText = timeElement.textContent;
                if (timeText.includes('giờ trước')) {
                    const hours = parseInt(timeText);
                    if (hours >= 24) {
                        timeElement.textContent = 'Hôm qua';
                    }
                }
            });
        }

        // Cập nhật thời gian mỗi phút
        setInterval(updateActivityTimes, 60000);
        updateActivityTimes();

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
    loadDashboardData();
});
async function loadDashboardData() {
    try {
        // Lấy thông tin người dùng hiện tại
        const userInfo = await window.fetchUserInfo();
        if (!userInfo) {
            throw new Error('Không thể lấy thông tin người dùng');
        }
        // Lấy tất cả thống kê
        const stats = await homeAPI.getAllStatistics();
        
        // Cập nhật các số liệu
        document.getElementById('total-courses').textContent = stats.totalPosts;
        document.getElementById('total-vocabularyV').textContent = stats.totalWordsVi;
        document.getElementById('total-vocabularyE').textContent = stats.totalWordsEn;
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        alert('Có lỗi xảy ra khi tải dữ liệu: ' + error.message);
    }
}