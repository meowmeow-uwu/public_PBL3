package com.pbl3.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.pbl3.dao.CollectionDAO;
import com.pbl3.dao.CollectionOfUserDAO;
import com.pbl3.dao.CollectionOfWordDAO;
import com.pbl3.dao.WordDAO;
import com.pbl3.dto.Collection;
import com.pbl3.dto.CollectionOfUser;
import com.pbl3.dto.CollectionOfWord;
import com.pbl3.dto.Word;

public class CollectionService {
    private CollectionDAO collectionDAO = new CollectionDAO();
    private CollectionOfWordDAO collectionOfWordDAO = new CollectionOfWordDAO();
    private CollectionOfUserDAO collectionOfUserDAO = new CollectionOfUserDAO();
    private WordDAO wordDAO = new WordDAO();

    // Tạo bộ sưu tập mới
    public int createCollection(String name, boolean isPublic, int userId) {
        // 1. Tạo collection mới
        Collection collection = new Collection();
        collection.setCollection_name(name);
        collection.setPublic(isPublic);
        int collectionId = collectionDAO.insert(collection);

        if (collectionId > 0) {
            // 2. Thêm user vào collection
            CollectionOfUser collectionOfUser = new CollectionOfUser();
            collectionOfUser.setCollection_id(collectionId);
            collectionOfUser.setUser_id(userId);
            collectionOfUserDAO.insert(collectionOfUser);
        }

        return collectionId;
    }

    // Thêm từ vào bộ sưu tập
    public boolean addWordToCollection(int collectionId, int wordId) {
        CollectionOfWord collectionOfWord = new CollectionOfWord();
        collectionOfWord.setCollection_id(collectionId);
        collectionOfWord.setWord_id(wordId);
        return collectionOfWordDAO.insert(collectionOfWord) > 0;
    }

    // Xóa từ khỏi bộ sưu tập
    public boolean removeWordFromCollection(int collectionId, int wordId) {
        // Tìm collection_word_id
        CollectionOfWord collectionOfWord = collectionOfWordDAO.selectByID(wordId);
        if (collectionOfWord != null) {
            return collectionOfWordDAO.delete(collectionOfWord.getCollection_word_id()) > 0;
        }
        return false;
    }

    // Lấy danh sách từ trong bộ sưu tập
    public List<Map<String, Object>> getWordsInCollection(int collectionId) {
        List<Map<String, Object>> result = new ArrayList<>();
        List<CollectionOfWord> collectionWords = collectionOfWordDAO.selectAll();
        
        for (CollectionOfWord cw : collectionWords) {
            if (cw.getCollection_id() == collectionId) {
                Word word = wordDAO.selectByID(cw.getWord_id());
                if (word != null) {
                    Map<String, Object> wordInfo = new HashMap<>();
                    wordInfo.put("wordId", word.getWord_id());
                    wordInfo.put("wordName", word.getWord_name());
                    wordInfo.put("pronunciation", word.getPronunciation());
                    wordInfo.put("sound", word.getSound());
                    result.add(wordInfo);
                }
            }
        }
        return result;
    }

    // Lấy danh sách bộ sưu tập của user
    public List<Map<String, Object>> getUserCollections(int userId) {
        List<Map<String, Object>> result = new ArrayList<>();
        List<CollectionOfUser> userCollections = collectionOfUserDAO.selectAll();
        
        for (CollectionOfUser cu : userCollections) {
            if (cu.getUser_id() == userId) {
                Collection collection = collectionDAO.selectByID(cu.getCollection_id());
                if (collection != null) {
                    Map<String, Object> collectionInfo = new HashMap<>();
                    collectionInfo.put("collectionId", collection.getCollection_id());
                    collectionInfo.put("name", collection.getCollection_name());
                    collectionInfo.put("isPublic", collection.isPublic());
                    collectionInfo.put("wordCount", getWordsInCollection(collection.getCollection_id()).size());
                    result.add(collectionInfo);
                }
            }
        }
        return result;
    }

    public boolean hasAccessToCollection(int userId, int collectionId) {
        List<CollectionOfUser> userCollections = collectionOfUserDAO.selectAll();
        for (CollectionOfUser cu : userCollections) {
            if (cu.getUser_id() == userId && cu.getCollection_id() == collectionId) {
                return true;
            }
        }
        return false;
    }

    public boolean updateCollection(int collectionId, String name, boolean isPublic) {
        Collection collection = collectionDAO.selectByID(collectionId);
        if (collection != null) {
            collection.setCollection_name(name);
            collection.setPublic(isPublic);
            return collectionDAO.update(collection) > 0;
        }
        return false;
    }

    public boolean deleteCollection(int collectionId) {
        // First delete all words in the collection
        List<CollectionOfWord> collectionWords = collectionOfWordDAO.selectAll();
        for (CollectionOfWord cw : collectionWords) {
            if (cw.getCollection_id() == collectionId) {
                collectionOfWordDAO.delete(cw.getCollection_word_id());
            }
        }
        
        // Then delete all user associations
        List<CollectionOfUser> userCollections = collectionOfUserDAO.selectAll();
        for (CollectionOfUser cu : userCollections) {
            if (cu.getCollection_id() == collectionId) {
                collectionOfUserDAO.delete(cu.getCollection_user_id());
            }
        }
        
        // Finally delete the collection itself
        return collectionDAO.delete(collectionId) > 0;
    }
}
