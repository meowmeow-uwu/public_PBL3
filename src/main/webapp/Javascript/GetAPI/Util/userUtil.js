/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/JavaScript.js to edit this template
 */


function getBearerToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
}

window.USER_UTIL = {
    getBearerToken
};