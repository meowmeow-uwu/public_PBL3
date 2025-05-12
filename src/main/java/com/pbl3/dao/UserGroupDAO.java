/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.dao;

import com.pbl3.dto.UserGroup;
import com.pbl3.util.DBUtil;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

/**
 *
 * @author Hoang Duong
 */
public class UserGroupDAO implements DAOInterface<UserGroup> {

    @Override
    public int insert(UserGroup t) {

        return 0;
    }

    @Override
    public int update(UserGroup t) {
       
        return 0;
    }

    @Override
    public ArrayList<UserGroup> selectAll() {
        Connection c = null;
        try {
            ArrayList<UserGroup> listGroup = new ArrayList<>();
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM group_user";
            PreparedStatement s = c.prepareStatement(query);
            ResultSet rs = s.executeQuery();
            while (rs.next()) {
                listGroup.add(new UserGroup(
                        rs.getInt("group_user_id"),
                        rs.getString("group_name")
                ));
            }
            rs.close();
            s.close();
            return listGroup;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
    }

    @Override
    public UserGroup selectByID(int id) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM group_user WHERE group_user_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, id);
            ResultSet rs = s.executeQuery();
            if (rs.next()) {
                return new UserGroup(
                        rs.getInt("group_user_id"),
                        rs.getString("group_name")
                );
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
    public UserGroup selectByCondition(String condition) {
        return null;
    }

    @Override
    public int delete(int id) {
        return 0;

    }

}
