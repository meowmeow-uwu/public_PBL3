/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import com.pbl3.dto.User;
import com.pbl3.util.DBUtil;
import java.sql.Statement;

/**
 *
 * @author Danh
 */
public class UserDAO implements DAOInterface<User> {
    private static UserDAO instance;

    private UserDAO() {}

    public static synchronized UserDAO getInstance() {
        if (instance == null) {
            instance = new UserDAO();
        }
        return instance;
    }


    @Override
    public int insert(User t) {
        Connection c = null;
        int userId = -1;
        try {
            c = DBUtil.makeConnection();
            String query = "INSERT INTO _user (name, avatar, group_user_id) VALUES (?, ?, ?)";
            PreparedStatement s = c.prepareStatement(query, Statement.RETURN_GENERATED_KEYS);
            s.setString(1, t.getName());
            s.setString(2, t.getAvatar());
            s.setInt(3, t.getGroup_user_id());

            int result = s.executeUpdate();
            if (result > 0) {
                ResultSet rs = s.getGeneratedKeys();
                if (rs.next()) {
                    userId = rs.getInt(1);
                }
            }
            s.close();
            return userId;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return -1;
    }

    @Override
    public int update(User t
    ) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "UPDATE _user SET name = ?, avatar = ?, group_user_id = ? WHERE user_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setString(1, t.getName());
            s.setString(2, t.getAvatar());
            s.setInt(3, t.getGroup_user_id());
            s.setInt(4, t.getUser_id());

            int result = s.executeUpdate();
            s.close();
            return result;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return 0;

    }

    @Override
    public int delete(int id
    ) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "DELETE FROM _user WHERE user_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, id);

            int result = s.executeUpdate();
            s.close();
            return result;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return 0;

    }

    @Override
    public ArrayList<User> selectAll() {
        Connection c = null;
        try {
            ArrayList<User> listUser = new ArrayList<User>();
            c = DBUtil.makeConnection();
            String query = "select * from _user ";
            PreparedStatement s = c.prepareStatement(query);
            ResultSet rs = s.executeQuery();
            while (rs.next()) {
                listUser.add(new User(rs.getInt("user_id"), rs.getString("name"), rs.getString("avatar"), rs.getInt("group_user_id")));
            }
            rs.close();
            s.close();
            return listUser;

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
    }

    public ArrayList<User> selectAllByGroupUserId(int groupUserId) {
        Connection c = null;
        try {
            ArrayList<User> listUser = new ArrayList<User>();
            c = DBUtil.makeConnection();
            String query = "select * from _user where group_user_id = ? ";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, groupUserId);
            ResultSet rs = s.executeQuery();
            while (rs.next()) {
                listUser.add(new User(rs.getInt("user_id"), rs.getString("name"), rs.getString("avatar"), rs.getInt("group_user_id")));
            }
            rs.close();
            s.close();
            return listUser;

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
    }

    @Override
    public User selectByID(int id
    ) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "select * from _user where user_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, id);
            ResultSet rs = s.executeQuery();
            if (rs.next()) {
                return new User(rs.getInt("user_id"), rs.getString("name"), rs.getString("avatar"), rs.getInt("group_user_id"));
            }

            rs.close();
            s.close();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;

    }

    @Override
    public User selectByCondition(String condition
    ) {
        return null;
    }

}
