/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import com.pbl3.dto.User;
import com.pbl3.util.DBUtil;
import java.sql.Statement;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @author Danh
 */
public class UserDAO implements DAOInterface<User> {

    private static UserDAO instance;

    public static void main(String[] args) {
        UserDAO d = new UserDAO();
        User u = d.selectByID(1);
        System.out.print(u);
        Map<String,Object> dds = d.getUserByPage(1, 1, 1, "");
        
        System.out.println(dds.get("users"));
    }

    private UserDAO() {
    }

    public static synchronized UserDAO getInstance() {
        if (instance == null) {
            instance = new UserDAO();
        }
        return instance;
    }

    @Override
    public int insert(User t) {
        Connection c = null;
        int userId = -1;
        try {
            c = DBUtil.makeConnection();
            String query = "INSERT INTO _user (name, avatar, group_user_id, username, email, password) VALUES (?, ?, ?, ?, ?, ?)";
            PreparedStatement s = c.prepareStatement(query, Statement.RETURN_GENERATED_KEYS);
            s.setString(1, t.getName());
            s.setString(2, t.getAvatar());
            s.setInt(3, t.getGroup_user_id());
            s.setString(5, t.getEmail());
            s.setString(4, t.getUsername());
            s.setString(6, t.getPassword());
            int result = s.executeUpdate();
            if (result > 0) {
                ResultSet rs = s.getGeneratedKeys();
                if (rs.next()) {
                    userId = rs.getInt(1);
                }
            }
            s.close();
            return userId;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return -1;
    }

    @Override
    public int update(User t
    ) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "UPDATE _user SET name = ?, avatar = ?, group_user_id = ?, username = ?, email = ?, password = ? WHERE user_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setString(1, t.getName());
            s.setString(2, t.getAvatar());
            s.setInt(3, t.getGroup_user_id());
            s.setString(4, t.getUsername());
            s.setString(5, t.getEmail());
            s.setString(6, t.getPassword());
            s.setInt(7, t.getUser_id());

            int result = s.executeUpdate();
            s.close();
            return result;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return 0;

    }

    @Override
    public int delete(int id
    ) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            // 1. Xóa exam_history
            String deleteExamHistory = "DELETE FROM exam_history WHERE user_id = ?";
            PreparedStatement s1 = c.prepareStatement(deleteExamHistory);
            s1.setInt(1, id);
            s1.executeUpdate();
            s1.close();

            // 2. Xóa word_history
            String deleteWordHistory = "DELETE FROM word_history WHERE user_id = ?";
            PreparedStatement s2 = c.prepareStatement(deleteWordHistory);
            s2.setInt(1, id);
            s2.executeUpdate();
            s2.close();

            // 3. Xóa post_history
            String deletePostHistory = "DELETE FROM post_history WHERE user_id = ?";
            PreparedStatement s3 = c.prepareStatement(deletePostHistory);
            s3.setInt(1, id);
            s3.executeUpdate();
            s3.close();

            // 4. Xóa collection_has_user
            String deleteCollectionUser = "DELETE FROM collection_has_user WHERE user_id = ?";
            PreparedStatement s4 = c.prepareStatement(deleteCollectionUser);
            s4.setInt(1, id);
            s4.executeUpdate();
            s4.close();

