function showToast(type, title, message) {
    const toastContainer = document.createElement('div');
    toastContainer.classList.add('toast', type);
    var icon = "";
    switch(type){
        case "success":
            icon = "fas fa-check-circle icon";
            break;
        case "info":
            icon = "fas fa-info-circle icon";
            break;
        case "warning":
            icon = "fas fa-exclamation-circle icon";
            break;
        case "error":
            icon = "fas fa-times-circle icon";
            break;
    }

    if (icon === "") {
        console.error("Invalid toast type:", type);
        return;
    }

    toastContainer.innerHTML = `
        <div class="toast__icon">
            <i class="${icon}"></i>
        </div>
        <div class="toast__infor">
            <h3 class="toast__title">${title}</h3>
            <p class="toast__msg">${message}</p>
        </div>
        <div class="toast__close">
            <i class="fas fa-times close-btn"></i>
        </div>
    `;

    // Tìm container chứa các thông báo
    const toastContainerElement = document.querySelector('.toast-container');
    if (toastContainerElement) {
        // Thêm thông báo mới vào đầu container (để nó xuất hiện ở trên cùng)
        toastContainerElement.insertBefore(toastContainer, toastContainerElement.firstChild);
    } else {
        // Fallback nếu không tìm thấy container
        document.body.appendChild(toastContainer);
    }

    // Hiển thị thông báo với hiệu ứng
    setTimeout(() => {
        toastContainer.classList.add('show');
    }, 10);

    // Tự động xóa sau 5 giây
    const timeoutId = setTimeout(() => {
        toastContainer.classList.remove('show');
        // Đợi hiệu ứng transition kết thúc trước khi xóa khỏi DOM
        toastContainer.addEventListener('transitionend', () => {
            toastContainer.remove();
        }, { once: true });
    }, 5000);

    // Xử lý nút đóng
    toastContainer.querySelector('.close-btn').addEventListener('click', () => {
        clearTimeout(timeoutId);
        toastContainer.classList.remove('show');
        // Đợi hiệu ứng transition kết thúc trước khi xóa khỏi DOM
        toastContainer.addEventListener('transitionend', () => {
            toastContainer.remove();
        }, { once: true });
    });
}

// New function to show a custom modal alert by creating HTML dynamically
function showCustomAlert(title, message, okButtonText = 'OK', closeButtonText = 'Đóng') {
    // Create the modal HTML dynamically using innerHTML
    const modalHTML = `
        <div class="modal-alert-overlay show"> <!-- 'show' class added directly to display -->
            <div class="modal-alert">
                <div class="modal-alert__icon">
                    <!-- You can add dynamic icon here if needed, e.g., based on a type parameter -->
                    <i class="fas fa-info-circle icon"></i> <!-- Example icon -->
                </div>
                <div class="modal-alert__infor">
                    <h3 class="modal-alert__title">${title}</h3>
                    <p class="modal-alert__msg">${message}</p>
                </div>
                <div class="modal-alert__actions">
                    <button class="modal-alert__ok-btn">${okButtonText}</button>
                    <button class="modal-alert__close-btn">${closeButtonText}</button> <!-- Added Close button -->
                </div>
            </div>
        </div>
    `;

    // Create a temporary div to hold the generated HTML string
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = modalHTML;

    // Get the actual modal overlay element from the temporary div
    const modalOverlayElement = tempDiv.firstElementChild;

    // Append the modal to the body
    document.body.appendChild(modalOverlayElement);

    // Add event listeners to the buttons
    const okButton = modalOverlayElement.querySelector('.modal-alert__ok-btn');
    const closeButton = modalOverlayElement.querySelector('.modal-alert__close-btn');

    const closeModal = () => {
        modalOverlayElement.classList.remove('show');
        // Wait for transition to finish before removing from DOM
        modalOverlayElement.addEventListener('transitionend', () => {
            modalOverlayElement.remove();
        }, { once: true });
    };

    if (okButton) {
        okButton.addEventListener('click', closeModal);
    }

    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }

     // Also close if clicking outside the modal content
    modalOverlayElement.addEventListener('click', (event) => {
        if (event.target === modalOverlayElement) {
            closeModal();
        }
    });
} 