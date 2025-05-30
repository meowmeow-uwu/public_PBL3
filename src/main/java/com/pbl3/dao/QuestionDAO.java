package com.pbl3.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;

import com.pbl3.dto.Question;
import com.pbl3.util.DBUtil;

public class QuestionDAO{

public int insert(Question t, int id) {
    Connection c = null;
    try {
        c = DBUtil.makeConnection();
        String query = "INSERT INTO question (content, question_type_id) VALUES (?, ?)";
        PreparedStatement s = c.prepareStatement(query, Statement.RETURN_GENERATED_KEYS); // Thêm RETURN_GENERATED_KEYS

        s.setString(1, t.getContent());
        s.setInt(2, t.getQuestion_type_id());

        int result = s.executeUpdate();
        int key = -1; // Để kiểm tra nếu không lấy được key

        if (result > 0) {
            ResultSet rs = s.getGeneratedKeys();
            if (rs.next()) {
                key = rs.getInt(1); // Lấy khóa chính vừa được tạo
            }
            rs.close(); // Đóng ResultSet để tránh lỗi leak connection
        }

        if (key == -1) {
            throw new SQLException("Failed to retrieve generated key.");
        }

        query = "INSERT INTO exam_has_question (question_id, exam_id) VALUES (?, ?)";
        PreparedStatement s2 = c.prepareStatement(query);
        s2.setInt(1, key);
        s2.setInt(2, id);
        result = s2.executeUpdate();
        
        s.close();
        s2.close();
        c.close();
        return result;
    } catch (SQLException e) {
        e.printStackTrace();
    } finally {
        try {
            if (c != null) c.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
    return 0;
}


    public int update(Question t) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "UPDATE question SET content = ?, question_type_id = ? WHERE question_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setString(1, t.getContent());
            s.setInt(2, t.getQuestion_type_id());
            s.setInt(3, t.getQuestion_id());
            int result = s.executeUpdate();
            s.close();
            return result;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return 0;
    }

    public int delete(int id) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            int result = Integer.MAX_VALUE;
            String query = "DELETE FROM answer WHERE question_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, id);
            result = s.executeUpdate();
            query = "DELETE FROM exam_has_question WHERE question_id = ?";
            s = c.prepareStatement(query);
            s.setInt(1, id);
            result = s.executeUpdate();
            query = "DELETE FROM question WHERE question_id = ?";
            s = c.prepareStatement(query);
            s.setInt(1, id);
            result = s.executeUpdate();
            s.close();
            return result;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return 0;
    }

    public ArrayList<Question> selectAll() {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM question";
            Statement s = c.createStatement();
            ResultSet rs = s.executeQuery(query);
            ArrayList<Question> questions = new ArrayList<>();
            while (rs.next()) {
                questions.add(new Question(rs.getInt("question_id"), rs.getString("content"), rs.getInt("question_type_id")));
            }
            s.close();
            rs.close();
            return questions;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
 }

    public Question selectByID(int id) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM question WHERE question_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, id);
            ResultSet rs = s.executeQuery();
            Question q = null;
            if (rs.next()) {
                q =  new Question(rs.getInt("question_id"), rs.getString("content"), rs.getInt("question_type_id"));
            }
            s.close();
            rs.close();
            return q;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
    }

    public Question selectByCondition(String condition) {
        return null;
    }
    
    public ArrayList<Question> selectByExamID(int id) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "SELECT q.* FROM question q INNER JOIN exam_has_question ehq ON q.question_id = ehq.question_id WHERE ehq.exam_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, id);
            ResultSet rs = s.executeQuery();
            ArrayList<Question> questions = new ArrayList<>();
            while (rs.next()) {
                questions.add(new Question(rs.getInt("question_id"), rs.getString("content"), rs.getInt("question_type_id")));
            }
            s.close();
            rs.close();
            return questions;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
    }

}
