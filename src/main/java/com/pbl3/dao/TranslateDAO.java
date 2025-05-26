/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.dao;

import com.pbl3.dto.Translate;
import com.pbl3.util.DBUtil;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

/**
 *
 * @author Hoang Duong
 */
public class TranslateDAO implements DAOInterface<Translate> {

    // Singleton instance
    private static TranslateDAO instance;
    
    // Private constructor để ngăn việc tạo instance từ bên ngoài
    private TranslateDAO() {}
    
    // Method để lấy instance
    public static synchronized TranslateDAO getInstance() {
        if (instance == null) {
            instance = new TranslateDAO();
        }
        return instance;
    }
    @Override
    public int insert(Translate t) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "INSERT INTO translate (source_word_id, trans_word_id, type_translate_id) VALUES (?, ?, ?)";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, t.getSource_word_id());
            s.setInt(2, t.getTrans_word_id());
            s.setInt(3, t.getType_translate_id());

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
    public int update(Translate t) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "UPDATE translate SET source_word_id = ?, trans_word_id = ?, type_translate_id = ? WHERE translate_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, t.getSource_word_id());
            s.setInt(2, t.getTrans_word_id());
            s.setInt(3, t.getType_translate_id());
            s.setInt(4, t.getTranslate_id());

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
            String query = "DELETE FROM translate WHERE translate_id = ?";
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
    public int deleteByWordId(int wordId){
        try (Connection conn = DBUtil.makeConnection();
             PreparedStatement ps = conn.prepareStatement(
                 "DELETE FROM translate WHERE word_id = ?")) {
            
            ps.setInt(1, wordId);
            return ps.executeUpdate();
            
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }
    @Override
    public ArrayList<Translate> selectAll() {
        Connection c = null;
        try {
            ArrayList<Translate> list = new ArrayList<>();
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM translate";
            PreparedStatement s = c.prepareStatement(query);
            ResultSet rs = s.executeQuery();

            while (rs.next()) {
                list.add(new Translate(
                        rs.getInt("translate_id"),
                        rs.getInt("source_word_id"),
                        rs.getInt("trans_word_id"),
                        rs.getInt("type_translate_id")
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
    public Translate selectByID(int id) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM translate WHERE translate_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, id);
            ResultSet rs = s.executeQuery();

            if (rs.next()) {
                return new Translate(
                        rs.getInt("translate_id"),
                        rs.getInt("source_word_id"),
                        rs.getInt("trans_word_id"),
                        rs.getInt("type_translate_id")
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
    public Translate selectByCondition(String condition) {
        // Implement logic tìm kiếm theo điều kiện cụ thể
        return null;
    }

    public Translate selectBySourceWordID(int sourceWordId) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM translate WHERE source_word_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, sourceWordId);
            ResultSet rs = s.executeQuery();

            if (rs.next()) {
                return new Translate(
                        rs.getInt("translate_id"),
                        rs.getInt("source_word_id"),
                        rs.getInt("trans_word_id"),
                        rs.getInt("type_translate_id")
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

    public ArrayList<Translate> selectAllBySourceWordIDAndType(int sourceWordId, int typeTranslateId) {
        Connection c = null;
        try {
            ArrayList<Translate> list = new ArrayList<>();
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM translate WHERE source_word_id = ? AND type_translate_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, sourceWordId);
            s.setInt(2, typeTranslateId);
            ResultSet rs = s.executeQuery();

            while (rs.next()) {
                list.add(new Translate(
                        rs.getInt("translate_id"),
                        rs.getInt("source_word_id"),
                        rs.getInt("trans_word_id"),
                        rs.getInt("type_translate_id")
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

    /**
     * Lấy một bản dịch theo word ID và type translate
     * @param wordId ID của từ cần dịch
     * @param typeTranslateId ID của loại dịch
     * @return Translate object nếu tìm thấy, null nếu không tìm thấy
     */
    public Translate selectByWordIDAndType(int wordId, int typeTranslateId) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM translate WHERE source_word_id = ? AND type_translate_id = ? ";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, wordId);
            s.setInt(2, typeTranslateId);
            ResultSet rs = s.executeQuery();

            if (rs.next()) {
                return new Translate(
                        rs.getInt("translate_id"),
                        rs.getInt("source_word_id"),
                        rs.getInt("trans_word_id"),
                        rs.getInt("type_translate_id")
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

}
