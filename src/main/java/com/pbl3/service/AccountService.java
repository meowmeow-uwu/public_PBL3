/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.service;

import com.pbl3.dao.AccountDAO;
import com.pbl3.dto.Account;
import com.pbl3.util.JwtUtil;
import com.pbl3.util.PasswordUtil;
import java.util.ArrayList;

/**
 *
 * @author Hoang Duong
 */
public class AccountService implements ServiceInterface<Account> {

    private final AccountDAO accountDAO = new AccountDAO();

    // Xác thực đăng nhập
    public String authenticate(String username, String password) {
        Account account = accountDAO.selectByUsername(username);

        if (account == null
                || !PasswordUtil.checkPassword(password, account.getPassword())) {
            throw new SecurityException("Thông tin đăng nhập không hợp lệ");
        }

        return JwtUtil.generateToken(account.getUser_id());
    }

    public Account selectByUserId(int id) {
        return accountDAO.selectByUserId(id);
    }

    public boolean isEmailExists(String email) {
        return accountDAO.selectByEmail(email) != null;
    }

    @Override
    public int insert(Account t) {
        if (accountDAO.selectByUsername(t.getUsername()) != null) {
            throw new IllegalArgumentException("Username đã tồn tại");
        }
        if (accountDAO.selectByEmail(t.getEmail()) != null) {
            throw new IllegalArgumentException("Email đã tồn tại");
        }
        t.setPassword(PasswordUtil.hashPassword(t.getPassword()));
        return accountDAO.insert(t);
    }

    @Override
    public int update(Account t) {
        Account existing = accountDAO.selectByEmail(t.getEmail());
        if (existing != null && existing.getAccount_id() != t.getAccount_id()) {
            throw new IllegalArgumentException("Email đã được sử dụng bởi tài khoản khác");
        }

        return accountDAO.update(t);
    }

    @Override
    public int delete(int t) {
        return accountDAO.delete(t);

    }

    @Override
    public ArrayList<Account> selectAll() {
        return accountDAO.selectAll();

    }

    @Override
    public Account selectByID(int id) {
        return accountDAO.selectByID(id);

    }

    @Override
    public Account selectByCondition(String condition) {
        return null;
    }
}
