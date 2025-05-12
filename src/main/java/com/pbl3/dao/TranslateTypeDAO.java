/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.dao;

import com.pbl3.dto.TranslateType;
import com.pbl3.util.DBUtil;
import java.sql.Connection;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.sql.PreparedStatement;

/**
 *
 * @author Hoang Duong
 */
public class TranslateTypeDAO implements DAOInterface<TranslateType>{
    
    @Override
    public int insert(TranslateType translateType) {
    
        return 0;
    }

    @Override
    public int update(TranslateType translateType) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "UPDATE type_translate SET type_translate_name = ? WHERE type_translate_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setString(1, translateType.getType_translate_name());
            s.setInt(2, translateType.getType_translate_id());
            
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
        // Vì bảng không cho phép xóa, trả về 0
        return 0;
    }

    @Override
    public ArrayList<TranslateType> selectAll() {
        Connection c = null;
        try {
            ArrayList<TranslateType> list = new ArrayList<>();
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM type_translate";
            PreparedStatement s = c.prepareStatement(query);
            ResultSet rs = s.executeQuery();
            
            while (rs.next()) {
                list.add(new TranslateType(
                    rs.getInt("type_translate_id"),
                    rs.getString("type_translate_name")
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
    public TranslateType selectByID(int id) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM type_translate WHERE type_translate_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, id);
            ResultSet rs = s.executeQuery();
            
            if (rs.next()) {
                return new TranslateType(
                    rs.getInt("type_translate_id"),
                    rs.getString("type_translate_name")
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
    public TranslateType selectByCondition(String condition) {
        // Có thể triển khai theo nhu cầu cụ thể
        return null;
    }
}
