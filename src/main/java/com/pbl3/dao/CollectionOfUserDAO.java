/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.dao;

import com.pbl3.dto.CollectionOfUser;
import com.pbl3.util.DBUtil;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

/**
 *
 * @author Hoang Duong
 */
public class CollectionOfUserDAO implements DAOInterface<CollectionOfUser> {
    // Singleton instance
    private static CollectionOfUserDAO instance;
    
    // Private constructor
    private CollectionOfUserDAO() {}
    
    // Method để lấy instance
    public static synchronized CollectionOfUserDAO getInstance() {
        if (instance == null) {
            instance = new CollectionOfUserDAO();
        }
        return instance;
    }

    @Override
    public int insert(CollectionOfUser item) {
        try (Connection conn = DBUtil.makeConnection();
             PreparedStatement ps = conn.prepareStatement(
                 "INSERT INTO collection_has_user (collection_id, user_id) VALUES (?, ?)")) {
            
            ps.setInt(1, item.getCollection_id());
            ps.setInt(2, item.getUser_id());
            return ps.executeUpdate();
            
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    @Override
    public int update(CollectionOfUser item) {
        try (Connection conn = DBUtil.makeConnection();
             PreparedStatement ps = conn.prepareStatement(
                 "UPDATE collection_has_user SET collection_id = ?, user_id = ? WHERE collection_user_id = ?")) {
            
            ps.setInt(1, item.getCollection_id());
            ps.setInt(2, item.getUser_id());
            ps.setInt(3, item.getCollection_user_id());
            return ps.executeUpdate();
            
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    @Override
    public int delete(int id) {
        try (Connection conn = DBUtil.makeConnection();
             PreparedStatement ps = conn.prepareStatement(
                 "DELETE FROM collection_has_user WHERE collection_user_id = ?")) {
            
            ps.setInt(1, id);
            return ps.executeUpdate();
            
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    @Override
    public ArrayList<CollectionOfUser> selectAll() {
        ArrayList<CollectionOfUser> list = new ArrayList<>();
        try (Connection conn = DBUtil.makeConnection();
             PreparedStatement ps = conn.prepareStatement("SELECT * FROM collection_has_user");
             ResultSet rs = ps.executeQuery()) {
            
            while (rs.next()) {
                list.add(new CollectionOfUser(
                    rs.getInt("collection_user_id"),
                    rs.getInt("collection_id"),
                    rs.getInt("user_id")
                ));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    @Override
    public CollectionOfUser selectByID(int id) {
        try (Connection conn = DBUtil.makeConnection();
             PreparedStatement ps = conn.prepareStatement(
                 "SELECT * FROM collection_has_user WHERE collection_user_id = ?")) {
            
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new CollectionOfUser(
                        rs.getInt("collection_user_id"),
                        rs.getInt("collection_id"),
                        rs.getInt("user_id")
                    );
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    public CollectionOfUser selectByCondition(String condition) {
        return null;
    }

    public CollectionOfUser selectByUserID(int userId) {
        try (Connection conn = DBUtil.makeConnection();
             PreparedStatement ps = conn.prepareStatement(
                 "SELECT * FROM collection_has_user WHERE user_id = ?")) {
            
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new CollectionOfUser(
                        rs.getInt("collection_user_id"),
                        rs.getInt("collection_id"),
                        rs.getInt("user_id")
                    );
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
