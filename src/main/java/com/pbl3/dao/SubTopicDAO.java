package com.pbl3.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

import com.pbl3.dto.SubTopic;
import com.pbl3.util.DBUtil;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SubTopicDAO implements DAOInterface<SubTopic>{

    public int getNumberPage(int pageSize, int topicId, String keyword) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            // Truy vấn đếm tổng số bản ghi
            String countSql = "SELECT COUNT(*) as total FROM sub_topic "
                    + "WHERE (topic_id = ? OR ? = 0) AND "
                    + "(? IS NULL OR ? = '' OR sub_topic_name LIKE ?)";

            PreparedStatement countStmt = c.prepareStatement(countSql);
            countStmt.setInt(1, topicId);
            countStmt.setInt(2, topicId);
            countStmt.setString(3, keyword);
            countStmt.setString(4, keyword);
            countStmt.setString(5, keyword + "%");

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

    public Map<String, Object> getSubTopicByPage(int pageNumber, int pageSize, int topicId, String keyword) {
        Connection c = null;
        int offset = (pageNumber - 1) * pageSize;

        try {
            ArrayList<SubTopic> subTopics = new ArrayList<>();
            c = DBUtil.makeConnection();

            // Tính tổng số trang
            int totalPages = this.getNumberPage(pageSize,topicId, keyword);

            // Truy vấn lấy dữ liệu phân trang
            String sql = "SELECT * FROM sub_topic "
                    + "WHERE (topic_id = ? OR ? = 0) AND"
                    + "(? IS NULL OR ? = '' OR sub_topic_name LIKE ?) "
                    + "ORDER BY sub_topic_id "
                    + "LIMIT ? OFFSET ?;";

            PreparedStatement s = c.prepareStatement(sql);
            s.setInt(1, topicId);
            s.setInt(2, topicId);
            s.setString(3, keyword);
            s.setString(4, keyword);
            s.setString(5, keyword + "%");
            s.setInt(6, pageSize);
            s.setInt(7, offset);

            ResultSet rs = s.executeQuery();
            while (rs.next()) {
                SubTopic subTopic = new SubTopic();
                subTopic.setSub_topic_id(rs.getInt("sub_topic_id"));
                subTopic.setName(rs.getString("sub_topic_name"));
                subTopic.setTopic_id(rs.getInt("topic_id"));

                subTopics.add(subTopic);
            }

            rs.close();
            s.close();

            // Tạo Map kết quả chứa cả danh sách từ và thông tin phân trang
            Map<String, Object> result = new HashMap<>();
            result.put("subTopics", subTopics);
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
    public int insert(SubTopic t) {
        Connection c = null;
        try{
            c = DBUtil.makeConnection();
            String sql = "INSERT INTO sub_topic (sub_topic_name, topic_id) VALUES (?, ?)";
            PreparedStatement pstmt = c.prepareStatement(sql);
            pstmt.setString(1, t.getName());
            pstmt.setInt(2, t.getTopic_id());
            int result = pstmt.executeUpdate();
            pstmt.close();
            return result;
        }
        catch(SQLException e){
            e.printStackTrace();
        }
        finally{
            DBUtil.closeConnection(c);
        }
        return 0;
    }

    @Override
    public int update(SubTopic t) {
        Connection c = null;
        try{
            c = DBUtil.makeConnection();
            String sql = "UPDATE sub_topic SET sub_topic_name = ?, topic_id = ? WHERE sub_topic_id = ?";
            PreparedStatement pstmt = c.prepareStatement(sql);
            pstmt.setString(1, t.getName());
            pstmt.setInt(2, t.getTopic_id());
            pstmt.setInt(3, t.getSub_topic_id());
            int result = pstmt.executeUpdate();
            pstmt.close();
            return result;
        }
        catch(SQLException e){
            e.printStackTrace();
        }
        finally{
            DBUtil.closeConnection(c);
        }
        return 0;
    }

    @Override
    public int delete(int id) {
        Connection c = null;
        try{
            c = DBUtil.makeConnection();
            String sql;
            sql = "update post set sub_topic_id = 1 where sub_topic_id = ?";
            PreparedStatement pstmt = c.prepareStatement(sql);
            pstmt.setInt(1, id);
            int result = pstmt.executeUpdate();
            sql = "update exam set sub_topic_id = 1 where sub_topic_id = ?";
            pstmt = c.prepareStatement(sql);
            pstmt.setInt(1, id);
            result = pstmt.executeUpdate();
            sql = "DELETE FROM sub_topic WHERE sub_topic_id = ?";
            pstmt = c.prepareStatement(sql);
            pstmt.setInt(1, id);
            result = pstmt.executeUpdate();
            pstmt.close();
            return result;
        }
        catch(SQLException e){
            e.printStackTrace();
        } 
        finally{
            DBUtil.closeConnection(c);
        }
        return 0;
    }

    @Override
    public ArrayList<SubTopic> selectAll() {
        Connection c = null;
        try{
            c = DBUtil.makeConnection();
            String sql = "SELECT * FROM sub_topic";
            PreparedStatement pstmt = c.prepareStatement(sql);
            ResultSet rs = pstmt.executeQuery();
            ArrayList<SubTopic> subTopics = new ArrayList<>();
            while(rs.next()){
                SubTopic subTopic = new SubTopic();
                subTopic.setSub_topic_id(rs.getInt("sub_topic_id"));
                subTopic.setName(rs.getString("sub_topic_name"));
                subTopic.setTopic_id(rs.getInt("topic_id"));
                subTopics.add(subTopic);
            }
            pstmt.close();
            return subTopics;
        }
        catch(SQLException e){
            e.printStackTrace();
        }
        finally{
            DBUtil.closeConnection(c);
        }
        return null;
    }

    @Override
    public SubTopic selectByID(int id) {
        Connection c = null;
        try{
            c = DBUtil.makeConnection();
            String sql = "SELECT * FROM sub_topic WHERE sub_topic_id = ?";
            PreparedStatement pstmt = c.prepareStatement(sql);
            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();
            if(rs.next()){
                SubTopic subTopic = new SubTopic();
                subTopic.setSub_topic_id(rs.getInt("sub_topic_id"));
                subTopic.setName(rs.getString("sub_topic_name"));
                subTopic.setTopic_id(rs.getInt("topic_id"));
                return subTopic;
            }
        }
        catch(SQLException e){
                e.printStackTrace();
            }
        return null;
}

    @Override
    public SubTopic selectByCondition(String condition) {
        return null;
    }

    public ArrayList<SubTopic> selectByTopicId(int topicId) {
        Connection c = null;
        try{
            c = DBUtil.makeConnection();
            String sql = "SELECT * FROM sub_topic WHERE topic_id = ?";
            PreparedStatement pstmt = c.prepareStatement(sql);
            pstmt.setInt(1, topicId);
            ResultSet rs = pstmt.executeQuery();
            ArrayList<SubTopic> subTopics = new ArrayList<>();
            while(rs.next()){
                SubTopic subTopic = new SubTopic();
                subTopic.setSub_topic_id(rs.getInt("sub_topic_id"));
                subTopic.setName(rs.getString("sub_topic_name"));
                subTopic.setTopic_id(rs.getInt("topic_id"));
                subTopics.add(subTopic);
            }
            pstmt.close();
            return subTopics;
        }
        catch(SQLException e){
            e.printStackTrace();
        }
        finally{
            DBUtil.closeConnection(c);
        }
        return null;
    }
}
