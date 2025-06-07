
const ROLES = {
    ADMIN: 1,
    USER: 2,
    STAFF: 3
};
window.APP_CONFIG = {
    
    ROLES,
    BASE_PATH: './', // Sẽ được ghi đè bởi mỗi trang
    API_BASE_URL: 'https://pbl3-gnbb.onrender.com/api' // cái này mới deploy, mỗi lần commit mất 3p, dùng được
            // API_BASE_URL: 'https://english.up.railway.app/api'
//


};
//const API = window.APP_CONFIG.API_BASE_URL
// const API_LgRgt_URL = window.APP_CONFIG.API_BASE_URL + '/auth/';

(function() {
    // Only run this code in a browser environment
    if (typeof document === 'undefined' || typeof window === 'undefined') {
        return;
    }

    // Check if a favicon link already exists to avoid duplicates
    if (document.querySelector("link[rel='icon']") || document.querySelector("link[rel='shortcut icon']")) {
        return;
    }

    var link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/x-icon';

    var iconFileName = 'favicon.ico'; // Tên file icon của bạn
    var cacheBuster = new Date().getTime(); // Giúp "phá" cache trình duyệt

    var currentScript = document.currentScript;
    if (currentScript && currentScript.src) {
        var scriptSrc = currentScript.src;
        var scriptDir = scriptSrc.substring(0, scriptSrc.lastIndexOf('/') + 1);
        link.href = scriptDir + iconFileName + '?v=' + cacheBuster; // Thêm ?v=timestamp
    } else {
        // Fallback logic
        console.warn('document.currentScript.src is not available. Using fallback path for icon.');
        var pathPrefix = "/PBL3/"; // Hoặc context path của bạn
        link.href = pathPrefix + 'Javascript/' + iconFileName + '?v=' + cacheBuster; // Thêm ?v=timestamp
    }

    // Kiểm tra lại xem đã có thẻ link icon nào chưa trước khi thêm
    if (!document.querySelector("link[rel='icon'][href^='" + (scriptDir || (pathPrefix + 'Javascript/')) + iconFileName + "']")) {
         document.getElementsByTagName('head')[0].appendChild(link);
    }
    
})();