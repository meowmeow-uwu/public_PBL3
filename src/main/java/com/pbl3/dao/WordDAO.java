/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.dao;

import com.pbl3.dto.Word;
import com.pbl3.util.DBUtil;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

/**
 *
 * @author Danh
 */
public class WordDAO implements DAOInterface<Word>{
    private static WordDAO instance;
    
    private WordDAO() {}
    
    public static synchronized WordDAO getInstance() {
        if (instance == null) {
            instance = new WordDAO();
        }
        return instance;
    }
    
    @Override
    public int insert(Word word) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "INSERT INTO word (language_id, word_name, pronunciation, sound, is_deleted) VALUES (?, ?, ?, ?, ?)";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, word.getLanguage_id());
            s.setString(2, word.getWord_name());
            s.setString(3, word.getPronunciation());
            s.setString(4, word.getSound());
            s.setBoolean(5, word.is_deleted());
            
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
    public int update(Word word) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "UPDATE word SET language_id=?, word_name=?, pronunciation=?, sound=?, is_deleted=? WHERE word_id=?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, word.getLanguage_id());
            s.setString(2, word.getWord_name());
            s.setString(3, word.getPronunciation());
            s.setString(4, word.getSound());
            s.setBoolean(5, word.is_deleted());
            s.setInt(6, word.getWord_id());
            
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
        return 0;
    }

    @Override
    public ArrayList<Word> selectAll() {
        Connection c = null;
        try {
            ArrayList<Word> list = new ArrayList<>();
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM word WHERE is_deleted = 0";
            PreparedStatement s = c.prepareStatement(query);
            ResultSet rs = s.executeQuery();
            
            while (rs.next()) {
                list.add(new Word(
                    rs.getInt("language_id"),
                    rs.getInt("word_id"),
                    rs.getString("word_name"),
                    rs.getString("pronunciation"),
                    rs.getString("sound"),
                    rs.getBoolean("is_deleted")
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
    public Word selectByID(int wordId) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM word WHERE word_id = ? and is_deleted = 0";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, wordId);
            ResultSet rs = s.executeQuery();
            
            if (rs.next()) {
                return new Word(
                    rs.getInt("language_id"),
                    rs.getInt("word_id"),
                    rs.getString("word_name"),
                    rs.getString("pronunciation"),
                    rs.getString("sound"),
                    rs.getBoolean("is_deleted")
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
    public Word selectByCondition(String condition) {
        // Có thể triển khai theo nhu cầu cụ thể
        return null;
    }
    
    // Phương thức bổ sung
    public ArrayList<Word> findByLanguage(int languageId) {
        Connection c = null;
        try {
            ArrayList<Word> list = new ArrayList<>();
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM word WHERE language_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, languageId);
            ResultSet rs = s.executeQuery();
            
            while (rs.next()) {
                list.add(new Word(
                    rs.getInt("language_id"),
                    rs.getInt("word_id"),
                    rs.getString("word_name"),
                    rs.getString("pronunciation"),
                    rs.getString("sound"),
                    rs.getBoolean("is_deleted")
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
    
    public Word findByWordName(String wordName) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM word WHERE word_name = ? AND is_deleted = 0";
            PreparedStatement s = c.prepareStatement(query);
            s.setString(1, wordName);
            ResultSet rs = s.executeQuery();
            
            if (rs.next()) {
                return new Word(
                    rs.getInt("language_id"),
                    rs.getInt("word_id"),
                    rs.getString("word_name"),
                    rs.getString("pronunciation"),
                    rs.getString("sound"),
                    rs.getBoolean("is_deleted")
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
