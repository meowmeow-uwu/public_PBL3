/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.dao;

import com.pbl3.dto.Language;
import com.pbl3.util.DBUtil;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

/**
 *
 * @author Hoang Duong
 */
public class LanguageDAO implements DAOInterface<Language>{
    
    @Override
    public int insert(Language language) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "INSERT INTO language (Language_id, language_name) VALUES (?, ?)";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, language.getLanguage_id());
            s.setString(2, language.getLanguage_name());
            
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
    public int update(Language language) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "UPDATE language SET Language_id = ?, language_name = ? WHERE Language_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, language.getLanguage_id());
            s.setString(2, language.getLanguage_name());
            s.setInt(3, language.getLanguage_id());
            
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
            String query = "DELETE FROM language WHERE Language_id = ?";
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
    public ArrayList<Language> selectAll() {
        Connection c = null;
        try {
            ArrayList<Language> list = new ArrayList<>();
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM language";
            PreparedStatement s = c.prepareStatement(query);
            ResultSet rs = s.executeQuery();
            
            while (rs.next()) {
                list.add(new Language(
                    rs.getInt("Language_id"),
                    rs.getString("language_name")
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
    public Language selectByID(int id) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM language WHERE Language_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, id);
            ResultSet rs = s.executeQuery();
            
            if (rs.next()) {
                return new Language(
                    rs.getInt("Language_id"),
                    rs.getString("language_name")
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
    public Language selectByCondition(String condition) {
        // Có thể triển khai theo nhu cầu cụ thể
        return null;
    }
}
