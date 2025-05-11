package com.pbl3.service;

import java.util.ArrayList;

import com.pbl3.dao.ReadingDAO;
import com.pbl3.dto.Reading;

public class ReadingService implements ServiceInterface<Reading>{
    private ReadingDAO readingDAO;

    public ReadingService(){
        readingDAO = new ReadingDAO();
    }

    @Override
    public int insert(Reading t) {
        return readingDAO.insert(t);
    }
    
    @Override
    public int update(Reading t) {
        return readingDAO.update(t);
    }

    @Override
    public int delete(int id) {
        return readingDAO.delete(id);
    }

    @Override
    public Reading selectByID(int id) {
        return readingDAO.selectByID(id);
    }

    @Override
    public ArrayList<Reading> selectAll() {
        return readingDAO.selectAll();
    }

    @Override
    public Reading selectByCondition(String condition) {
        return readingDAO.selectByCondition(condition);
    }

    public ArrayList<Reading> selectByExamID(int id) {
        return readingDAO.selectByExamID(id);
    }
}