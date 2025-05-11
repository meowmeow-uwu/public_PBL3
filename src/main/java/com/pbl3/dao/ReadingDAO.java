package com.pbl3.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

import com.pbl3.dto.Reading;
import com.pbl3.util.DBUtil;

public class ReadingDAO implements DAOInterface<Reading>{

    @Override
    public int insert(Reading t) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String sql = "INSERT INTO reading (title, content) VALUES (?, ?)";
            PreparedStatement ps = c.prepareStatement(sql);
            ps.setString(1, t.getTitle());
            ps.setString(2, t.getContent());
            int result = ps.executeUpdate();
            ps.close();
            return result;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return 0;
    }

    @Override
    public int update(Reading t) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String sql = "UPDATE reading SET title = ?, content = ? WHERE id = ?";
            PreparedStatement ps = c.prepareStatement(sql);
            ps.setString(1, t.getTitle());
            ps.setString(2, t.getContent());
            int result = ps.executeUpdate();
            ps.close();
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

            String sql = "DELETE FROM exam_has_reading WHERE reading_id = ?";
            PreparedStatement ps = c.prepareStatement(sql);
            ps.setInt(1, id);
            int result = ps.executeUpdate();
            int temp = 0;
            sql = "DELETE FROM reading_question WHERE reading_id = ?";
            ps = c.prepareStatement(sql);
            ps.setInt(1, id);
            result = result >= (temp = ps.executeUpdate()) ? temp : result;
            sql = "DELETE FROM reading WHERE reading_id = ?";
            ps = c.prepareStatement(sql);
            ps.setInt(1, id);
            result = result >= (temp = ps.executeUpdate()) ? temp : result;
            ps.close();
            return result;
        } catch(Exception e){
            e.printStackTrace();
        } finally{
            DBUtil.closeConnection(c);
        }
        return 0;
    }

    @Override
    public ArrayList<Reading> selectAll() {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String sql = "SELECT * FROM reading";
            PreparedStatement ps = c.prepareStatement(sql);
            ResultSet rs = ps.executeQuery();
            ArrayList<Reading> list = new ArrayList<>();
            while(rs.next()){
                Reading r = new Reading();
                r.setReading_id(rs.getInt("reading_id"));
                r.setTitle(rs.getString("title"));
                r.setContent(rs.getString("content"));
                list.add(r);
            }
            rs.close();
            ps.close();
            return list;
        } catch(SQLException e){
            e.printStackTrace();
        } finally{
            DBUtil.closeConnection(c);
        }
        return null;
    }

    @Override
    public Reading selectByID(int id) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String sql = "SELECT * FROM reading WHERE reading_id = ?";
            PreparedStatement ps = c.prepareStatement(sql);
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();
            if(rs.next()){
                Reading r = new Reading();
                r.setReading_id(rs.getInt("reading_id"));
                r.setTitle(rs.getString("title"));
                r.setContent(rs.getString("content"));
                rs.close();
                ps.close();
                return r;
            }
        } catch(SQLException e){
            e.printStackTrace();
        } finally{
            DBUtil.closeConnection(c);
        }
        return null;
 }

    @Override
    public Reading selectByCondition(String condition) {
        return null;
}
    
}
