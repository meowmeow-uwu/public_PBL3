package com.pbl3.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;

import com.pbl3.dto.Question;
import com.pbl3.util.DBUtil;

public class QuestionDAO implements  DAOInterface<Question>{

    @Override
    public int insert(Question t) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "INSERT INTO question (content, question_type_id) VALUES (?, ?)";
            PreparedStatement s = c.prepareStatement(query);
            s.setString(1, t.getContent());
            s.setInt(2, t.getQuestion_type_id());
            int result = s.executeUpdate();
            s.close();
            return result;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }

    @Override
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

    @Override
    public int delete(int id) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            int result = Integer.MAX_VALUE;
            String query = "DELETE FROM answer WHERE question_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, id);
            int temp = 0;
            result = result >= (temp =s.executeUpdate()) ? temp : result;
            query = "DELETE FROM exam_has_question WHERE question_id = ?";
            s = c.prepareStatement(query);
            s.setInt(1, id);
            result = result >= (temp =s.executeUpdate()) ? temp : result;
            query = "DELETE FROM question WHERE question_id = ?";
            s = c.prepareStatement(query);
            s.setInt(1, id);
            result = result >= (temp =s.executeUpdate()) ? temp : result;
            s.close();
            return result;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return 0;
    }

    @Override
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

    @Override
    public Question selectByID(int id) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM question WHERE id = ?";
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

    @Override
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
