package com.pbl3.service;

import java.util.ArrayList;

import com.pbl3.dao.PostDAO;
import com.pbl3.dto.Post;
import java.util.Map;

public class PostService implements ServiceInterface<Post> {

    private PostDAO postDAO;

    public PostService() {
        postDAO = new PostDAO();
    }

    public Map<String, Object> getPostByPage(int pageNumber, int pageSize, int subTopicId, String keyword) {
        return postDAO.getPostByPage(pageNumber, pageSize, subTopicId, keyword);
    }

    @Override
    public int insert(Post t) {
        return postDAO.insert(t);
    }

    @Override
    public int update(Post t) {
        return postDAO.update(t);
    }

    @Override
    public int delete(int id) {
        return postDAO.delete(id);
    }

    @Override
    public ArrayList<Post> selectAll() {
        return postDAO.selectAll();
    }

    @Override
    public Post selectByID(int id) {
        return postDAO.selectByID(id);
    }

    @Override
    public Post selectByCondition(String condition) {
        return postDAO.selectByCondition(condition);
    }

    public ArrayList<Post> getPostsBySubTopicId(int subTopicId) {
        return postDAO.selectBySubTopicId(subTopicId);
    }

    public int getNumberPost() {
        return postDAO.getNumberPost();
    }
}
