package com.pbl3.service;

import java.util.ArrayList;

import com.pbl3.dao.SubTopicDAO;
import com.pbl3.dto.SubTopic;
import java.util.Map;

public class SubTopicService implements ServiceInterface<SubTopic>{
    private SubTopicDAO subTopicDAO;

    public SubTopicService(){
        subTopicDAO = new SubTopicDAO();
    }
    public Map<String, Object> getSubTopicByPage(int pageNumber, int pageSize,int topicId , String keyword) {
        return subTopicDAO.getSubTopicByPage(pageNumber, pageSize, topicId,  keyword);
    }
    @Override
    public int insert(SubTopic t) {
        return subTopicDAO.insert(t);
    }

    @Override
    public int update(SubTopic t) {
        return subTopicDAO.update(t);
    } 

    @Override
    public int delete(int id) {
        if(id == 1) {
            return -1;
        }
        return subTopicDAO.delete(id);
    } 

    @Override
    public ArrayList<SubTopic> selectAll() {
        return subTopicDAO.selectAll();
    }   

    @Override
    public SubTopic selectByID(int id) {
        return subTopicDAO.selectByID(id);
    }   

    @Override
    public SubTopic selectByCondition(String condition) {
        return subTopicDAO.selectByCondition(condition);
    }   
    
    public ArrayList<SubTopic> selectByTopicId(int topicId) {
        return subTopicDAO.selectByTopicId(topicId);
    }   
    
    
    
}