/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.service;

import com.pbl3.dao.DefinitionDAO;
import com.pbl3.dao.TranslateDAO;
import java.util.ArrayList;

import com.pbl3.dao.WordDAO;
import com.pbl3.dto.Definition;
import com.pbl3.dto.Translate;
import com.pbl3.dto.Word;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @author Danh
 */
public class WordService implements ServiceInterface<Word> {

    private final DefinitionDAO definitionDAO = new DefinitionDAO();
    private final WordDAO wordDAO = WordDAO.getInstance();
    private final TranslateDAO translateDAO = new TranslateDAO();

    @Override
    public int insert(Word Word) {
        int result = wordDAO.insert(Word);
        if (result > 0) {
            System.out.println("Word inserted successfully.");
        } else {
            System.out.println("Failed to insert Word.");
        }
        return result;
    }

    @Override
    public int update(Word Word) {
        int result = wordDAO.update(Word);
        return result;
    }

    @Override
    public int delete(int wid) {
        return wordDAO.delete(wid);
    }

    @Override
    public ArrayList<Word> selectAll() {
        ArrayList<Word> Words = wordDAO.selectAll();
        if (Words != null && !Words.isEmpty()) {
            System.out.println("Words fetched successfully.");
        } else {
            System.out.println("No Words found.");
        }
        return Words;
    }

    @Override
    public Word selectByID(int id) {
        Word u = wordDAO.selectByID(id);
        if (u != null) {
            return u;
        }
        return null;
    }

    @Override
    public Word selectByCondition(String condition) {
        return null;
    }
    
    public Map<String, Object> getWordDetail(int wordId) {
        Map<String, Object> result = new HashMap<>();

        // Lấy thông tin từ
        Word word = wordDAO.selectByID(wordId);
        if (word != null) {
            result.put("word_id", word.getWord_id());
            result.put("word", word.getWord_name());
            result.put("phonetic", word.getPronunciation());
            result.put("sound", word.getSound());

            // Lấy tất cả định nghĩa
            ArrayList<Definition> definitions = definitionDAO.selectAllByWordID(wordId);
            
            result.put("definitions", definitions);
        }

        return result;
    }

    public Map<String, Object> getWordsByPage(int pageNumber, int pageSize, int languageId, String keyword) {
        return wordDAO.getWordsByPage(pageNumber, pageSize, languageId, keyword);
    }
    public Map<String , Object> getFlashcard(int wordId,int typeTranslate)
    {
        Map<String, Object> result = new HashMap<>();
        
        Translate translate = translateDAO.selectByWordIDAndType(wordId, typeTranslate);
        Word word = wordDAO.selectByID(wordId);
        result.put("sourceWord", word);
        Definition definition = definitionDAO.selectByWordID(wordId);
        result.put("sourceDefinition", word);
        Word wordTrans = wordDAO.selectByID(translate.getTrans_word_id());
        result.put("targetWord", wordTrans);
        Definition definitionTrans = definitionDAO.selectByWordID(wordTrans.getWord_id());
        result.put("targetDefinition", word);
        return result;
    }
}
