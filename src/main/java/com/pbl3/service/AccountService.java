/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.service;

import com.pbl3.dao.AccountDAO;
import com.pbl3.dto.Account;
import com.pbl3.util.JwtUtil;
import com.pbl3.util.PasswordUtil;

/**
 *
 * @author Hoang Duong
 */
public class AccountService {
    // Đăng ký tài khoản mới

    private final AccountDAO accountDAO = new AccountDAO();

    public int registerAccount(Account account) {

        if (accountDAO.selectByUsername(account.getUsername()) != null) {
            throw new IllegalArgumentException("Username đã tồn tại");
        }
        if (accountDAO.selectByEmail(account.getEmail()) != null) {
            throw new IllegalArgumentException("Email đã tồn tại");
        }
        account.setPassword(PasswordUtil.hashPassword(account.getPassword()));
        System.out.println(account.getPassword());
        return accountDAO.insert(account);
    }

    // Xác thực đăng nhập
    public String authenticate(String username, String password) {
        Account account = accountDAO.selectByUsername(username);

        if (account == null
                || !PasswordUtil.checkPassword(password, account.getPassword())) {
            throw new SecurityException("Thông tin đăng nhập không hợp lệ");
        }

        return JwtUtil.generateToken(account.getUser_id());
    }

     
    public void updateAccount(Account account) {
        // Lấy thông tin tài khoản hiện tại từ DB
        Account current = accountDAO.selectByID(account.getAccount_id());
        if (current == null) {
            throw new IllegalArgumentException("Tài khoản không tồn tại");
        }

        // Kiểm tra email mới có bị trùng với tài khoản khác không
        Account existing = accountDAO.selectByEmail(account.getEmail());
        if (existing != null && existing.getAccount_id() != account.getAccount_id()) {
            throw new IllegalArgumentException("Email đã được sử dụng bởi tài khoản khác");
        }

        // Nếu mật khẩu thay đổi thì băm lại
        if (account.getPassword() != null && !account.getPassword().isEmpty()
                && !PasswordUtil.checkPassword(account.getPassword(), current.getPassword())) {
            account.setPassword(PasswordUtil.hashPassword(account.getPassword()));
        } else {
            // Nếu không thay đổi mật khẩu thì giữ nguyên mật khẩu cũ
            account.setPassword(current.getPassword());
        }

        accountDAO.update(account);

    }
}
