package com.pbl3.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.sql.Timestamp;

import com.pbl3.dto.ExamHistory;
import com.pbl3.util.DBUtil;
import java.util.HashMap;
import java.util.Map;

public class ExamHistoryDAO {

    public int getNumberPage(int userId, int pageSize, String keyword) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            // Truy vấn đếm tổng số bản ghi
            String countSql = "SELECT COUNT(*) as total FROM exam_history "
                    + "WHERE user_id = ? AND "
                    + "(? IS NULL OR ? = '' OR exam_history_date LIKE ?)";

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
    public Map<String, Object> getExamHistoryByPage(int userId, int pageNumber, int pageSize, String keyword) {
        Connection c = null;
        int offset = (pageNumber - 1) * pageSize;

        try {
            ArrayList<ExamHistory> examHistories = new ArrayList<>();
            c = DBUtil.makeConnection();

            // Tính tổng số trang
            int totalPages = this.getNumberPage(userId, pageSize, keyword);

            // Truy vấn lấy dữ liệu phân trang
            String sql = "SELECT * FROM exam_history "
                    + "WHERE user_id = ? AND"
                    + "(? IS NULL OR ? = '' OR exam_history_date LIKE ?) "
                    + "ORDER BY exam_history_date DESC "
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
                ExamHistory t = new ExamHistory();
                t.setExam_history_id(rs.getInt("exam_history_id"));
                t.setUser_id(rs.getInt("user_id"));
                t.setExam_id(rs.getInt("exam_id"));
                t.setCorrect_number(rs.getInt("correct_number"));
                t.setWrong_number(rs.getInt("wrong_number"));
                t.setTotal_question(rs.getInt("total_question"));
                t.setExam_history_date(rs.getTimestamp("exam_history_date"));
                examHistories.add(t);
            }

            rs.close();
            s.close();

            // Tạo Map kết quả chứa cả danh sách từ và thông tin phân trang
            Map<String, Object> result = new HashMap<>();
            result.put("examHistories", examHistories);
            result.put("totalPages", totalPages);

            return result;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }

        return new HashMap<>();
    }
    public int insert(ExamHistory t) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String sql = "INSERT INTO exam_history (user_id, exam_id, correct_number, wrong_number, total_question, exam_history_date) VALUES (?, ?, ?, ?, ?, ?)";
            PreparedStatement pstmt = c.prepareStatement(sql);
            pstmt.setInt(1, t.getUser_id());
            pstmt.setInt(2, t.getExam_id());
            pstmt.setInt(3, t.getCorrect_number());
            pstmt.setInt(4, t.getWrong_number());
            pstmt.setInt(5, t.getTotal_question());
            pstmt.setTimestamp(6, new Timestamp(t.getExam_history_date().getTime()));
            int result = pstmt.executeUpdate();
            pstmt.close();
            return result;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return 0;
    }

    public int update(ExamHistory t) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String sql = "UPDATE exam_history SET user_id = ?, exam_id = ?, correct_number = ?, wrong_number = ?, total_question = ?, exam_history_date = ? WHERE exam_history_id = ?";
            PreparedStatement pstmt = c.prepareStatement(sql);
            pstmt.setInt(1, t.getUser_id());
            pstmt.setInt(2, t.getExam_id());
            pstmt.setInt(3, t.getCorrect_number());
            pstmt.setInt(4, t.getWrong_number());
            pstmt.setInt(5, t.getTotal_question());
            pstmt.setTimestamp(6, new Timestamp(t.getExam_history_date().getTime()));
            pstmt.setInt(7, t.getExam_history_id());
            int result = pstmt.executeUpdate();
            pstmt.close();
            return result;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return 0;
    }

    public int delete(int id, int userId) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String sql;
            sql = "DELETE FROM exam_history WHERE exam_history_id = ? AND user_id = ?";
            PreparedStatement pstmt = c.prepareStatement(sql);
            pstmt.setInt(1, id);
            pstmt.setInt(2, userId);
            int result = pstmt.executeUpdate();
            pstmt.close();
            return result;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return 0;
    }

    public ArrayList<ExamHistory> selectAll(int userId) {
        Connection c = null;
        ArrayList<ExamHistory> examHistories = new ArrayList<>();
        try {
            c = DBUtil.makeConnection();
            String sql = "SELECT * FROM exam_history WHERE user_id = ? ORDER BY exam_history_id DESC";
            PreparedStatement pstmt = c.prepareStatement(sql);
            pstmt.setInt(1, userId);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                ExamHistory t = new ExamHistory();
                t.setExam_history_id(rs.getInt("exam_history_id"));
                t.setUser_id(rs.getInt("user_id"));
                t.setExam_id(rs.getInt("exam_id"));
                t.setCorrect_number(rs.getInt("correct_number"));
                t.setWrong_number(rs.getInt("wrong_number"));
                t.setTotal_question(rs.getInt("total_question"));
                t.setExam_history_date(rs.getTimestamp("exam_history_date"));
                examHistories.add(t);
            }
            return examHistories;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
    }

    public ExamHistory selectByID(int id, int userId) {
        Connection c = null;
        ExamHistory t = null;
        try {
            c = DBUtil.makeConnection();
            String sql = "SELECT * FROM exam_history WHERE exam_id = ? AND user_id = ?";
            PreparedStatement pstmt = c.prepareStatement(sql);
            pstmt.setInt(1, id);
            pstmt.setInt(2, userId);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                t = new ExamHistory();
                t.setExam_history_id(rs.getInt("exam_history_id"));
                t.setUser_id(rs.getInt("user_id"));
                t.setExam_id(rs.getInt("exam_id"));
                t.setCorrect_number(rs.getInt("correct_number"));
                t.setWrong_number(rs.getInt("wrong_number"));
                t.setTotal_question(rs.getInt("total_question"));
                t.setExam_history_date(rs.getTimestamp("exam_history_date"));

            }
            return t;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
    }

    public ExamHistory selectByCondition(String condition) {
        Connection c = null;
        ExamHistory t = null;
        try {
            c = DBUtil.makeConnection();
            PreparedStatement pstmt = c.prepareStatement(condition);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                t = new ExamHistory();
                t.setExam_history_id(rs.getInt("exam_history_id"));
                t.setUser_id(rs.getInt("user_id"));
                t.setExam_id(rs.getInt("exam_id"));
                t.setCorrect_number(rs.getInt("correct_number"));
                t.setWrong_number(rs.getInt("wrong_number"));
                t.setTotal_question(rs.getInt("total_question"));
                t.setExam_history_date(rs.getTimestamp("exam_history_date"));

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

}
