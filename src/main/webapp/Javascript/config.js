// window.APP_CONFIG = {
//     BASE_PATH: './',  // Sẽ được ghi đè bởi mỗi trang
//     API_BASE_URL: 'https://english.up.railway.app/api'
// //https://english.up.railway.app/api/
// };
//const API = window.APP_CONFIG.API_BASE_URL
// const API_LgRgt_URL = window.APP_CONFIG.API_BASE_URL + '/auth/';
window.APP_CONFIG = {
    BASE_PATH: './',
    API_BASE_URL: window.location.hostname.includes('localhost')
        ? 'http://localhost:6969/api'
        : 'https://english.up.railway.app/api'
};
