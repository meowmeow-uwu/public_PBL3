/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.util;

import org.apache.commons.mail.DefaultAuthenticator;
import org.apache.commons.mail.Email;
import org.apache.commons.mail.SimpleEmail;

/**
 *
 * @author Hoang Duong
 */
public class MailUtil {
    // Cấu hình email

    private final String HOST_NAME;

    private final int SSL_PORT = 465; // Port for SSL

    private final int TSL_PORT = 587; // Port for TLS/STARTTLS

    private final String APP_EMAIL = "vpsacc21@gmail.com"; // your email

    private final String APP_PASSWORD = "hwml qmwp kqaq jgct"; // your password

    private MailUtil() {
        HOST_NAME = "smtp.gmail.com";
    }
    private static MailUtil _mailUtil;

    public static MailUtil getInstance() {
        if (_mailUtil == null) {
            _mailUtil = new MailUtil();
        }
        return _mailUtil;
    }

    public void sendMail(String to, String subject, String message) {
    try {
        Email email = new SimpleEmail();
        email.setHostName(HOST_NAME); // Ví dụ: "smtp.gmail.com"
        email.setSmtpPort(SSL_PORT);  // Ví dụ: 465 hoặc 587
        email.setAuthenticator(new DefaultAuthenticator(APP_EMAIL, APP_PASSWORD));
        email.setSSLOnConnect(true);  // Kết nối SSL
        email.setFrom(APP_EMAIL);
        email.addTo(to);

        email.setSubject(subject);
        email.setMsg(message);

        email.send(); // Gửi email
    } catch (Exception e) {
        e.printStackTrace();
        // Bạn có thể xử lý lỗi ở đây hoặc ném ra ngoài
    }
}

}
