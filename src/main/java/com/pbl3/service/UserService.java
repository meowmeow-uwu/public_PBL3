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
  
    private final UserDAO userDAO = UserDAO.getInstance();
  
    @Override
    public int insert(User t) {
        
        return userDAO.insert(t);
    }

    @Override
    public int update(User user) {
        int result = userDAO.update(user);
        if (result > 0) {
            System.out.println("User updated successfully.");
        } else {
            System.out.println("Failed to update user.");
        }
        return result;
    }
    

    @Override
    public int delete(int uid) {
        int result = userDAO.delete(uid);
        if (result > 0) {
            System.out.println("User deleted successfully.");
        } else {
            System.out.println("Failed to delete user.");
        }
        return result;
    }
    

    @Override
    public ArrayList<User> selectAll() {
        ArrayList<User> users = userDAO.selectAll();
        
        return users;
    }
    public ArrayList<User> selectAllByGroupUserId(int groupUserId) {
        ArrayList<User> users = userDAO.selectAllByGroupUserId(groupUserId);
        
        return users;
    }

    @Override
    public User selectByID(int id) {
        User u = userDAO.selectByID(id);
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
