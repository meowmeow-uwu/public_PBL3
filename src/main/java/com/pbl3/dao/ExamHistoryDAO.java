package com.pbl3.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

import com.pbl3.dto.ExamHistory;
import com.pbl3.util.DBUtil;

public class ExamHistoryDAO{

    public int insert(ExamHistory t) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String sql = "INSERT INTO exam_history (user_id, exam_id, correct_number, wrong_number, total_question) VALUES (?, ?, ?, ?, ?)";
            PreparedStatement pstmt = c.prepareStatement(sql);
            pstmt.setInt(1, t.getUser_id());
            pstmt.setInt(2, t.getExam_id());
            pstmt.setInt(3, t.getCorrect_number());
            pstmt.setInt(4, t.getWrong_number());
            pstmt.setInt(5, t.getTotal_question());
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
            String sql = "UPDATE exam_history SET user_id = ?, exam_id = ?, correct_number = ?, wrong_number = ?, total_question = ? WHERE exam_history_id = ?";
            PreparedStatement pstmt = c.prepareStatement(sql);
            pstmt.setInt(1, t.getUser_id());
            pstmt.setInt(2, t.getExam_id());
            pstmt.setInt(3, t.getCorrect_number());
            pstmt.setInt(4, t.getWrong_number());
            pstmt.setInt(5, t.getTotal_question());
            pstmt.setInt(6, t.getExam_history_id());
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
        return null;
}
    
}
