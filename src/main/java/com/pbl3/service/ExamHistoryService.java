package com.pbl3.service;

import java.util.ArrayList;

import com.pbl3.dao.ExamHistoryDAO;
import com.pbl3.dto.ExamHistory;

public class ExamHistoryService{
    private ExamHistoryDAO examHistoryDAO;

    public ExamHistoryService() {
        examHistoryDAO = new ExamHistoryDAO();
    }

    public int insert(ExamHistory t) {
        return examHistoryDAO.insert(t);
}

    public int update(ExamHistory t) {
        return examHistoryDAO.update(t);
}

    public int delete(int id, int userId) {
        return examHistoryDAO.delete(id, userId);
}

    public ArrayList<ExamHistory> selectAll(int userId) {
        return examHistoryDAO.selectAll(userId);
}

    public ExamHistory selectByID(int id, int userId) {
        return examHistoryDAO.selectByID(id, userId);
}

    public ExamHistory selectByCondition(String condition) {
        return examHistoryDAO.selectByCondition(condition);
}
}