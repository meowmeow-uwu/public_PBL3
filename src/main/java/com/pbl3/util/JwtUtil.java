/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.util.Date;

/**
 *
 * @author Hoang Duong
 */
public class JwtUtil {

    private static final String SECRET_KEY = "mySuperSecretKey!123"; // Một chuỗi đủ mạnh và an toàn
    private static final long EXPIRATION_TIME = 86400000; // 1 ngày

    public static String generateToken(int userId) {
        return Jwts.builder()
                .claim("user_id", userId)
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SignatureAlgorithm.HS512, SECRET_KEY)
                .compact();
    }

    public static Integer getUserIdFromToken(String token) {
        try {
            return Jwts.parser()
                    .setSigningKey(SECRET_KEY)
                    .parseClaimsJws(token)
                    .getBody()
                    .get("user_id", Integer.class);
        } catch (Exception e) {
            return null;
        }
    }

    public static boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .setSigningKey(SECRET_KEY)
                    .parseClaimsJws(token); // Nếu không có exception, token hợp lệ
            return true;
        } catch (Exception e) {
            return false; // Token không hợp lệ hoặc đã hết hạn
        }
    }
}
