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

    public Map<String, Object> translateWord(String sourceWord, int sourceLanguageId, int targetLanguageId) {
        // Bước 1: Tìm từ vựng nguồn
        Word sourceWordObj = wordDAO.findByWordName(sourceWord);
        if (sourceWordObj == null) {
            return null; // Không tìm thấy từ vựng nguồn
        }

        // Bước 2: Lấy định nghĩa của từ vựng nguồn
        Definition definition = definitionDAO.selectByID(sourceWordObj.getWord_id());
        if (definition == null) {
            return null; // Không tìm thấy định nghĩa
        }

        Map<String, Object> result = new HashMap<>();
        result.put("sourceWord", sourceWordObj.getWord_name());

        // Nếu là dịch cùng ngôn ngữ (Anh-Anh hoặc Việt-Việt)
        if (sourceLanguageId == targetLanguageId) {
            result.put("targetWord", definition.getMeaning()); // Lấy definition làm target
            return result;
        }

        // Nếu là dịch khác ngôn ngữ (Anh-Việt hoặc Việt-Anh)
        // Bước 3: Lấy bản dịch
        Translate translate = translateDAO.selectByID(sourceWordObj.getWord_id());
        if (translate == null) {
            return null; // Không tìm thấy bản dịch
        }

        // Bước 4: Lấy từ vựng đích
        Word targetWordObj = wordDAO.selectByID(translate.getTrans_word_id());
        if (targetWordObj == null) {
            return null; // Không tìm thấy từ vựng đích
        }

        result.put("definition", definition.getMeaning()); // Thêm definition cho dịch khác ngôn ngữ
        result.put("targetWord", targetWordObj.getWord_name());

        return result;
    }
}
