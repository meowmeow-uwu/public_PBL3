/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.dao;

import com.pbl3.dto.Account;
import com.pbl3.util.DBUtil;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

/**
 *
 * @author Hoang Duong
 */
public class AccountDAO implements DAOInterface<Account> {

    @Override
    public int insert(Account t) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "INSERT INTO account (username, email, password, user_id) VALUES (?, ?, ?, ?)";
            PreparedStatement s = c.prepareStatement(query);
            s.setString(1, t.getUsername());
            s.setString(2, t.getEmail());
            s.setString(3, t.getPassword());
            s.setInt(4, t.getUser_id());

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
    public int update(Account t) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "UPDATE account SET username = ?, email = ?, password = ?, user_id = ? WHERE account_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setString(1, t.getUsername());
            s.setString(2, t.getEmail());
            s.setString(3, t.getPassword());
            s.setInt(4, t.getUser_id());
            s.setInt(5, t.getAccount_id());

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
    public int delete(int id) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "DELETE FROM account WHERE account_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, id);

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
    public ArrayList<Account> selectAll() {
        Connection c = null;
        try {
            ArrayList<Account> listAccount = new ArrayList<>();
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM account";
            PreparedStatement s = c.prepareStatement(query);
            ResultSet rs = s.executeQuery();
            while (rs.next()) {
                listAccount.add(new Account(
                        rs.getInt("account_id"),
                        rs.getString("username"),
                        rs.getString("email"),
                        rs.getString("password"),
                        rs.getInt("user_id")
                ));
            }
            rs.close();
            s.close();
            return listAccount;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBUtil.closeConnection(c);
        }
        return null;
    }

    @Override
    public Account selectByID(int id) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM account WHERE account_id = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setInt(1, id);
            ResultSet rs = s.executeQuery();
            if (rs.next()) {
                return new Account(
                        rs.getInt("account_id"),
                        rs.getString("username"),
                        rs.getString("email"),
                        rs.getString("password"),
                        rs.getInt("user_id")
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

    public   Account selectByEmail(String email) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM account WHERE email = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setString(1, email);
            ResultSet rs = s.executeQuery();

            if (rs.next()) {
                return new Account(
                        rs.getInt("account_id"),
                        rs.getString("username"),
                        rs.getString("email"),
                        rs.getString("password"),
                        rs.getInt("user_id")
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

    public  Account selectByUsername(String username) {
        Connection c = null;
        try {
            c = DBUtil.makeConnection();
            String query = "SELECT * FROM account WHERE username = ?";
            PreparedStatement s = c.prepareStatement(query);
            s.setString(1, username);
            ResultSet rs = s.executeQuery();
            if (rs.next()) {
                return new Account(
                        rs.getInt("account_id"),
                        rs.getString("username"),
                        rs.getString("email"),
                        rs.getString("password"),
                        rs.getInt("user_id")
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

    @Override
    public Account selectByCondition(String condition) {
        return null;
    }

}
