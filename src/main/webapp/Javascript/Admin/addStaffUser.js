// Form validation and submission handling
document.addEventListener('DOMContentLoaded', () => {
    setupFormValidation();
    setupDateField();
    setupUsernameField();
});

function setupFormValidation() {
    const form = document.getElementById('addUserForm');
    form.addEventListener('submit', handleFormSubmit);
}

function setupDateField() {
    // Set default date to today (nếu muốn hiển thị, không gửi lên backend)
    const dateField = document.getElementById('created');
    if (dateField) {
        dateField.value = new Date().toISOString().slice(0, 10);
        dateField.readOnly = true;
    }
}

function setupUsernameField() {
    const usernameField = document.getElementById('username');
    usernameField.addEventListener('input', function() {
        this.value = this.value.toLowerCase().replace(/\s+/g, '');
    });
}

function resetForm() {
    const form = document.getElementById('addUserForm');
    form.reset();
    setupDateField();
}

async function handleFormSubmit(e) {
    e.preventDefault();

    // Lấy giá trị form
    const username = document.getElementById('username').value.trim();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const avatar = document.getElementById('avatar').value.trim();
    const password = document.getElementById('password').value;
    const repassword = document.getElementById('repassword').value;
    const role_id = document.getElementById('role_id').value;

    // Validate
    if (!/^[a-z0-9_]+$/.test(username)) {
        alert('Username chỉ được chứa chữ thường, số và dấu gạch dưới!');
        return;
    }
    if (username.length < 3 || username.length > 30) {
        alert('Username phải có độ dài từ 3 đến 30 ký tự!');
        return;
    }
    if (password !== repassword) {
        alert('Mật khẩu nhập lại không khớp!');
        return;
    }
    if (password.length < 6) {
        alert('Mật khẩu phải có ít nhất 6 ký tự!');
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Email không hợp lệ!');
        return;
    }
    try { new URL(avatar); } catch { alert('URL avatar không hợp lệ!'); return; }
    if (name.length < 2) {
        alert('Họ tên phải có ít nhất 2 ký tự!');
        return;
    }

    // Gọi API
    try {
        const res = await window.addStaffUserAPI.createUser({
            username, password, email, name, role_id, avatar
        });
        alert('Thêm người dùng thành công!');
        resetForm();
    } catch (error) {
        alert(error.message || 'Có lỗi xảy ra khi thêm người dùng!');
    }
}

// Export resetForm cho HTML
window.resetForm = resetForm;
