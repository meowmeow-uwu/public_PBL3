// js/Staff/grammarManagement/utils.js

export function getEntityTypeDisplayName(type) {
    const names = {
        topic: 'Chủ đề',
        subtopic: 'Chủ đề con',
        post: 'Bài học',
        exam: 'Bài kiểm tra',
        question: 'Câu hỏi',
        answer: 'Câu trả lời'
    };
    return names[type] || type;
}

// Hàm này giúp tránh lỗi XSS bằng cách chuyển ký tự HTML đặc biệt thành an toàn
export function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}