/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.service;

import com.pbl3.dao.DefinitionDAO;
import com.pbl3.dto.Definition;
import java.util.ArrayList;

/**
 *
 * @author Hoang Duong
 */
public class DefinitionService implements ServiceInterface<Definition>{
    private final DefinitionDAO definitionDAO = DefinitionDAO.getInstance();

    @Override
    public int insert(Definition t) {
        int result = definitionDAO.insert(t);
        return result;
    }

    @Override
    public int update(Definition Definition) {
        int result = definitionDAO.update(Definition);
        return result;
    }

    @Override
    public int delete(int id) {
        return definitionDAO.delete(id);
    }

    @Override
    public ArrayList<Definition> selectAll() {
        ArrayList<Definition> definitions = definitionDAO.selectAll();
        return definitions;
    }

    @Override
    public Definition selectByID(int id) {
        Definition u = definitionDAO.selectByID(id);
        if (u != null) {
            return u;
        }
        return null;
    }

    @Override
    public Definition selectByCondition(String condition) {
        return null;
    }

}
