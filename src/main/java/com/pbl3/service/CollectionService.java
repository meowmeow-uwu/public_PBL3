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

public abstract class CollectionService implements ServiceInterface<Collection> {

    private final CollectionDAO collectionDAO = CollectionDAO.getInstance();
    private final CollectionOfWordDAO collectionOfWordDAO = CollectionOfWordDAO.getInstance();
    private final CollectionOfUserDAO collectionOfUserDAO = CollectionOfUserDAO.getInstance();
    private final AuthService authService = new AuthService();
    private final UserService userService = new UserService();

    private static final int CID = -1;

    @Override
    public int insert(Collection collection) {
        return collectionDAO.insert(collection);
    }

    @Override
    public int update(Collection collection) {
        return collectionDAO.update(collection);
    }

    @Override
    public int delete(int collectionId) {
        // First delete all words in the collection
        List<CollectionOfWord> collectionWords = collectionOfWordDAO.selectAll();
        for (CollectionOfWord cw : collectionWords) {
            if (cw.getCollection_id() == collectionId) {
                collectionOfWordDAO.delete(cw.getCollection_word_id());
            }
        }

        // Then delete all user associations
        List<CollectionOfUser> userCollections = collectionOfUserDAO.selectAll();
        if (userCollections == null) {
            return 0;
        }
        for (CollectionOfUser cu : userCollections) {
            if (cu.getCollection_id() == collectionId) {
                collectionOfUserDAO.delete(cu.getCollection_user_id());
            }
        }

        // Finally delete the collection itself
        return collectionDAO.delete(collectionId);
    }

    @Override
    public ArrayList<Collection> selectAll() {
        return collectionDAO.selectAll();
    }

    @Override
    public Collection selectByID(int id) {
        return collectionDAO.selectByID(id);
    }

    @Override
    public Collection selectByCondition(String condition) {
        return null;
    }

    public int wordCount(int cid) {
        return collectionOfWordDAO.wordCount(cid);
    }

    public boolean updateCollection(int collectionId, String name, boolean isPublic) {
        Collection collection = selectByID(collectionId);
        if (collection != null) {
            collection.setCollection_name(name);
            collection.setPublic(isPublic);
            return update(collection) > 0;
        }
        return false;
    }

    public boolean deleteCollection(int collectionId) {
        
        CollectionOfWordDAO.getInstance().deleteByCollectionID(collectionId);
        return delete(collectionId) > 0;
    }

    public int deleteWordFromCollection( int collection_id, int word_id) {
        return collectionOfWordDAO.deleteWordFromCollection(collection_id, word_id);
    }
    public boolean deleteUserFromCollection( int collection_id, int user_id) {
        
        return collectionOfUserDAO.deleteUserFromCollection(collection_id, user_id) !=0;
    }
    
    public int addWordToCollection(int collectionId, int wordId) {
        CollectionOfWord item = new CollectionOfWord(CID, collectionId, wordId);
        return CollectionOfWordDAO.getInstance().insert(item);
    }
    public int addUserToCollection(int collectionId, int userId) {
        CollectionOfUser item = new CollectionOfUser(CID, collectionId, userId);
        return CollectionOfUserDAO.getInstance().insert(item);
    }

    public List<Map<String, Object>> getWordsInCollection(int collectionId) {
        List<Map<String, Object>> result = new ArrayList<>();
        ArrayList<CollectionOfWord> collectionWords = collectionOfWordDAO.selectByCollectionID(collectionId);

        for (CollectionOfWord cw : collectionWords) {
            Word word = WordDAO.getInstance().selectByID(cw.getWord_id());
            if (word != null) {
                Map<String, Object> wordInfo = new HashMap<>();
                wordInfo.put("wordId", word.getWord_id());
                wordInfo.put("word", word.getWord_name());
                wordInfo.put("pronunciation", word.getPronunciation());
                wordInfo.put("sound", word.getSound());
                result.add(wordInfo);
            }
        }
        return result;
    }

}
