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

    public History selectByCondition(String condition) {
        return historyDAO.selectByCondition(condition);
}
}