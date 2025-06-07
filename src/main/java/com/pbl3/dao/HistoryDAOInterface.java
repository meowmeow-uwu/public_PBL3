package com.pbl3.dao;

import java.util.ArrayList;

import com.pbl3.dto.History;
import java.util.Map;

public interface HistoryDAOInterface {

    public int insert(History t);

    public int update(History t);

    public int delete(int id, int userId);

    public ArrayList<History> selectAll(int userId);

    public History selectByID(int id, int userId);

    public History selectByCondition(String condition);

    public int selectCount(int userId);

    public int getNumberPage(int userId, int pageSize, String keyword);

    public Map<String, Object> getHistoryByPage(int userId, int pageNumber, int pageSize, String keyword);

    }
