/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.dao;

import com.pbl3.dto.Collection;
import com.pbl3.util.DBUtil;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

/**
 *
 * @author Hoang Duong
 */
public class CollectionDAO implements DAOInterface<Collection> {
    // Singleton instance
    private static CollectionDAO instance;
    
    // Private constructor
    private CollectionDAO() {}
    
    // Method để lấy instance
    public static synchronized CollectionDAO getInstance() {
        if (instance == null) {
            instance = new CollectionDAO();
        }
        return instance;
    }

    //return collection_id
    @Override
    public int insert(Collection collection) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "INSERT INTO collection (collection_name, is_public) VALUES (?, ?); SELECT SCOPE_IDENTITY();";
            PreparedStatement s = c.prepareStatement(query);
            s.setString(1, collection.getCollection_name());
            s.setBoolean(2, collection.isPublic());
            
            // Thực thi câu lệnh INSERT
            s.executeUpdate();
            
            // Lấy ID vừa được tạo
            ResultSet rs = s.getGeneratedKeys();
            if (rs.next()) {
                int id = rs.getInt(1);
                s.close();
                return id;
            }
            rs.close();
            s.close();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return 0;
    }

    @Override
    public int update(Collection collection) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "UPDATE collection SET collection_name = ?, is_public = ? WHERE collection_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setString(1, collection.getCollection_name());
            s.setBoolean(2, collection.isPublic());
            s.setInt(3, collection.getCollection_id());
            
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
    public int delete(int id) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "DELETE FROM collection WHERE collection_id = ?";
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
    public ArrayList<Collection> selectAll() {
        Connection c = null;
        try {
            ArrayList<Collection> list = new ArrayList<>();
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM collection";
            PreparedStatement s = c.prepareStatement(query);
            ResultSet rs = s.executeQuery();
            
            while (rs.next()) {
                list.add(new Collection(
                    rs.getInt("collection_id"),
                    rs.getString("collection_name"),
                    rs.getBoolean("is_public")
                ));
            }
            rs.close();
            s.close();
            return list;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
    }

    @Override
    public Collection selectByID(int id) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM collection WHERE collection_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, id);
            ResultSet rs = s.executeQuery();
            
            if (rs.next()) {
                return new Collection(
                    rs.getInt("collection_id"),
                    rs.getString("collection_name"),
                    rs.getBoolean("is_public")
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
    public Collection selectByCondition(String condition) {
        return null;
    }

    public Collection selectByUserID(int userId) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM collection WHERE user_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, userId);
            ResultSet rs = s.executeQuery();
            if (rs.next()) {
                return new Collection(
                    rs.getInt("collection_id"),
                    rs.getString("collection_name"),
                    rs.getBoolean("is_public")
                );}
                rs.close();
                s.close();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
    }

}
