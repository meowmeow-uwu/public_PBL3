/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.service;

import com.pbl3.dao.UserDAO;
import com.pbl3.dto.User;
import java.util.ArrayList;

/**
 *
 * @author Danh
 */
public class UserService implements ServiceInterface<User>{

    @Override
    public int insert(User t) {
        return 1;
    }

    @Override
    public int update(User t) {
        return 1;
    }

    @Override
    public int delete(User t) {
        return 1;
    }

    @Override
    public ArrayList<User> selectAll() {
        return null;
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
