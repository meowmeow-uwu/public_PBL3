package com.pbl3.service;

import com.pbl3.dao.UserDAO;
import com.pbl3.dto.User;

public class AuthorizationService {
    private static AuthorizationService instance;

    private AuthorizationService() {}

    public static synchronized AuthorizationService getInstance() {
        if (instance == null) {
            instance = new AuthorizationService();
        }
        return instance;
    }

    public boolean isAdmin(int userId) {
        User u = UserDAO.getInstance().selectByID(userId);
        if (u == null) {
            return false;
        }
        return u.getGroup_user_id() == 1;
    }

    public boolean isContentManager(int userId) {
        User u = UserDAO.getInstance().selectByID(userId);
        if (u == null) {
            return false;
        }
        return u.getGroup_user_id() == 3;
    }

}
