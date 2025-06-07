package com.pbl3.service;

import java.util.ArrayList;

import com.pbl3.dao.HistoryDAOInterface;
import com.pbl3.dao.WordHistoryDAO;
import com.pbl3.dao.PostHistoryDAO;
import com.pbl3.dto.History;

public class HistoryService {

    private HistoryDAOInterface historyDAO;
    private WordHistoryDAO wordHistoryDAO;
    private PostHistoryDAO postHistoryDAO;

    public HistoryService() {
        wordHistoryDAO = new WordHistoryDAO();
        postHistoryDAO = new PostHistoryDAO();
    }

    public void chooseHistoryDAO(int type) {
        if (type == 1) {
            historyDAO = wordHistoryDAO;
        } else if (type == 2) {
            historyDAO = postHistoryDAO;
        }
    }

    public int insert(History t) {
        return historyDAO.insert(t);
    }

    public int update(History t) {
        return historyDAO.update(t);
    }

    public int delete(int id, int userId) {
        return historyDAO.delete(id, userId);
    }

    public ArrayList<History> selectAll(int userId) {
        return historyDAO.selectAll(userId);
    }

    public History selectByID(int id, int userId) {
        return historyDAO.selectByID(id, userId);
    }

    public int SelectCount(int userId) {
        return historyDAO.selectCount(userId);
    }

    public History selectRecently(int userId) {
        String sql = "";
        if (historyDAO == wordHistoryDAO) {
            sql = "SELECT * FROM word_history where user_id = " + userId + " ORDER BY word_history_date DESC LIMIT 1;";
        }
        if (historyDAO == postHistoryDAO) {
            sql = "SELECT * FROM post_history where user_id = " + userId + " ORDER BY post_history_date DESC LIMIT 1;";
        }
        return historyDAO.selectByCondition(sql);
    }

    public History selectByCondition(String condition) {
        return historyDAO.selectByCondition(condition);
    }
}
