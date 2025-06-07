package com.pbl3.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

import com.pbl3.dto.Topic;
import com.pbl3.util.DBUtil;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TopicDAO implements DAOInterface<Topic>{

        public int getNumberPage(int pageSize, String keyword) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            // Truy vấn đếm tổng số bản ghi
            String countSql = "SELECT COUNT(*) as total FROM topic "
                    + "WHERE "
                    + "(? IS NULL OR ? = '' OR topic_name LIKE ?)";

            PreparedStatement countStmt = c.prepareStatement(countSql);
            countStmt.setString(1, keyword);
            countStmt.setString(2, keyword);
            countStmt.setString(3, keyword + "%");

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

    public Map<String, Object> getTopicByPage(int pageNumber, int pageSize, String keyword) {
        Connection c = null;
        int offset = (pageNumber - 1) * pageSize;

        try {
            ArrayList<Topic> topics = new ArrayList<>();
            c = DBUtil.makeConnection();

            // Tính tổng số trang
            int totalPages = this.getNumberPage(pageSize, keyword);

            // Truy vấn lấy dữ liệu phân trang
            String sql = "SELECT * FROM topic "
                    + "WHERE "
                    + "(? IS NULL OR ? = '' OR topic_name LIKE ?) "
                    + "ORDER BY topic_id "
                    + "LIMIT ? OFFSET ?;";

            PreparedStatement s = c.prepareStatement(sql);
            s.setString(1, keyword);
            s.setString(2, keyword);
            s.setString(3, keyword + "%");
            s.setInt(4, pageSize);
            s.setInt(5, offset);

            ResultSet rs = s.executeQuery();
            while (rs.next()) {
                Topic topic = new Topic();
                topic.setTopic_id(rs.getInt("topic_id"));
                topic.setName(rs.getString("topic_name"));

                topics.add(topic);
            }

            rs.close();
            s.close();

            // Tạo Map kết quả chứa cả danh sách từ và thông tin phân trang
            Map<String, Object> result = new HashMap<>();
            result.put("topics", topics);
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
    public int insert(Topic t) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String sql = "INSERT INTO topic (topic_name) VALUES (?)";
            PreparedStatement pstmt = c.prepareStatement(sql);
            pstmt.setString(1, t.getName());
            int result = pstmt.executeUpdate();
            return result;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return 0;
}

    @Override
    public int update(Topic t) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String sql = "UPDATE topic SET topic_name = ? WHERE topic_id = ?";
            PreparedStatement pstmt = c.prepareStatement(sql);
            pstmt.setString(1, t.getName());
            pstmt.setInt(2, t.getTopic_id());
            int result = pstmt.executeUpdate();
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
            String sql;
            sql = "update sub_topic set topic_id = 1 where topic_id = ?";
            PreparedStatement pstmt = c.prepareStatement(sql);
            pstmt.setInt(1, id);
            int result = pstmt.executeUpdate();
            sql = "DELETE FROM topic WHERE topic_id = ?";
            pstmt = c.prepareStatement(sql);
            pstmt.setInt(1, id);
            result = pstmt.executeUpdate();
            return result;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return 0;
}

    @Override
    public ArrayList<Topic> selectAll() {
        Connection c = null;
        ArrayList<Topic> topics = new ArrayList<>();
        try {
            c = DBUtil.makeConnection();
            String sql = "SELECT * FROM topic";
            PreparedStatement pstmt = c.prepareStatement(sql);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                Topic t = new Topic();
                t.setTopic_id(rs.getInt("topic_id"));
                t.setName(rs.getString("topic_name"));
                topics.add(t);
            }
            return topics;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
}

    @Override
    public Topic selectByID(int id) {
        Connection c = null;
        Topic t = null;
        try {
            c = DBUtil.makeConnection();
            String sql = "SELECT * FROM topic WHERE topic_id = ?";
            PreparedStatement pstmt = c.prepareStatement(sql);
            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                t = new Topic();
                t.setTopic_id(rs.getInt("topic_id"));
                t.setName(rs.getString("topic_name"));
            }
            return t;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
}

    @Override
    public Topic selectByCondition(String condition) {
        return null;
}
    
}
