// Form validation and submission handling
document.addEventListener('DOMContentLoaded', () => {
    setupFormValidation();
    setupUsernameField();
    setupPasswordVisibilityToggle(); // Đảm bảo hàm này được gọi
});

function setupFormValidation() {
    const form = document.getElementById('addUserForm');
    form.addEventListener('submit', handleFormSubmit);
}

function setupUsernameField() {
    const usernameField = document.getElementById('username');

    usernameField.addEventListener('input', function() {
        // Chuyển thành chữ thường và loại bỏ khoảng trắng như trước
        this.value = this.value.toLowerCase().replace(/\s+/g, '');

        // Loại bỏ các ký tự có dấu tiếng Việt
        this.value = this.value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // (Tùy chọn) Nếu bạn muốn loại bỏ cả chữ "đ", bạn có thể thêm vào regex
        this.value = this.value.replace(/đ/g, 'd');
    });
}
// Function to toggle password visibility using text
function setupPasswordVisibilityToggle() {
    // Lấy đúng ID của SPAN từ HTML
    const togglePasswordText = document.getElementById('togglePasswordText');
    // Lấy đúng ID của INPUT mật khẩu từ HTML
    const passwordField = document.getElementById('password');
    const repasswordField = document.getElementById('repassword');

    if (togglePasswordText && passwordField && repasswordField) {
        togglePasswordText.addEventListener('click', function () {
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            const type1 = repasswordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            repasswordField.setAttribute('type', type1);
            this.textContent = type === 'password' ? 'Hiện mật khẩu' : 'Ẩn mật khẩu';
        });
    } else {
        // Nếu một trong hai phần tử không tìm thấy, thông báo lỗi trong console
        if (!togglePasswordText) {
            console.error("Lỗi: Không tìm thấy phần tử với ID 'togglePasswordText'. Hãy kiểm tra lại HTML.");
        }
        if (!passwordField) {
            console.error("Lỗi: Không tìm thấy phần tử với ID 'password'. Hãy kiểm tra lại HTML.");
        }
        if (!repasswordField) {
            console.error("Lỗi: Không tìm thấy phần tử với ID 'repassword'. Hãy kiểm tra lại HTML.");
        }
    }
}
function resetForm() {
    const form = document.getElementById('addUserForm');
    form.reset();

    const passwordField = document.getElementById('password');
    if (passwordField) {
        passwordField.setAttribute('type', 'password');
    }
    const togglePasswordText = document.getElementById('togglePasswordText');
    if (togglePasswordText) {
        togglePasswordText.textContent = 'Hiện mật khẩu';
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    let avatar = document.getElementById('avatar').value.trim(); // Lấy giá trị avatar
    const password = document.getElementById('password').value;
    const repassword = document.getElementById('repassword').value;
    const role_id = document.getElementById('role_id').value;

    // Validate Username
    if (!/^[a-z0-9_]+$/.test(username)) {
        showToast('warning', 'Cảnh báo', 'Username chỉ được chứa chữ thường, số và dấu gạch dưới (không chứa dấu chấm)!');
        return;
    }
    if (username.includes('..')) {
        showToast('warning', 'Cảnh báo', 'Username không được chứa hai dấu chấm liền kề (..)');
        return;
    }
    if (username.length < 3 || username.length > 30) {
        showToast('warning', 'Cảnh báo', 'Username phải có độ dài từ 3 đến 30 ký tự!');
        return;
    }

    // Password validation (only if password is not empty)
    if (password) {
        if (password.length < 6) {
            showToast('warning', 'Cảnh báo', 'Mật khẩu phải có ít nhất 6 ký tự!');
            return;
        }
        if (password !== repassword) {
            showToast('warning', 'Cảnh báo', 'Mật khẩu nhập lại không khớp!');
            return;
        }
    } else if (repassword) {
        showToast('warning', 'Cảnh báo', 'Vui lòng nhập mật khẩu.');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('warning', 'Cảnh báo', 'Email không hợp lệ!');
        return;
    }

    // Kiểm tra và gán avatar mặc định nếu không có giá trị
    if (!avatar) {
        avatar = 'https://i.pinimg.com/736x/7b/c6/fd/7bc6fd1adc9df8f49353a40d716a0a7d.jpg';
    } else {
        try { new URL(avatar); } catch { showToast('warning', 'Cảnh báo', 'URL avatar không hợp lệ!'); return; }
    }

    if (name.length < 2) {
        showToast('warning', 'Cảnh báo', 'Họ tên phải có ít nhất 2 ký tự!');
        return;
    }

    const userData = { username, email, name, role_id, avatar };
    if (password) {
        userData.password = password;
    }

    try {
         const res = await window.USER_MANAGEMENT_API.createUser(userData);
        console.log("Dữ liệu gửi đi:", userData); // Test
        showToast('success', 'Thành công!',  'Thêm người dùng thành công!');
        resetForm();
    } catch (error) {
        showToast('error', 'Lỗi',error.message || 'Có lỗi xảy ra khi thêm người dùng!');
    }
}

window.resetForm = resetForm;