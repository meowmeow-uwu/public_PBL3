/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.dao;

import com.pbl3.dto.User;
import com.pbl3.util.DBUtil;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

/**
 *
 * @author Danh
 */
public class UserDAO implements DAOInterface<User>{

    public static void main(String[] args) {
        UserDAO d = new UserDAO();
        User u = d.selectByID(1);
        System.out.println("Kết quả là: " + u);
    }
    
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
        Connection c = null;
        try{
        c =  DBUtil.makeConnection();
            String query = "select * from users where user_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, id);
            ResultSet rs = s.executeQuery();
            if(rs.next()){
                return new User(rs.getInt("user_id"), rs.getString("username"), rs.getString("email"), rs.getString("password"), rs.getString("name"), rs.getString("avatar"), rs.getBoolean("is_active"), rs.getInt("group_user_id"));
            }
            
            rs.close();
            s.close();
        } 
        catch(Exception e){
            e.printStackTrace();
        }
        finally{
            DBUtil.closeConnection(c);
        }
                    return null;

    }
    @Override
    public User selectByCondition(String condition) {
        return null;
    }
    
}
