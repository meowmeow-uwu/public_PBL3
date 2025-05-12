/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.service;

import java.util.ArrayList;
import com.pbl3.dao.UserDAO;
import com.pbl3.dto.User;
import com.pbl3.util.JwtUtil;
import com.pbl3.util.PasswordUtil;
import java.util.Map;

/**
 *
 * @author Danh
 */
public class UserService implements ServiceInterface<User> {

    private final UserDAO userDAO = new UserDAO();

    @Override
    public int insert(User t) {
        if (userDAO.selectByUsername(t.getUsername()) != null) {
            throw new IllegalArgumentException("Username đã tồn tại");
        }
        if (userDAO.selectByEmail(t.getEmail()) != null) {
            throw new IllegalArgumentException("Email đã tồn tại");
        }
        t.setPassword(PasswordUtil.hashPassword(t.getPassword()));
        return userDAO.insert(t);
    }

    @Override
    public int update(User user) {
        User existingEmail = userDAO.selectByEmail(user.getEmail());

        if (existingEmail != null && existingEmail.getUser_id() != user.getUser_id()) {
            throw new IllegalArgumentException("Username đã tồn tại");
        }
        User existingUser = userDAO.selectByEmail(user.getEmail());

        if (existingUser != null && existingUser.getUser_id() != user.getUser_id()) {
            throw new IllegalArgumentException("Email đã tồn tại");
        }
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
        if (u != null) {
            return u;
        }
        return null;
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

    public Map<String, Object> getUsersByPage(int pageNumber, int pageSize, int groupUserId, String keyword) {
        return userDAO.getUsersByPage(pageNumber, pageSize, groupUserId, keyword);
    }

    public String authenticate(String username, String password) {
        User user = userDAO.selectByUsername(username);

        if (user == null
                || !PasswordUtil.checkPassword(password, user.getPassword())) {
            throw new SecurityException("Thông tin đăng nhập không hợp lệ");
        }

        return JwtUtil.generateToken(user.getUser_id());
    }
}
