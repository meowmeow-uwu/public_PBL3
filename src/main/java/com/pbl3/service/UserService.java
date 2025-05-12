/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.service;

import java.util.ArrayList;
import com.pbl3.dao.UserDAO;
import com.pbl3.dto.User;
import com.pbl3.util.JwtUtil;

/**
 *
 * @author Danh
 */

public class UserService implements ServiceInterface<User> {

    private final UserDAO userDAO = UserDAO.getInstance();

    @Override
    public int insert(User t) {

        return userDAO.insert(t);
    }

    @Override
    public int update(User user) {
        int result = userDAO.update(user);
        return result;
    }

    @Override
    public int delete(int uid) {
        int result = userDAO.delete(uid);
        return result;
    }

    @Override
    public ArrayList<User> selectAll() {
        ArrayList<User> users = userDAO.selectAll();
        return users;
    }

    public ArrayList<User> selectAllByGroupUserId(int groupUserId) {
        ArrayList<User> users = userDAO.selectAll();
        return users;
    }

    @Override
    public User selectByID(int id) {
        User u = userDAO.selectByID(id);
        return u;
    }

    @Override
    public User selectByCondition(String condition) {
        return null;
    }

    public User getUserByAuthHeader(String authHeader) {
        String token = authHeader.substring("Bearer ".length()).trim();
        int id = JwtUtil.getUserIdFromToken(token);
        if (id == -1) {
            throw new RuntimeException("Token không hợp lệ hoặc đã hết hạn.");
        }
        return userDAO.selectByID(id);
    }

    public int getUserIdByAuthHeader(String authHeader) {
        String token = authHeader.substring("Bearer ".length()).trim();
        return JwtUtil.getUserIdFromToken(token);
    }
}
