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
public class UserService implements ServiceInterface<User>{
  
    private final UserDAO userDAO = new UserDAO();
  
    @Override
    public int insert(User t) {
        
        return userDAO.insert(t);
    }

    @Override
    public int update(User user) {
        UserDAO dao = new UserDAO();
        int result = dao.update(user);
        if (result > 0) {
            System.out.println("User updated successfully.");
        } else {
            System.out.println("Failed to update user.");
        }
        return result;
    }
    

    @Override
    public int delete(int uid) {
        UserDAO dao = new UserDAO();
        int result = dao.delete(uid);
        if (result > 0) {
            System.out.println("User deleted successfully.");
        } else {
            System.out.println("Failed to delete user.");
        }
        return result;
    }
    

    @Override
    public ArrayList<User> selectAll() {
        UserDAO dao = new UserDAO();
        ArrayList<User> users = dao.selectAll();
        
        return users;
    }
    public ArrayList<User> selectAllByGroupUserId(int groupUserId) {
        UserDAO dao = new UserDAO();
        ArrayList<User> users = dao.selectAll();
        
        return users;
    }

    @Override
    public User selectByID(int id) {
        UserDAO dao = new UserDAO();
        User u = dao.selectByID(id);
        if(u != null){
            return u;
        }
        return null;
    }

    @Override
    public User selectByCondition(String condition) {
        return null;
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
        User user = this.selectByID(id);
        return user != null && user.getGroup_user_id() == 1; // Giả sử role_id = 1 là admin
    }
}
