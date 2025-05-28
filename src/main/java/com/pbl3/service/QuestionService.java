package com.pbl3.service;

import java.util.ArrayList;

import com.pbl3.dao.QuestionDAO;
import com.pbl3.dto.Question;

public class QuestionService{
    private QuestionDAO questionDAO;

    public QuestionService() {
        questionDAO = new QuestionDAO();
    }

    public int insert(Question t, int id) {
        return questionDAO.insert(t, id);
 }

    public int update(Question t) {
        return questionDAO.update(t);
 }

    public int delete(int t) {
        return questionDAO.delete(t);
 }

    public ArrayList<Question> selectAll() {
        return questionDAO.selectAll();
 }

    public Question selectByID(int id) {
        return questionDAO.selectByID(id);
}

    public Question selectByCondition(String condition) {
        return questionDAO.selectByCondition(condition);
}

    public ArrayList<Question> selectByExamID(int id) {
        return questionDAO.selectByExamID(id);
    }
    
}
