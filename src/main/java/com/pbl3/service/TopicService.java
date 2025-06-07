package com.pbl3.service;

import java.util.ArrayList;

import com.pbl3.dao.TopicDAO;
import com.pbl3.dto.Topic;
import java.util.Map;

public class TopicService implements ServiceInterface<Topic>{
    private TopicDAO topicDAO;

    public TopicService() {
        topicDAO = new TopicDAO();
    }
    public Map<String, Object> getTopicByPage(int pageNumber, int pageSize, String keyword) {
        return topicDAO.getTopicByPage(pageNumber, pageSize,  keyword);
    }
    @Override
    public int insert(Topic t) {
        return topicDAO.insert(t);
    }

    @Override
    public int update(Topic t) {
        return topicDAO.update(t);
    }

    @Override
    public int delete(int id) {
        if(id == 1) {
            return -1;
        }
        return topicDAO.delete(id);
    }

    @Override
    public ArrayList<Topic> selectAll() {
        return topicDAO.selectAll();
    }

    @Override
    public Topic selectByID(int id) {
        return topicDAO.selectByID(id);
    }

    @Override
    public Topic selectByCondition(String condition) {
        return topicDAO.selectByCondition(condition);
    }
}