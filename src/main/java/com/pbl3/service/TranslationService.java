package com.pbl3.service;

import com.pbl3.dao.DefinitionDAO;
import com.pbl3.dao.TranslateDAO;
import com.pbl3.dao.WordDAO;
import com.pbl3.dto.Definition;
import com.pbl3.dto.Translate;
import com.pbl3.dto.Word;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class TranslationService {

    private final WordDAO wordDAO = new WordDAO();
    private final DefinitionDAO definitionDAO = new DefinitionDAO();
    private final TranslateDAO translateDAO = new TranslateDAO();
    // Cache cho kết quả dịch

    // Định nghĩa constant cho language
    private static final int ENGLISH_LANGUAGE_ID = 1;
    private static final int VIETNAMESE_LANGUAGE_ID = 2;

    private static final int ENG_VIET_TYPE = 1;
    private static final int VIET_ENG_TYPE = 2;

    // Số lượng kết quả tối đa
    private static final int MAX_RESULTS = 15;

    public static void main(String s[]) {
        int j = 1;
        TranslationService sa = new TranslationService();
        List<Map<String, Object>> li = sa.translateWord("h", ENGLISH_LANGUAGE_ID, ENGLISH_LANGUAGE_ID);
        for (Object ss : li) {
            System.out.println(ss.toString() + j);
            j++;

        }
    }

    // API tìm kiếm từ cơ bản
    public List<Map<String, Object>> translateWord(String sourceWord, int sourceLanguageId, int targetLanguageId) {
        try {
            List<Map<String, Object>> results = new ArrayList<>();

            // Tìm tất cả các từ bắt đầu bằng sourceWord với giới hạn MAX_RESULTS
            ArrayList<Word> sourceWords = wordDAO.findByWordNamePrefixAndLanguage(sourceWord, sourceLanguageId, MAX_RESULTS);

            if (sourceWords == null || sourceWords.isEmpty()) {
                return results;
            }
            int typeTranslateId;
            if (sourceLanguageId == 1 && targetLanguageId == 2) {
                typeTranslateId = ENG_VIET_TYPE;
            } else if (sourceLanguageId == 2 && targetLanguageId == 1) {
                typeTranslateId = VIET_ENG_TYPE;
            } else {
                return results;
            }
            for (Word sourceWordObj : sourceWords) {
                try {
                    // Tìm tất cả bản dịch của từ
                    ArrayList<Translate> translations = translateDAO.selectAllBySourceWordIDAndType(sourceWordObj.getWord_id(), typeTranslateId);

                    if (translations != null && !translations.isEmpty()) {
                        Map<String, Object> result = new HashMap<>();
                        result.put("source_word_id", sourceWordObj.getWord_id());
                        result.put("source_word", sourceWordObj.getWord_name());
                        result.put("source_phonetic", sourceWordObj.getPronunciation());

                        // Danh sách các từ đích
                        List<Map<String, Object>> targetWords = new ArrayList<>();
                        // Dùng Set để theo dõi các target_word_id đã thêm
                        Set<Integer> addedTargetIds = new HashSet<>();

                        for (Translate translation : translations) {
                            try {
                                Word targetWord = wordDAO.selectByID(translation.getTrans_word_id());
                                if (targetWord != null && !addedTargetIds.contains(targetWord.getWord_id())) {
                                    Map<String, Object> targetWordInfo = new HashMap<>();
                                    targetWordInfo.put("target_word_id", targetWord.getWord_id());
                                    targetWordInfo.put("target_word", targetWord.getWord_name());
                                    targetWords.add(targetWordInfo);
                                    // Thêm target_word_id vào Set để tránh trùng lặp
                                    addedTargetIds.add(targetWord.getWord_id());
                                }
                            } catch (Exception e) {
                                // Bỏ qua lỗi và tiếp tục với từ tiếp theo
                            }
                        }
                        result.put("target_words", targetWords);
                        results.add(result);
                    }
                } catch (Exception e) {
                }
            }

            return results;

        } catch (Exception e) {
            throw new RuntimeException("Error translating word: " + e.getMessage(), e);
        }
    }

}
