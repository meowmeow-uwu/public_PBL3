/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.dao;

import com.pbl3.dto.QuestionType;
import com.pbl3.util.DBUtil;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

/**
 *
 * @author
 */
public class QuestionTypeDAO implements DAOInterface<QuestionType> {

    @Override
    public int insert(QuestionType t) {

        return 0;
    }

    @Override
    public int update(QuestionType t) {
       
        return 0;
    }

    @Override
    public ArrayList<QuestionType> selectAll() {
        Connection c = null;
        try {
            ArrayList<QuestionType> listQuestionType = new ArrayList<>();
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM question_type";
            PreparedStatement s = c.prepareStatement(query);
            ResultSet rs = s.executeQuery();
            while (rs.next()) {
                listQuestionType.add(new QuestionType(
                        rs.getInt("question_type_id"),
                        rs.getString("question_type_name")
                ));
            }
            rs.close();
            s.close();
            return listQuestionType;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
    }

    @Override
    public QuestionType selectByID(int id) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM question_type WHERE question_type_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, id);
            ResultSet rs = s.executeQuery();
            if (rs.next()) {
                return new QuestionType(
                        rs.getInt("question_type_id"),
                        rs.getString("question_type_name")
                );
            }
            rs.close();
            s.close();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
    }

    @Override
    public QuestionType selectByCondition(String condition) {
        return null;
    }

    @Override
    public int delete(int id) {
        return 0;

    }

}