            // 5. Xóa user
            String deleteUser = "DELETE FROM _user WHERE user_id = ?";
            PreparedStatement s5 = c.prepareStatement(deleteUser);
            s5.setInt(1, id);
            int result = s5.executeUpdate();
            s5.close();
            return result;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return 0;

    }

    @Override
    public ArrayList<User> selectAll() {
        Connection c = null;
        try {
            ArrayList<User> listUser = new ArrayList<User>();
            c = DBUtil.makeConnection();
            String query = "select * from _user ";
            PreparedStatement s = c.prepareStatement(query);
            ResultSet rs = s.executeQuery();
            while (rs.next()) {
                listUser.add(new User(rs.getInt("user_id"),
                        rs.getString("name"),
                        rs.getString("avatar"),
                        rs.getInt("group_user_id"),
                        rs.getString("username"),
                        rs.getString("email"),
                        rs.getString("password")));
            }
            rs.close();
            s.close();
            return listUser;

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
    }

    public ArrayList<User> selectAllByGroupUserId(int groupUserId) {
        Connection c = null;
        try {
            ArrayList<User> listUser = new ArrayList<User>();
            c = DBUtil.makeConnection();
            String query = "select * from _user where group_user_id = ? ";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, groupUserId);
            ResultSet rs = s.executeQuery();
            while (rs.next()) {
                listUser.add(new User(rs.getInt("user_id"),
                        rs.getString("name"),
                        rs.getString("avatar"),
                        rs.getInt("group_user_id"),
                        rs.getString("username"),
                        rs.getString("email"),
                        rs.getString("password")));
            }
            rs.close();
            s.close();
            return listUser;

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
    }

    @Override
    public User selectByID(int id
    ) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "select * from _user where user_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, id);
            ResultSet rs = s.executeQuery();
            if (rs.next()) {
                return new User(rs.getInt("user_id"),
                        rs.getString("name"),
                        rs.getString("avatar"),
                        rs.getInt("group_user_id"),
                        rs.getString("username"),
                        rs.getString("email"),
                        rs.getString("password"));
            }

            rs.close();
            s.close();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;

    }

    @Override
    public User selectByCondition(String condition
    ) {
        return null;
    }

    public int getNumberPage(int pageSize, int groupUserId, String keyword) {
        Connection c = null;

        try {
            List<Map<String, User>> _user = new ArrayList<>();
            c = DBUtil.makeConnection();

            // Truy vấn đếm tổng số bản ghi
            String countSql = "SELECT COUNT(*) as total FROM _user "
                    + "WHERE group_user_id = ?  "
                    + "AND (? IS NULL OR ? = '' OR name LIKE ?)";

            PreparedStatement countStmt = c.prepareStatement(countSql);
            countStmt.setInt(1, groupUserId);
            countStmt.setString(2, keyword);
            countStmt.setString(3, keyword);
            countStmt.setString(4, keyword + "%");

            ResultSet countRs = countStmt.executeQuery();
            int totalRecords = 0;
            if (countRs.next()) {
                totalRecords = countRs.getInt("total");
            }
            countRs.close();
            countStmt.close();
            return (int) Math.ceil((double) totalRecords / pageSize);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }

        return 0;
    }

    public Map<String, Object> getUserByPage(int pageNumber, int pageSize, int groupUserId, String keyword) {
        Connection c = null;
        int offset = (pageNumber - 1) * pageSize;

        try {
            List<Map<String, Object>> userDetails = new ArrayList<>();
            c = DBUtil.makeConnection();

            // Truy vấn lấy dữ liệu phân trang
            String sql = "SELECT u.*  "
                    + "FROM _user u "
                    + "WHERE u.group_user_id = ? "
                    + "  AND ( "
                    + "        ? IS NULL OR  "
                    + "        ? = '' OR  "
                    + "        u.name LIKE ? "
                    + "      ) "
                    + "ORDER BY u.user_id "
                    + "OFFSET ? ROWS FETCH NEXT ? ROWS ONLY;";

            PreparedStatement s = c.prepareStatement(sql);
            s.setInt(1, groupUserId);
            s.setString(2, keyword);
            s.setString(3, keyword);
            s.setString(4, keyword + "%");
            s.setInt(5, offset);
            s.setInt(6, pageSize);

            ResultSet rs = s.executeQuery();
            while (rs.next()) {
                Map<String, Object> userMap = new HashMap<>();

                // Tạo đối tượng User
                User user = new User(rs.getInt("user_id"),
                        rs.getString("name"),
                        rs.getString("avatar"),
                        rs.getInt("group_user_id"),
                        rs.getString("username"),
                        rs.getString("email"),
                        rs.getString("password"));

                userMap.put("user", user);
                userDetails.add(userMap);
            }

            rs.close();
            s.close();

            // Tạo Map kết quả
            Map<String, Object> result = new HashMap<>();
            result.put("_user", userDetails);
            result.put("totalPages", getNumberPage(pageSize, groupUserId, keyword));

            return result;
        } catch (Exception e) {
            e.printStackTrace();

        } finally {
            DBUtil.closeConnection(c);
        }

        return new HashMap<>();
    }

    public User selectByUsername(String username) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM _user WHERE username = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setString(1, username);
            ResultSet rs = s.executeQuery();
            if (rs.next()) {
                return new User(rs.getInt("user_id"),
                        rs.getString("name"),
                        rs.getString("avatar"),
                        rs.getInt("group_user_id"),
                        rs.getString("username"),
                        rs.getString("email"),
                        rs.getString("password"));
            }
            rs.close();
            s.close();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
    }

    public User selectByEmail(String email) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM _user WHERE email = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setString(1, email);
            ResultSet rs = s.executeQuery();

            if (rs.next()) {
                return new User(rs.getInt("user_id"),
                        rs.getString("name"),
                        rs.getString("avatar"),
                        rs.getInt("group_user_id"),
                        rs.getString("username"),
                        rs.getString("email"),
                        rs.getString("password")
                );
            }
            rs.close();
            s.close();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
    }

}
