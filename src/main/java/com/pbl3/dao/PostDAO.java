package com.pbl3.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

import com.pbl3.dto.Post;
import com.pbl3.util.DBUtil;
import java.util.HashMap;
import java.util.Map;

public class PostDAO implements DAOInterface<Post>{
public int getNumberPage(int pageSize, int SubTopicId, String keyword) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            // Truy vấn đếm tổng số bản ghi
            String countSql = "SELECT COUNT(*) as total FROM post "
                    + "WHERE sub_topic_id = ? AND "
                    + "(? IS NULL OR ? = '' OR post_name LIKE ?)";

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

    public Map<String, Object> getPostByPage(int pageNumber, int pageSize, int subTopicId, String keyword) {
        Connection c = null;
        int offset = (pageNumber - 1) * pageSize;

        try {
            ArrayList<Post> posts = new ArrayList<>();
            c = DBUtil.makeConnection();

            // Tính tổng số trang
            int totalPages = this.getNumberPage(pageSize,subTopicId, keyword);

            // Truy vấn lấy dữ liệu phân trang
            String sql = "SELECT * FROM post "
                    + "WHERE post_id = ? AND"
                    + "(? IS NULL OR ? = '' OR post_name LIKE ?) "
                    + "ORDER BY post_id "
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
                Post post = new Post();
                post.setSub_topic_id(rs.getInt("sub_topic_id"));
                post.setPost_name(rs.getString("post_name"));
                post.setPost_id(rs.getInt("post_id"));

                posts.add(post);
            }

            rs.close();
            s.close();

            // Tạo Map kết quả chứa cả danh sách từ và thông tin phân trang
            Map<String, Object> result = new HashMap<>();
            result.put("posts", posts);
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
    public int insert(Post t) {
        Connection c = null;
        try{
            c = DBUtil.makeConnection();
            String sql = "INSERT INTO post (post_name, content, sub_topic_id, is_deleted) VALUES (?, ?, ?, ?)";
            PreparedStatement pstmt = c.prepareStatement(sql);
            pstmt.setString(1, t.getPost_name());
            pstmt.setString(2, t.getContent());
            pstmt.setInt(3, t.getSub_topic_id());
            pstmt.setBoolean(4, t.is_deleted());
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
    public int update(Post t) {
        Connection c = null;
        try{
            c = DBUtil.makeConnection();
            String sql = "UPDATE post SET post_name = ?, content = ?, sub_topic_id = ?, is_deleted = ? WHERE post_id = ? AND is_deleted = 0";
            PreparedStatement pstmt = c.prepareStatement(sql);
            pstmt.setString(1, t.getPost_name());
            pstmt.setString(2, t.getContent());
            pstmt.setInt(3, t.getSub_topic_id());
            pstmt.setBoolean(4, t.is_deleted());
            pstmt.setInt(5, t.getPost_id());
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
        return 0;
    }

    @Override
    public ArrayList<Post> selectAll() {
        Connection c = null;
        try{
            c = DBUtil.makeConnection();
            String sql = "SELECT * FROM post WHERE is_deleted = 0";
            PreparedStatement pstmt = c.prepareStatement(sql);
            ResultSet rs = pstmt.executeQuery();
            ArrayList<Post> posts = new ArrayList<>();
            while(rs.next()){
                Post post = new Post();
                post.setPost_id(rs.getInt("post_id"));
                post.setPost_name(rs.getString("post_name"));
                post.setContent(rs.getString("content"));
                post.setSub_topic_id(rs.getInt("sub_topic_id"));
                post.set_deleted(rs.getBoolean("is_deleted"));
                posts.add(post);
            }
            pstmt.close();
            return posts;
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
    public Post selectByID(int id) {
        Connection c = null;
        try{
            c = DBUtil.makeConnection();
            String sql = "SELECT * FROM post WHERE post_id = ?";
            PreparedStatement pstmt = c.prepareStatement(sql);
            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();
            if(rs.next()){
                Post post = new Post();
                post.setPost_id(rs.getInt("post_id"));
                post.setPost_name(rs.getString("post_name"));
                post.setContent(rs.getString("content"));
                post.setSub_topic_id(rs.getInt("sub_topic_id"));
                post.set_deleted(rs.getBoolean("is_deleted"));
                return post;
            }
        }
        catch(SQLException e){
                e.printStackTrace();
            }
        return null;
}

    @Override
    public Post selectByCondition(String condition) {
        return null;
    }

    public ArrayList<Post> selectBySubTopicId(int subTopicId) {
        Connection con = null;
        ArrayList<Post> posts = new ArrayList<>();
        String sql = "SELECT * FROM post WHERE sub_topic_id = ? AND is_deleted = 0";
        
        try {
            con = DBUtil.makeConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, subTopicId);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                Post post = new Post();
                post.setPost_id(rs.getInt("post_id"));
                post.setPost_name(rs.getString("post_name"));
                post.setContent(rs.getString("content"));
                post.setSub_topic_id(rs.getInt("sub_topic_id"));
                post.set_deleted(rs.getBoolean("is_deleted"));
                posts.add(post);
            }
            ps.close();
            rs.close();
            return posts;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        finally{
            DBUtil.closeConnection(con);
        }        

        return null;
    }
        public int getNumberPost() {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            // Truy vấn đếm tổng số bản ghi
            String countSql = "SELECT COUNT(*) as total FROM post "
                    + "WHERE is_deleted = 0";

            PreparedStatement countStmt = c.prepareStatement(countSql);
            ResultSet countRs = countStmt.executeQuery();
            int total = 0;
            if (countRs.next()) {
                total = countRs.getInt("total");
            }
            countRs.close();
            countStmt.close();

            return total;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return 0;
    }
}