package com.pbl3.service;

import java.util.ArrayList;

import com.pbl3.dao.ExamDAO;
import com.pbl3.dto.Exam;

public class ExamService implements ServiceInterface<Exam> {
    private ExamDAO examDAO;

    public ExamService() {
        examDAO = new ExamDAO();
    }

    @Override
    public int insert(Exam t) {
        return examDAO.insert(t);
    }

    @Override
    public int update(Exam t) {
        return examDAO.update(t);
    }

    @Override
    public int delete(int t) {
        return examDAO.delete(t);
    }

    @Override
    public ArrayList<Exam> selectAll() {
        return examDAO.selectAll();
    }

    @Override
    public Exam selectByID(int id) {
        return examDAO.selectByID(id);
    }

    @Override
    public Exam selectByCondition(String condition) {
        return examDAO.selectByCondition(condition);
    }

    public ArrayList<Exam> getExamsBySubTopicId(int subTopicId) {
        return examDAO.selectBySubTopicId(subTopicId);
    }
}