package com.pbl3.service;

import java.util.ArrayList;

import com.pbl3.dao.ExamHistoryDAO;
import com.pbl3.dto.ExamHistory;
import com.pbl3.dto.History;
import java.util.List;
import java.util.Map;

public class ExamHistoryService {

    private ExamHistoryDAO examHistoryDAO;

    public ExamHistoryService() {
        examHistoryDAO = new ExamHistoryDAO();
    }
    public Map<String, Object> getExamHistoryByPage(int userId, int pageNumber, int pageSize, String keyword) {
    return examHistoryDAO.getExamHistoryByPage(userId, pageNumber, pageSize, keyword);
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

    public ExamHistory selectRecently( int userId) {
        String sql = "SELECT * FROM exam_history where user_id = "+userId+" ORDER BY exam_history_id DESC LIMIT 1;";
        return examHistoryDAO.selectByCondition(sql);
    }

    public ExamHistory selectByCondition(String condition) {
        return examHistoryDAO.selectByCondition(condition);
    }
}
