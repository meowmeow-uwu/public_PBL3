package com.pbl3.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

import com.pbl3.dto.Exam;
import com.pbl3.util.DBUtil;
import java.util.HashMap;
import java.util.Map;

public class ExamDAO implements DAOInterface<Exam> {
    
public int getNumberPage(int pageSize, int SubTopicId, String keyword) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            // Truy vấn đếm tổng số bản ghi
            String countSql = "SELECT COUNT(*) as total FROM exam "
                    + "WHERE is_deleted = 0 AND sub_topic_id = ? AND "
                    + "(? IS NULL OR ? = '' OR name LIKE ?)";

            PreparedStatement countStmt = c.prepareStatement(countSql);
            countStmt.setInt(1, SubTopicId);
            countStmt.setString(2, keyword);
            countStmt.setString(3, keyword);
            countStmt.setString(4, keyword + "%");

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

    public Map<String, Object> getExamByPage(int pageNumber, int pageSize, int subTopicId, String keyword) {
        Connection c = null;
        int offset = (pageNumber - 1) * pageSize;

        try {
            ArrayList<Exam> exams = new ArrayList<>();
            c = DBUtil.makeConnection();

            // Tính tổng số trang
            int totalPages = this.getNumberPage(pageSize,subTopicId, keyword);

            // Truy vấn lấy dữ liệu phân trang
            String sql = "SELECT * FROM exam "
                    + "WHERE is_deleted = 0 AND sub_topic_id = ? AND"
                    + "(? IS NULL OR ? = '' OR name LIKE ?) "
                    + "ORDER BY exam_id "
                    + "LIMIT ? OFFSET ?;";

            PreparedStatement s = c.prepareStatement(sql);
            s.setInt(1, subTopicId);
            s.setString(2, keyword);
            s.setString(3, keyword);
            s.setString(4, keyword + "%");
            s.setInt(5, pageSize);
            s.setInt(6, offset);

            ResultSet rs = s.executeQuery();
            while (rs.next()) {
                Exam exam = new Exam();
                exam.setSub_topic_id(rs.getInt("sub_topic_id"));
                exam.setName(rs.getString("name"));
                exam.setExam_id(rs.getInt("exam_id"));

                exams.add(exam);
            }

            rs.close();
            s.close();

            // Tạo Map kết quả chứa cả danh sách từ và thông tin phân trang
            Map<String, Object> result = new HashMap<>();
            result.put("exams", exams);
            result.put("totalPages", totalPages);

            return result;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }

        return new HashMap<>();
    }
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
            PreparedStatement ps= c.prepareStatement("SELECT * FROM exam WHERE is_deleted = 0");
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
            ps.setString(1, exam.getName());
            ps.setInt(2, exam.getSub_topic_id());
            ps.setBoolean(3, exam.is_deleted());
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
            PreparedStatement ps= c.prepareStatement("UPDATE exam SET name=?, sub_topic_id=?, is_deleted=? WHERE exam_id=? AND is_deleted = 0");
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

    public ArrayList<Exam> selectBySubTopicId(int subTopicId) {
        Connection con = null;
        ArrayList<Exam> exams = new ArrayList<>();
        String sql = "SELECT * FROM exam WHERE sub_topic_id = ? AND is_deleted = 0";
        
        try {
            con = DBUtil.makeConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, subTopicId);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                Exam exam = new Exam();
                exam.setExam_id(rs.getInt("exam_id"));
                exam.setName(rs.getString("name"));
                exam.setSub_topic_id(rs.getInt("sub_topic_id"));
                exam.set_deleted(rs.getBoolean("is_deleted"));
                exams.add(exam);
            }
            ps.close();
            rs.close();
            return exams;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(con);
        }
        
        return exams;
    }
}