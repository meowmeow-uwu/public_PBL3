package com.pbl3.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

import com.pbl3.dto.Post;
import com.pbl3.util.DBUtil;

public class PostDAO implements DAOInterface<Post>{

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
            String sql = "UPDATE post SET post_name = ?, content = ?, sub_topic_id = ?, is_deleted = ? WHERE post_id = ?";
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
            String sql = "SELECT * FROM post";
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
}