package com.pbl3.service;

import com.pbl3.dao.CollectionDAO;
import com.pbl3.dao.CollectionOfUserDAO;
import com.pbl3.dao.CollectionOfWordDAO;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.pbl3.dto.Collection;

public class CollectionManagementService extends CollectionService {

    private final CollectionDAO collectionDAO = CollectionDAO.getInstance();
    private final CollectionOfWordDAO collectionOfWordDAO = CollectionOfWordDAO.getInstance();
    private final CollectionOfUserDAO collectionOfUserDAO = CollectionOfUserDAO.getInstance();

    private static CollectionManagementService instance;

    // Method để lấy instance
    public static synchronized CollectionManagementService getInstance() {
        if (instance == null) {
            instance = new CollectionManagementService();
        }
        return instance;
    }

    // Lấy tất cả các bộ sưu tập công khai (dành cho content manager)
    public List<Map<String, Object>> getAllPublicCollections() {

        List<Map<String, Object>> result = new ArrayList<>();
        List<Collection> allCollections = selectAll();

        for (Collection collection : allCollections) {
            if (collection.isPublic()) {
                Map<String, Object> collectionInfo = new HashMap<>();
                collectionInfo.put("collectionId", collection.getCollection_id());
                collectionInfo.put("name", collection.getCollection_name());
                collectionInfo.put("isPublic", collection.isPublic());
                collectionInfo.put("wordCount", wordCount(collection.getCollection_id()));
                result.add(collectionInfo);
            }
        }
        return result;
    }

    // Cập nhật trạng thái công khai của bộ sưu tập (dành cho content manager)
    public boolean updateCollectionPublicStatus(int collectionId, boolean isPublic) {

        Collection collection = selectByID(collectionId);
        if (collection != null) {
            collection.setPublic(isPublic);
            return update(collection) > 0;
        }
        return false;
    }

    public int deleteWordFromCollection(String authHeader, int collection_id, int word_id) {
        
        return collectionOfWordDAO.deleteWordFromCollection(collection_id, word_id);
    }
}
