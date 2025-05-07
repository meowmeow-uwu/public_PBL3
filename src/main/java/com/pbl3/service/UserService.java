/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.service;

import java.util.ArrayList;

import com.pbl3.dao.UserDAO;
import com.pbl3.dto.User;

/**
 *
 * @author Danh
 */
public class UserService implements ServiceInterface<User>{

    @Override
    public int insert(User user) {
        UserDAO dao = new UserDAO();
        int result = dao.insert(user);
        if (result > 0) {
            System.out.println("User inserted successfully.");
        } else {
            System.out.println("Failed to insert user.");
        }
        return result;
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
        if (users != null && !users.isEmpty()) {
            System.out.println("Users fetched successfully.");
        } else {
            System.out.println("No users found.");
        }
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
    
}
