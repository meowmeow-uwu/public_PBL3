package com.pbl3.service;


import java.util.ArrayList;

import com.pbl3.dao.ReadingQuestionDAO;
import com.pbl3.dto.ReadingQuestion;

public class ReadingQuestionService implements ServiceInterface<ReadingQuestion>{
    private ReadingQuestionDAO readingQuestionDAO;

    public ReadingQuestionService() {
        readingQuestionDAO = new ReadingQuestionDAO();
    }

    @Override
    public int insert(ReadingQuestion t) {
        return readingQuestionDAO.insert(t);
    }

    @Override
    public int update(ReadingQuestion t) {
        return readingQuestionDAO.update(t);
    }

    @Override
    public int delete(int t) {
        return readingQuestionDAO.delete(t);
    }

    @Override
    public ArrayList<ReadingQuestion> selectAll() {
        return readingQuestionDAO.selectAll();
    }

    @Override
    public ReadingQuestion selectByID(int id) {
        return readingQuestionDAO.selectByID(id);
    }

    @Override
    public ReadingQuestion selectByCondition(String condition) {
        return readingQuestionDAO.selectByCondition(condition);
    }

    public ArrayList<ReadingQuestion> selectByReadingID(int readingID) {
        return readingQuestionDAO.selectByReadingID(readingID);
    }
}
