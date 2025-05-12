/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.service;

import com.pbl3.dto.User;
import com.pbl3.util.JwtUtil;

/**
 *
 * @author Hoang Duong
 */
public class AuthService {

    UserService userService = new UserService();

    public boolean isContentManager(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return false;
        }
        String token = authHeader.substring("Bearer ".length()).trim();
        int id = JwtUtil.getUserIdFromToken(token);
        if (id == -1) {
            return false;
        }
        User user = userService.selectByID(id);
        return user != null && user.getGroup_user_id() == 3;
    }

    public boolean isAdmin(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return false;
        }
        String token = authHeader.substring("Bearer ".length()).trim();
        int id = JwtUtil.getUserIdFromToken(token);
        if (id == -1) {
            return false;
        }
        User user = userService.selectByID(id);
        return user != null && user.getGroup_user_id() == 1;
    }

    
}
