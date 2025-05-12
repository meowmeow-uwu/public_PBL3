package com.pbl3.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;

import com.pbl3.dto.Answer;
import com.pbl3.util.DBUtil;

public class ReadingAnswerDAO implements DAOInterface<Answer> {

    @Override
    public int insert(Answer t) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "INSERT INTO reading_answer (content, is_correct, reading_question_id) VALUES (?, ?, ?)";
            PreparedStatement s = c.prepareStatement(query);
            s.setString(1, t.getContent());
            s.setBoolean(2, t.isCorrect());
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
    public int update(Answer t) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "UPDATE reading_answer SET content = ?, is_correct = ?, reading_question_id = ? WHERE reading_answer_id = ?";
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
            String query = "DELETE FROM reading_answer WHERE reading_answer_id = ?";
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
            String query = "SELECT * FROM reading_answer";
            Statement s = c.createStatement();
            ResultSet rs = s.executeQuery(query);
            ArrayList<Answer> Answers = new ArrayList<>();
            while (rs.next()) {
                Answers.add(new Answer(rs.getInt("reading_answer_id"), rs.getInt("reading_question_id"), rs.getString("content"), rs.getBoolean("is_correct")));
            }
            s.close();
            rs.close();
            return Answers;
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
            String query = "SELECT * FROM reading_answer WHERE reading_answer_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, id);
            ResultSet rs = s.executeQuery();
            Answer ra = null;
            if (rs.next()) {
                ra = new Answer(rs.getInt("reading_answer_id"), rs.getInt("reading_question_id"), rs.getString("content"), rs.getBoolean("is_correct"));
            }
            s.close();
            rs.close();
            return ra;
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
            String query = "SELECT * FROM reading_answer WHERE reading_question_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, id);
            ResultSet rs = s.executeQuery();
            ArrayList<Answer> Answers = new ArrayList<>();
            while (rs.next()) {
                Answers.add(new Answer(rs.getInt("reading_answer_id"), rs.getInt("reading_question_id"), rs.getString("content"), rs.getBoolean("is_correct")));
            }
            s.close();
            rs.close();
            return Answers;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
    }
}
