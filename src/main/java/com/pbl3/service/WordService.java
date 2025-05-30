/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.service;

import com.pbl3.dao.CollectionOfWordDAO;
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

    private final DefinitionDAO definitionDAO =  DefinitionDAO.getInstance();
    private final WordDAO wordDAO = WordDAO.getInstance();
    private final TranslateDAO translateDAO =  TranslateDAO.getInstance();
    private final CollectionOfWordDAO collectionOfWordDAO = CollectionOfWordDAO.getInstance();
    @Override
    public int insert(Word Word) {
        int result = wordDAO.insert(Word);
        
        return result;
    }

    @Override
    public int update(Word Word) {
        int result = wordDAO.update(Word);
        return result;
    }

    @Override
    public int delete(int wid) {
        collectionOfWordDAO.deleteByWordId(wid);
        translateDAO.deleteByWordId(wid);
        definitionDAO.DeleteByWordId(wid);
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
            result.put("image", word.getImage());

            // Lấy tất cả định nghĩa
            ArrayList<Definition> definitions = definitionDAO.selectAllByWordID(wordId);

            result.put("definitions", definitions);
        }

        return result;
    }

    public Map<String, Object> getWordsByPage(int pageNumber, int pageSize, int languageId, String keyword) {
        return wordDAO.getWordsByPage(pageNumber, pageSize, languageId, keyword);
    }

    /**
     * Lấy thông tin flashcard bao gồm từ source, từ target và định nghĩa
     *
     * @param wordId ID của từ cần lấy thông tin
     * @param typeTranslate ID của loại dịch
     * @return Map chứa thông tin flashcard
     */
    public Map<String, Object> getFlashcard(int wordId, int typeTranslate) {
        Map<String, Object> result = new HashMap<>();

        try {

            Word word = wordDAO.selectByID(wordId);
            if (word == null) {
                System.out.println("Debug - Không tìm thấy từ gốc với ID: " + wordId);
                return result;
            }
            result.put("sourceWord", word);
            Definition definition = definitionDAO.selectByWordID(wordId);
            if (definition != null) {
                result.put("sourceDefinition", definition);
            }
            Translate translate = translateDAO.selectByWordIDAndType(wordId, typeTranslate);
            if (translate == null) {
                return result;
            }

            Word wordTrans = wordDAO.selectByID(translate.getTrans_word_id());
            if (wordTrans != null) {
                result.put("targetWord", wordTrans);

                Definition definitionTrans = definitionDAO.selectByWordID(wordTrans.getWord_id());
                if (definitionTrans != null) {
                    result.put("targetDefinition", definitionTrans);
                }
            }
        } catch (Exception e) {
            System.out.println("Debug - Có lỗi xảy ra: " + e.getMessage());
            e.printStackTrace();
        }

        return result;
    }
    public int getNumberWord(int languageId)
    {
        // 0 lấy tất cả
        return wordDAO.getNumberWord(languageId);
    }
}
