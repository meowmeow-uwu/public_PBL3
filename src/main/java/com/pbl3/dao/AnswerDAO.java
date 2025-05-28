package com.pbl3.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;

import com.pbl3.dto.Answer;
import com.pbl3.util.DBUtil;

public class AnswerDAO implements DAOInterface<Answer>{

    @Override
    public int insert(Answer t) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "INSERT INTO answer (content, is_correct, question_id) VALUES (?, ?, ?)";
            PreparedStatement s = c.prepareStatement(query);
            s.setString(1, t.getContent());
            s.setBoolean(2, t.isCorrect());
            s.setInt(3, t.getQuestion_id());
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
    public int update(Answer t) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "UPDATE answer SET content = ?, is_correct = ?, question_id = ? WHERE answer_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setString(1, t.getContent());
            s.setBoolean(2, t.isCorrect());
            s.setInt(3, t.getQuestion_id());
            s.setInt(4, t.getAnswer_id());
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
            String query = "DELETE FROM answer WHERE answer_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, id);
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
    public ArrayList<Answer> selectAll() {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM answer";
            Statement s = c.createStatement();
            ResultSet rs = s.executeQuery(query);
            ArrayList<Answer> answers = new ArrayList<>();
            while (rs.next()) {
                answers.add(new Answer(rs.getInt("answer_id"), rs.getInt("question_id"), rs.getString("content"), rs.getBoolean("is_correct")));
            }
            s.close();
            rs.close();
            return answers;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
    }

    @Override
    public Answer selectByID(int id) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM answer WHERE answer_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, id);
            ResultSet rs = s.executeQuery();
            Answer a = null;
            if (rs.next()) {
                a = new Answer(rs.getInt("answer_id"), rs.getInt("question_id"), rs.getString("content"), rs.getBoolean("is_correct"));
            }
            s.close();
            rs.close();
            return a;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
    }

    @Override
    public Answer selectByCondition(String condition) {
        return null;
    }
    
    public ArrayList<Answer> selectByQuestionID(int id) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM answer WHERE question_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, id);
            ResultSet rs = s.executeQuery();
            ArrayList<Answer> answers = new ArrayList<>();
            while (rs.next()) {
                answers.add(new Answer(rs.getInt("answer_id"), rs.getInt("question_id"), rs.getString("content"), rs.getBoolean("is_correct")));
            }
            s.close();
            rs.close();
            return answers;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
    }
}