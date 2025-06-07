// Helper: convert JS object to x-www-form-urlencoded string
function toFormUrlEncoded(obj) {
    return Object.keys(obj)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
        .join('&');
}

window.HELPER_UTIL = {
    toFormUrlEncoded
};
