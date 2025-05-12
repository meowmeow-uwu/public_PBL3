package com.pbl3.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.pbl3.dto.Collection;
import com.pbl3.dto.User;

public class CollectionManagementService extends CollectionService{
        private UserService userService;
        private static CollectionManagementService instance;
        
        // Private constructor
        private CollectionManagementService() {
            userService = new UserService();
        }
        
        // Method để lấy instance
        public static synchronized CollectionManagementService getInstance() {
            if (instance == null) {
                instance = new CollectionManagementService();
            }
            return instance;
        }
    
        // Kiểm tra xem user có phải là content manager không
        public boolean isAccessed(int userId) {
            User user = userService.selectByID(userId);
            return user != null && user.getGroup_user_id() != 2;
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
    
    }
