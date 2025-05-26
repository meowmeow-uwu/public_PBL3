/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.dao;

import com.pbl3.dto.Definition;
import com.pbl3.util.DBUtil;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

/**
 *
 * @author Hoang Duong
 */
public class DefinitionDAO implements DAOInterface<Definition> {
    // Singleton instance
    private static DefinitionDAO instance;
    
    // Private constructor để ngăn việc tạo instance từ bên ngoài
    private DefinitionDAO() {}
    
    // Method để lấy instance
    public static synchronized DefinitionDAO getInstance() {
        if (instance == null) {
            instance = new DefinitionDAO();
        }
        return instance;
    }
    @Override
    public int insert(Definition definition) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "INSERT INTO definition (word_id, meaning, example, word_type) VALUES (?, ?, ?, ?)";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, definition.getWord_id());
            s.setString(2, definition.getMeaning());
            s.setString(3, definition.getExample());
            s.setString(4, definition.getWord_type());

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
    public int update(Definition definition) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "UPDATE definition SET word_id = ?, meaning = ?, example = ?, word_type = ? WHERE definition_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, definition.getWord_id());
            s.setString(2, definition.getMeaning());
            s.setString(3, definition.getExample());
            s.setString(4, definition.getWord_type());
            s.setInt(5, definition.getDefinition_id());

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
            String query = "DELETE FROM definition WHERE definition_id = ?";
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

    public int DeleteByWordId(int wordId)
    {
        try (Connection conn = DBUtil.makeConnection();
             PreparedStatement ps = conn.prepareStatement(
                 "DELETE FROM definition WHERE word_id = ?")) {
            
            ps.setInt(1, wordId);
            return ps.executeUpdate();
            
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }
    @Override
    public ArrayList<Definition> selectAll() {
        Connection c = null;
        try {
            ArrayList<Definition> list = new ArrayList<>();
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM definition";
            PreparedStatement s = c.prepareStatement(query);
            ResultSet rs = s.executeQuery();

            while (rs.next()) {
                list.add(new Definition(
                        rs.getInt("definition_id"),
                        rs.getInt("word_id"),
                        rs.getString("meaning"),
                        rs.getString("example"),
                        rs.getString("word_type")
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
    public Definition selectByID(int id) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM definition WHERE definition_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, id);
            ResultSet rs = s.executeQuery();

            if (rs.next()) {
                return new Definition(
                        rs.getInt("definition_id"),
                        rs.getInt("word_id"),
                        rs.getString("meaning"),
                        rs.getString("example"),
                        rs.getString("word_type")
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
    public Definition selectByCondition(String condition) {
        // Có thể triển khai theo nhu cầu cụ thể
        return null;
    }

    public Definition selectByWordID(int wordId) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM definition WHERE word_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, wordId);
            ResultSet rs = s.executeQuery();

            if (rs.next()) {
                return new Definition(
                        rs.getInt("definition_id"),
                        rs.getInt("word_id"),
                        rs.getString("meaning"),
                        rs.getString("example"),
                        rs.getString("word_type")
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

    public ArrayList<Definition> selectAllByWordID(int wordId) {
        Connection c = null;
        try {
            ArrayList<Definition> list = new ArrayList<>();
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM definition WHERE word_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, wordId);
            ResultSet rs = s.executeQuery();

            while (rs.next()) {
                list.add(new Definition(
                        rs.getInt("definition_id"),
                        rs.getInt("word_id"),
                        rs.getString("meaning"),
                        rs.getString("example"),
                        rs.getString("word_type")
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
}
