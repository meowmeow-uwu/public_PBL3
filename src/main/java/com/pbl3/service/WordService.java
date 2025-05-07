/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.service;

import java.util.ArrayList;

import com.pbl3.dao.WordDAO;
import com.pbl3.dto.Word;

/**
 *
 * @author Danh
 */
public class WordService implements ServiceInterface<Word>{

    @Override
    public int insert(Word Word) {
        WordDAO dao = new WordDAO();
        int result = dao.insert(Word);
        if (result > 0) {
            System.out.println("Word inserted successfully.");
        } else {
            System.out.println("Failed to insert Word.");
        }
        return result;
    }
    

    @Override
    public int update(Word Word) {
        WordDAO dao = new WordDAO();
        int result = dao.update(Word);
        if (result > 0) {
            System.out.println("Word updated successfully.");
        } else {
            System.out.println("Failed to update Word.");
        }
        return result;
    }
    

    @Override
    public int delete(int wid) {
		return 0;
    }
    
    @Override
    public ArrayList<Word> selectAll() {
        WordDAO dao = new WordDAO();
        ArrayList<Word> Words = dao.selectAll();
        if (Words != null && !Words.isEmpty()) {
            System.out.println("Words fetched successfully.");
        } else {
            System.out.println("No Words found.");
        }
        return Words;
    }
    

    @Override
    public Word selectByID(int id) {
        WordDAO dao = new WordDAO();
        Word u = dao.selectByID(id);
        if(u != null){
            return u;
        }
        return null;
    }

    @Override
    public Word selectByCondition(String condition) {
        return null;
    }
    
}
