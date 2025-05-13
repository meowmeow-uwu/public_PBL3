package com.pbl3.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

import com.pbl3.dto.History;
import com.pbl3.util.DBUtil;

public class WordHistoryDAO implements HistoryDAOInterface{

    @Override
    public int insert(History t) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String sql = "INSERT INTO word_history (user_id, word_id, word_history_date) VALUES (?, ?, ?)";
            PreparedStatement pstmt = c.prepareStatement(sql);
            pstmt.setInt(1, t.getUser_id());
            pstmt.setInt(2, t.getKey_id());
            pstmt.setDate(3, new java.sql.Date(t.getHistory_date().getTime()));
            int result = pstmt.executeUpdate();
            return result;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return 0;
}

    @Override
    public int update(History t) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String sql = "UPDATE word_history SET user_id = ?, word_id = ?, word_history_date = ? WHERE word_history_id = ?";
            PreparedStatement pstmt = c.prepareStatement(sql);
            pstmt.setInt(1, t.getUser_id());
            pstmt.setInt(2, t.getKey_id());
            pstmt.setDate(3, new java.sql.Date(t.getHistory_date().getTime()));
            pstmt.setInt(4, t.getHistory_id());
            int result = pstmt.executeUpdate();
            return result;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return 0;
}

    @Override
    public int delete(int id, int userId) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String sql = "DELETE FROM word_history WHERE word_history_id = ? AND user_id = ?";
            PreparedStatement pstmt = c.prepareStatement(sql);
            pstmt.setInt(1, id);
            pstmt.setInt(2, userId);
            int result = pstmt.executeUpdate();
            return result;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return 0;
}

    @Override
    public ArrayList<History> selectAll(int userId) {
        Connection c = null;
        ArrayList<History> histories = new ArrayList<>();
        try {
            c = DBUtil.makeConnection();
            String sql = "SELECT * FROM word_history WHERE user_id = ?";
            PreparedStatement pstmt = c.prepareStatement(sql);
            pstmt.setInt(1, userId);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                History t = new History();
                t.setHistory_id(rs.getInt("history_id"));
                t.setUser_id(rs.getInt("user_id"));
                t.setKey_id(rs.getInt("key_id"));
                t.setHistory_date(rs.getDate("history_date"));
                histories.add(t);
            }
            return histories;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
}

    @Override
    public History selectByID(int id, int userId) {
        Connection c = null;
        History t = null;
        try {
            c = DBUtil.makeConnection();
            String sql = "SELECT * FROM word_history WHERE word_history_id = ? AND user_id = ?";
            PreparedStatement pstmt = c.prepareStatement(sql);
            pstmt.setInt(1, id);
            pstmt.setInt(2, userId);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                t = new History();
                t.setHistory_id(rs.getInt("history_id"));
                t.setUser_id(rs.getInt("user_id"));
                t.setKey_id(rs.getInt("key_id"));
                t.setHistory_date(rs.getDate("history_date"));
            }
            return t;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
}

    @Override
    public History selectByCondition(String condition) {
        return null;
}
}
    
