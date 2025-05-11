package com.pbl3.service;

import java.util.ArrayList;

import com.pbl3.dao.ReadingAnswerDAO;
import com.pbl3.dto.Answer;

public class ReadingAnswerService implements AnswerServiceInterface{
    private ReadingAnswerDAO AnswerDAO;

    public ReadingAnswerService() {
        AnswerDAO = new ReadingAnswerDAO();
    }

    @Override
    public int insert(Answer t) {
        return AnswerDAO.insert(t);
    }

    @Override
    public int update(Answer t) {
        return AnswerDAO.update(t);
    }

    @Override
    public int delete(int t) {
        return AnswerDAO.delete(t);
    }

    @Override
    public ArrayList<Answer> selectAll() {
        return AnswerDAO.selectAll();
    }

    @Override
    public Answer selectByID(int id) {
        return AnswerDAO.selectByID(id);
    }

    @Override
    public Answer selectByCondition(String condition) {
        return AnswerDAO.selectByCondition(condition);
    }

    @Override
    public ArrayList<Answer> selectByQuestionID(int id) {
        return AnswerDAO.selectByQuestionID(id);
    }
}
