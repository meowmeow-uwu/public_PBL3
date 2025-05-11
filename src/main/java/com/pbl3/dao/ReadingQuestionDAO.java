package com.pbl3.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;

import com.pbl3.dto.ReadingQuestion;
import com.pbl3.util.DBUtil;

public class ReadingQuestionDAO implements DAOInterface<ReadingQuestion> {

    @Override
    public int insert(ReadingQuestion t) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "INSERT INTO reading_question (reading_id, question_type_id, content) VALUES (?, ?, ?)";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, t.getReading_id());
            s.setInt(2, t.getQuestion_type_id());
            s.setString(3, t.getContent());
            int result = s.executeUpdate();
            s.close();
            return result;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }

    @Override
    public int update(ReadingQuestion t) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "UPDATE reading_question SET reading_id = ?, question_type_id = ?, content = ? WHERE reading_question_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, t.getReading_id());
            s.setInt(2, t.getQuestion_type_id());
            s.setString(3, t.getContent());
            s.setInt(4, t.getReading_question_id());
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
            String query = "DELETE FROM reading_answer WHERE reading_question_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, id);
            int temp = 0;
            result = result >= (temp = s.executeUpdate()) ? temp : result;
            query = "DELETE FROM reading_question WHERE reading_question_id = ?";
            s = c.prepareStatement(query);
            s.setInt(1, id);
            result = result >= (temp = s.executeUpdate()) ? temp : result;
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
    public ArrayList<ReadingQuestion> selectAll() {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM reading_question";
            Statement s = c.createStatement();
            ResultSet rs = s.executeQuery(query);
            ArrayList<ReadingQuestion> readingQuestions = new ArrayList<>();
            while (rs.next()) {
                readingQuestions.add(new ReadingQuestion(rs.getInt("reading_question_id"), rs.getInt("reading_id"), rs.getInt("question_type_id"), rs.getString("content")));
            }
            s.close();
            rs.close();
            return readingQuestions;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
    }

    @Override
    public ReadingQuestion selectByID(int id) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM reading_question WHERE reading_question_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, id);
            ResultSet rs = s.executeQuery();
            ReadingQuestion rq = null;
            if (rs.next()) {
                rq = new ReadingQuestion(rs.getInt("reading_question_id"), rs.getInt("reading_id"), rs.getInt("question_type_id"), rs.getString("content"));
            }
            s.close();
            rs.close();
            return rq;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
    }

    @Override
    public ReadingQuestion selectByCondition(String condition) {
        return null;
    }
}
