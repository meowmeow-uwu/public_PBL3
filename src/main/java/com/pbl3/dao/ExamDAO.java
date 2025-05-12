package com.pbl3.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import com.pbl3.dto.Exam;
import com.pbl3.util.DBUtil;

public class ExamDAO implements DAOInterface<Exam> {

    @Override
    public Exam selectByID(int id) {
        Connection c= null;
        try {
            c= DBUtil.makeConnection();
            PreparedStatement ps= c.prepareStatement("SELECT * FROM exam WHERE exam_id=?");
            ps.setInt(1, id);
            ResultSet rs= ps.executeQuery();
            if (rs.next()) {
                Exam exam= new Exam();
                exam.setExam_id(rs.getInt("exam_id"));
                exam.setName(rs.getString("name"));
                exam.setSub_topic_id(rs.getInt("sub_topic_id"));
                exam.set_deleted(rs.getBoolean("is_deleted"));
                ps.close();
                rs.close();
                return exam;
            }
            } catch (Exception e) {
                e.printStackTrace();
            } finally {
                DBUtil.closeConnection(c);
            }
            return null;
    }

    @Override
    public ArrayList<Exam> selectAll() {
        Connection c= null;
        try {
            c= DBUtil.makeConnection();
            PreparedStatement ps= c.prepareStatement("SELECT * FROM exam");
            ResultSet rs= ps.executeQuery();
            ArrayList<Exam> exams= new ArrayList<>();
            while (rs.next()) {
                Exam exam= new Exam();
                exam.setExam_id(rs.getInt("exam_id"));
                exam.setName(rs.getString("name"));
                exam.setSub_topic_id(rs.getInt("sub_topic_id"));
                exam.set_deleted(rs.getBoolean("is_deleted"));
                exams.add(exam);
            }
            ps.close();
            rs.close();
            return exams;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
    }

    @Override
    public int insert(Exam exam) {
        Connection c= null;
        try {
            c= DBUtil.makeConnection();
            PreparedStatement ps= c.prepareStatement("INSERT INTO exam (name, sub_topic_id, is_deleted) VALUES (?, ?, ?)");
            ps.setString(2, exam.getName());
            ps.setInt(3, exam.getSub_topic_id());
            ps.setBoolean(4, exam.is_deleted());
            int result= ps.executeUpdate();
            ps.close();
            return result;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return 0;
    }

    @Override
    public int update(Exam exam) {
        Connection c= null;
        try {
            c= DBUtil.makeConnection();
            PreparedStatement ps= c.prepareStatement("UPDATE exam SET name=?, sub_topic_id=?, is_deleted=? WHERE exam_id=?");
            ps.setString(1, exam.getName());
            ps.setInt(2, exam.getSub_topic_id());
            ps.setBoolean(3, exam.is_deleted());
            ps.setInt(4, exam.getExam_id());
            int result= ps.executeUpdate();
            ps.close();
            return result;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return 0;
    }

    @Override
    public int delete(int id) {
        return 0;
    }
    
    @Override
    public Exam selectByCondition(String condition) {
        return null;
    }
}