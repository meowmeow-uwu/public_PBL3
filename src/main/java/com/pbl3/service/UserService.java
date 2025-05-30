/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.service;

import java.util.ArrayList;
import com.pbl3.dao.UserDAO;
import com.pbl3.dto.User;
import com.pbl3.util.JwtUtil;
import com.pbl3.util.MailUtil;
import com.pbl3.util.PasswordUtil;
import java.util.Map;
import java.util.HashMap;

/**
 *
 * @author Danh
 */
public class UserService implements ServiceInterface<User> {

    private final UserDAO userDAO = UserDAO.getInstance();

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

    public int updatePassword(User user) {
        user.setPassword(PasswordUtil.hashPassword(user.getPassword()));
        return userDAO.update(user);
    }

    public boolean checkPassword(String oldPassword, User user) {
        return PasswordUtil.checkPassword(oldPassword, user.getPassword());
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

    public Map<String, Object> getUserByPage(int pageNumber, int pageSize, int groupUserId, String keyword) {
        return userDAO.getUserByPage(pageNumber, pageSize, groupUserId, keyword);
    }

    public String authenticate(String username, String password) {
        User user = userDAO.selectByUsername(username);

        if (user == null
                || !PasswordUtil.checkPassword(password, user.getPassword())) {
            throw new SecurityException("Thông tin đăng nhập không hợp lệ");
        }

        return JwtUtil.generateToken(user.getUser_id());
    }

    public User getUserByEmail(String email) {
        return userDAO.selectByEmail(email);
    }

    public String generateResetPasswordToken(User user) {
        // Tạo token JWT với thời hạn 15 phút
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUser_id());
        claims.put("email", user.getEmail());
        return JwtUtil.generateToken(claims); // 15 phút
    }

    public void sendResetPasswordEmail(String email, String resetLink) {
       
        String content = "Link đặt lại mật khẩu của bạn là : " + resetLink;
        MailUtil.getInstance().sendMail(email, "Đặt lại mật khẩu", content);
           
    }
    public boolean verifyResetToken(String token){
        Map<String,Object> claim =  JwtUtil.getClaimFromToken(token) ;
        return userDAO.selectByID((int)claim.get("userId")) != null ;
    }
    public boolean resetPassword(String token, String newPassword) {
        try {
            // Xác thực token
            Map<String, Object> claims = JwtUtil.getClaimFromToken(token);
            if (claims == null) {
                return false;
            } // Lấy thông tin user từ token
            int userId = (int) claims.get("userId");
            User user = userDAO.selectByID(userId);
            if (user == null) {
                return false;
            }

            // Cập nhật mật khẩu mới
            user.setPassword(PasswordUtil.hashPassword(newPassword));
            return userDAO.update(user) > 0;
        } catch (Exception e) {
            return false;
        }
    }
    
    public int getNumberUser(int groupUserId)
    {
        return userDAO.getNumberUser(groupUserId);
    }
}
