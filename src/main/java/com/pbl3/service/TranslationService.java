package com.pbl3.service;

import com.pbl3.dao.DefinitionDAO;
import com.pbl3.dao.TranslateDAO;
import com.pbl3.dao.WordDAO;
import com.pbl3.dto.Definition;
import com.pbl3.dto.Translate;
import com.pbl3.dto.Word;

import java.util.Map;
import java.util.HashMap;

public class TranslationService {
    private WordDAO wordDAO = new WordDAO();
    private DefinitionDAO definitionDAO = new DefinitionDAO();
    private TranslateDAO translateDAO = new TranslateDAO();

    // Định nghĩa constant cho language
    private static final int ENGLISH_LANGUAGE_ID = 1;
    private static final int VIETNAMESE_LANGUAGE_ID = 2;

    public Map<String, Object> translateWord(String sourceWord, int sourceLanguageId, int targetLanguageId) {
        // Kiểm tra language
        if (sourceLanguageId != ENGLISH_LANGUAGE_ID) {
            return null; // Chỉ chấp nhận tiếng Anh làm ngôn ngữ nguồn
        }

        if (targetLanguageId != ENGLISH_LANGUAGE_ID && targetLanguageId != VIETNAMESE_LANGUAGE_ID) {
            return null; // Chỉ chấp nhận tiếng Anh hoặc tiếng Việt làm ngôn ngữ đích
        }

        // Bước 1: Tìm từ vựng nguồn (tiếng Anh)
        Word sourceWordObj = wordDAO.findByWordName(sourceWord);
        if (sourceWordObj == null) {
            return null; // Không tìm thấy từ vựng nguồn
        }

        // Kiểm tra xem từ vựng nguồn có phải tiếng Anh không
        if (sourceWordObj.getLanguage_id() != ENGLISH_LANGUAGE_ID) {
            return null; // Từ vựng nguồn không phải tiếng Anh
        }

        // Bước 2: Lấy định nghĩa của từ vựng nguồn
        Definition definition = definitionDAO.selectByWordID(sourceWordObj.getWord_id());
        if (definition == null) {
            return null; // Không tìm thấy định nghĩa
        }

        Map<String, Object> result = new HashMap<>();
        
        // Thông tin từ vựng nguồn (tiếng Anh)
        Map<String, String> sourceInfo = new HashMap<>();
        sourceInfo.put("word", sourceWordObj.getWord_name());
        sourceInfo.put("pronunciation", sourceWordObj.getPronunciation());
        sourceInfo.put("sound", sourceWordObj.getSound());
        result.put("source", sourceInfo);

        // Thông tin định nghĩa
        Map<String, String> definitionInfo = new HashMap<>();
        definitionInfo.put("meaning", definition.getMeaning());
        definitionInfo.put("example", definition.getExample());
        definitionInfo.put("wordType", definition.getWord_type());
        result.put("definition", definitionInfo);

        // Nếu là dịch Anh-Anh
        if (targetLanguageId == ENGLISH_LANGUAGE_ID) {
            return result;
        }

        // Nếu là dịch Anh-Việt
        // Bước 3: Lấy bản dịch
        Translate translate = translateDAO.selectBySourceWordID(sourceWordObj.getWord_id());
        if (translate == null) {
            return null; // Không tìm thấy bản dịch
        }

        // Bước 4: Lấy từ vựng đích (tiếng Việt)
        Word targetWordObj = wordDAO.selectByID(translate.getTrans_word_id());
        if (targetWordObj == null) {
            return null; // Không tìm thấy từ vựng đích
        }

        // Kiểm tra xem từ vựng đích có phải tiếng Việt không
        if (targetWordObj.getLanguage_id() != VIETNAMESE_LANGUAGE_ID) {
            return null; // Từ vựng đích không phải tiếng Việt
        }

        // Thông tin từ vựng đích (tiếng Việt)
        Map<String, String> targetInfo = new HashMap<>();
        targetInfo.put("word", targetWordObj.getWord_name());
        targetInfo.put("pronunciation", targetWordObj.getPronunciation());
        targetInfo.put("sound", targetWordObj.getSound());
        result.put("target", targetInfo);
        
        // Lấy definition cho từ tiếng Việt
        Definition targetDefinition = definitionDAO.selectByWordID(targetWordObj.getWord_id());
        if (targetDefinition != null) {
            Map<String, String> targetDefinitionInfo = new HashMap<>();
            targetDefinitionInfo.put("meaning", targetDefinition.getMeaning());
            targetDefinitionInfo.put("example", targetDefinition.getExample());
            targetDefinitionInfo.put("wordType", targetDefinition.getWord_type());
            result.put("definitionTarget", targetDefinitionInfo);
        }

        return result;
    }

    

}
