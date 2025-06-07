package com.pbl3.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.sql.Timestamp;

import com.pbl3.dto.History;
import com.pbl3.util.DBUtil;
import java.util.HashMap;
import java.util.Map;

public class PostHistoryDAO implements HistoryDAOInterface {

    @Override
    public int insert(History t) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String sql = "INSERT INTO post_history (user_id, post_id, post_history_date) VALUES (?, ?, ?)";
            PreparedStatement pstmt = c.prepareStatement(sql);
            pstmt.setInt(1, t.getUser_id());
            pstmt.setInt(2, t.getKey_id());
            pstmt.setTimestamp(3, new java.sql.Timestamp(t.getHistory_date().getTime()));
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
            String sql = "UPDATE post_history SET user_id = ?, post_id = ?, post_history_date = ? WHERE post_history_id = ?";
            PreparedStatement pstmt = c.prepareStatement(sql);
            pstmt.setInt(1, t.getUser_id());
            pstmt.setInt(2, t.getKey_id());
            pstmt.setTimestamp(3, new java.sql.Timestamp(t.getHistory_date().getTime()));
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
            String sql = "DELETE FROM post_history WHERE post_history_id = ? AND user_id = ?";
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
            String sql = "SELECT * FROM post_history WHERE user_id = ? ORDER BY post_history_date DESC";
            PreparedStatement pstmt = c.prepareStatement(sql);
            pstmt.setInt(1, userId);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                History t = new History();
                t.setHistory_id(rs.getInt("post_history_id"));
                t.setUser_id(rs.getInt("user_id"));
                t.setKey_id(rs.getInt("post_id"));
                t.setHistory_date(rs.getTimestamp("post_history_date"));
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
            String sql = "SELECT * FROM post_history WHERE post_id = ? AND user_id = ?";
            PreparedStatement pstmt = c.prepareStatement(sql);
            pstmt.setInt(1, id);
            pstmt.setInt(2, userId);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                t = new History();
                t.setHistory_id(rs.getInt("post_history_id"));
                t.setUser_id(rs.getInt("user_id"));
                t.setKey_id(rs.getInt("post_id"));
                t.setHistory_date(rs.getTimestamp("post_history_date"));
            }
            return t;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
    }

    public History selectByCondition(String condition) {
        Connection c = null;
        History t = null;
        try {
            c = DBUtil.makeConnection();
            PreparedStatement pstmt = c.prepareStatement(condition);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                t = new History();
                t.setHistory_id(rs.getInt("post_history_id"));
                t.setUser_id(rs.getInt("user_id"));
                t.setKey_id(rs.getInt("post_id"));
                t.setHistory_date(rs.getTimestamp("post_history_date"));
            }
            rs.close();
            pstmt.close();
            return t;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
    }

    @Override
    public int selectCount(int userId) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            // Truy vấn đếm tổng số bản ghi
            String countSql = "SELECT COUNT(*) as total FROM post_history WHERE (user_id) = ? ";

            PreparedStatement countStmt = c.prepareStatement(countSql);
            countStmt.setInt(1, userId);
            ResultSet countRs = countStmt.executeQuery();
            int total = 0;
            if (countRs.next()) {
                total = countRs.getInt("total");
            }
            countRs.close();
            countStmt.close();

            return total;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return 0;
    }

    @Override
    public int getNumberPage(int userId, int pageSize, String keyword) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            // Truy vấn đếm tổng số bản ghi
            String countSql = "SELECT COUNT(*) as total FROM post_history "
                    + "WHERE user_id = ? AND "
                    + "(? IS NULL OR ? = '' OR post_history_date LIKE ?)";

            PreparedStatement countStmt = c.prepareStatement(countSql);
            countStmt.setInt(1, userId);
            countStmt.setString(2, keyword);
            countStmt.setString(3, keyword);
            countStmt.setString(4,"%"+ keyword + "%");

            ResultSet countRs = countStmt.executeQuery();
            int totalRecords = 0;
            if (countRs.next()) {
                totalRecords = countRs.getInt("total");
            }
            countRs.close();
            countStmt.close();

            return (int) Math.ceil((double) totalRecords / pageSize);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return 0;
    }

    @Override
    public Map<String, Object> getHistoryByPage(int userId, int pageNumber, int pageSize, String keyword) {
        Connection c = null;
        int offset = (pageNumber - 1) * pageSize;

        try {
            ArrayList<History> histories = new ArrayList<>();
            c = DBUtil.makeConnection();

            // Tính tổng số trang
            int totalPages = this.getNumberPage(userId, pageSize, keyword);

            // Truy vấn lấy dữ liệu phân trang
            String sql = "SELECT * FROM post_history "
                    + "WHERE user_id = ? AND"
                    + "(? IS NULL OR ? = '' OR post_history_date LIKE ?) "
                    + "ORDER BY post_history_date DESC "
                    + "LIMIT ? OFFSET ?;";

            PreparedStatement s = c.prepareStatement(sql);
            s.setInt(1, userId);
            s.setString(2, keyword);
            s.setString(3, keyword);
            s.setString(4,"%"+ keyword + "%");
            s.setInt(5, pageSize);
            s.setInt(6, offset);

            ResultSet rs = s.executeQuery();
            while (rs.next()) {
                History t = new History();
                t.setHistory_id(rs.getInt("post_history_id"));
                t.setUser_id(rs.getInt("user_id"));
                t.setKey_id(rs.getInt("post_id"));
                t.setHistory_date(rs.getTimestamp("post_history_date"));
                histories.add(t);
            }

            rs.close();
            s.close();

            // Tạo Map kết quả chứa cả danh sách từ và thông tin phân trang
            Map<String, Object> result = new HashMap<>();
            result.put("histories", histories);
            result.put("totalPages", totalPages);

            return result;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }

        return new HashMap<>();
    }
}
