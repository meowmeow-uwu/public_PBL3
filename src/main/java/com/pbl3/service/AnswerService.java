package com.pbl3.service;

import java.util.ArrayList;

import com.pbl3.dao.AnswerDAO;
import com.pbl3.dto.Answer;

public class AnswerService implements AnswerServiceInterface{
    private AnswerDAO answerDAO;

    public AnswerService() {
        answerDAO = new AnswerDAO();
    }

    @Override
    public int insert(Answer t) {
        return answerDAO.insert(t);
}

    @Override
    public int update(Answer t) {
        return answerDAO.update(t);
    }

    @Override
    public int delete(int t) {
        return answerDAO.delete(t);
    }

    @Override
    public ArrayList<Answer> selectAll() {
        return answerDAO.selectAll();
 }

    @Override
    public Answer selectByID(int id) {
        return answerDAO.selectByID(id);
 }

    @Override
    public Answer selectByCondition(String condition) {
        return answerDAO.selectByCondition(condition);
    }

    @Override
    public ArrayList<Answer> selectByQuestionID(int id) {
        return answerDAO.selectByQuestionID(id);
    }
}