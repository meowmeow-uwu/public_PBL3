package com.pbl3.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.pbl3.dao.CollectionDAO;
import com.pbl3.dao.CollectionOfUserDAO;
import com.pbl3.dao.CollectionOfWordDAO;
import com.pbl3.dto.Collection;
import com.pbl3.dto.CollectionOfUser;

public class CollectionUserService extends CollectionService {
    // Singleton instance
    private static CollectionUserService instance;
    
    // Private constructor
    private CollectionUserService() {
        collectionDAO = CollectionDAO.getInstance();
        collectionOfWordDAO = CollectionOfWordDAO.getInstance();
        collectionOfUserDAO = CollectionOfUserDAO.getInstance();
    }
    
    // Method để lấy instance
    public static synchronized CollectionUserService getInstance() {
        if (instance == null) {
            instance = new CollectionUserService();
        }
        return instance;
    }

    // Các DAO instances
    private final CollectionDAO collectionDAO;
    private final CollectionOfWordDAO collectionOfWordDAO;
    private final CollectionOfUserDAO collectionOfUserDAO;

    // Tạo bộ sưu tập mới cho user
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
                    collectionInfo.put("wordCount", collectionOfWordDAO.wordCount(collection.getCollection_id()));
                    result.add(collectionInfo);
                }
            }
        }
        return result;
    }

    // Kiểm tra quyền truy cập vào bộ sưu tập
    public boolean hasAccessToCollection(int userId, int collectionId) {
        List<CollectionOfUser> userCollections = collectionOfUserDAO.selectAll();
        for (CollectionOfUser i : userCollections) {
            if (i.getUser_id() == userId && i.getCollection_id() == collectionId) {
                return true;
            }
        }
        return false;
    }


}
