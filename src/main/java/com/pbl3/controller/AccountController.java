/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.controller;

import com.pbl3.dto.Account;
import com.pbl3.service.AccountService;
import com.pbl3.util.PasswordUtil;
import jakarta.ws.rs.FormParam;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 *
 * @author Hoang Duong
 */
@Path("/account")
public class AccountController {

    private final AccountService accountService = new AccountService();

    @GET
    @Path("/me")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getEmail(@HeaderParam("authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(jakarta.ws.rs.core.Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        String token = authHeader.substring("Bearer ".length()).trim();
        Account account;
        try {
            account = accountService.getAccountByToken(token);
        } catch (RuntimeException e) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Invalid token\"}").build();
        }
        if (account == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"account info not found\"}").build();
        }

        return Response.ok()
                .entity("{\"email\":\"" + account.getEmail() + "\","
                        + "\"username\":\"" + account.getUsername() + "\"}")
                .build();
    }

    @PUT
    @Path("/update/password")
    @Produces(MediaType.APPLICATION_JSON)
    public Response changePassword(
            @HeaderParam("authorization") String authHeader,
            @FormParam("oldpassword") String oldPassword,
            @FormParam("newpassword") String newPassword) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }

        if (oldPassword == null || newPassword == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"Old password and new password are required\"}").build();
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        Account account;
        try {
            account = accountService.getAccountByToken(token);
        } catch (RuntimeException e) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Invalid token\"}").build();
        }
        if (account == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"Account not found\"}").build();
        }

        // Kiểm tra mật khẩu cũ
        if (!PasswordUtil.checkPassword(oldPassword, account.getPassword())) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"Old password is incorrect\"}").build();
        }

        // Cập nhật mật khẩu mới
        account.setPassword(PasswordUtil.hashPassword(newPassword));
        int result = accountService.update(account);

        if (result > 0) {
            return Response.ok()
                    .entity("{\"message\":\"Password updated successfully\"}").build();
        } else {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"Failed to update password\"}").build();
        }
    }

    @PUT
    @Path("/update/email")
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateEmail(
            @HeaderParam("authorization") String authHeader,
            @FormParam("email") String newEmail) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }

        if (newEmail == null || newEmail.trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"Email is required\"}").build();
        }

        // Kiểm tra định dạng email
        if (!newEmail.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"Invalid email format\"}").build();
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        Account account;
        try {
            account = accountService.getAccountByToken(token);
        } catch (RuntimeException e) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Invalid token\"}").build();
        }
        if (account == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"User not found\"}").build();
        }

        // Kiểm tra email đã tồn tại chưa
        if (accountService.isEmailExists(newEmail)) {
            return Response.status(Response.Status.CONFLICT)
                    .entity("{\"error\":\"Email already exists\"}").build();
        }

        // Cập nhật email mới
        account.setEmail(newEmail);
        int result = accountService.update(account);

        if (result > 0) {
            return Response.ok()
                    .entity("{\"message\":\"Email updated successfully\"}").build();
        } else {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"Failed to update email\"}").build();
        }
    }
}
