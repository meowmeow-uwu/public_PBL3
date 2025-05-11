package com.pbl3.service;

import java.util.ArrayList;

import com.pbl3.dao.QuestionDAO;
import com.pbl3.dto.Question;

public class QuestionService implements ServiceInterface<Question>{
    private QuestionDAO questionDAO;

    public QuestionService() {
        questionDAO = new QuestionDAO();
    }

    @Override
    public int insert(Question t) {
        return questionDAO.insert(t);
 }

    @Override
    public int update(Question t) {
        return questionDAO.update(t);
 }

    @Override
    public int delete(int t) {
        return questionDAO.delete(t);
 }

    @Override
    public ArrayList<Question> selectAll() {
        return questionDAO.selectAll();
 }

    @Override
    public Question selectByID(int id) {
        return questionDAO.selectByID(id);
}

    @Override
    public Question selectByCondition(String condition) {
        return questionDAO.selectByCondition(condition);
}
    
}
