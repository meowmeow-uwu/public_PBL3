/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.util.Date;
 import java.util.Map;

/**
 *
 * @author Hoang Duong
 */
public class JwtUtil {

    
    public static void main(String[] args) {
        String token = "eyJhbGciOiJIUzUxMiJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3NDczNTUzMzV9.m7UQYKoekcai-4IbkmbuKBmnwc-OrSg-grxPouc0R-OAmTiS1PHm6E-sJFZibZW_A25IcqqWVDupzGH5fRT4Ew";
        System.out.println(token);
        System.out.println(JwtUtil.validateToken(token));
        System.out.println(JwtUtil.getUserIdFromToken(token));
    }

    private static final String SECRET_KEY = "mySuperSecretKey!123"; // Một chuỗi đủ mạnh và an toàn
    private static final long EXPIRATION_TIME = 86400000; // 1 ngày

    public static String generateToken(int userId) {
        return Jwts.builder()
                .claim("user_id", userId)
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SignatureAlgorithm.HS512, SECRET_KEY)
                .compact();
    }

    public static String generateToken(Map<String, Object> claim ){
        return Jwts.builder()
                .claim("claim", claim)
                .setExpiration(new Date(System.currentTimeMillis() + 15*60*1000))
                .signWith(SignatureAlgorithm.HS512, SECRET_KEY)
                .compact();
    }
    public static Map<String, Object> getClaimFromToken(String token)
    {
        try{
            Claims claim =  Jwts.parser()
                    .setSigningKey(SECRET_KEY)
                    .parseClaimsJws(token)
                    .getBody();
            
             return (Map<String , Object>) claim.get("claim");
        } catch(Exception e)
        {
            return null;
        }
    }
    public static int getUserIdFromToken(String token) {
        try {
            return Jwts.parser()
                    .setSigningKey(SECRET_KEY)
                    .parseClaimsJws(token)
                    .getBody()
                    .get("user_id", Integer.class);
        } catch (Exception e) {
            return -1;
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
