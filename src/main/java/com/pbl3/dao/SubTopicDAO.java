package com.pbl3.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

import com.pbl3.dto.SubTopic;
import com.pbl3.util.DBUtil;

public class SubTopicDAO implements DAOInterface<SubTopic>{

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
            sql = "DELETE FROM sub_topic WHERE sub_topic_id = ?";
            pstmt = c.prepareStatement(sql);
            pstmt.setInt(1, id);
            result = Math.min(result, pstmt.executeUpdate());
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