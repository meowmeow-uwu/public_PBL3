/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.controller;

import com.pbl3.dto.User;
import com.pbl3.service.UserService;
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
 * @author Danh
 */
@Path("/user")
public class UserController {

    private final UserService userService = new UserService();

    @GET
    @Path("/me")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getProfile(@HeaderParam("authorization") String authHeader) {
        // Kiểm tra token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        User user;
        try {
            user = userService.getUserByAuthHeader(authHeader);
        } catch (RuntimeException e) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Invalid token\"}").build();
        }
        if (user == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"User info not found\"}").build();
        }

        user.setPassword("");
        return Response.ok()
                .entity(user)
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

        User user;
        try {
            user = userService.getUserByAuthHeader(authHeader);
        } catch (RuntimeException e) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Invalid token\"}").build();
        }
        if (user == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"user not found\"}").build();
        }

        // Kiểm tra mật khẩu cũ
        if (!userService.checkPassword(oldPassword, user)) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"Old password is incorrect\"}").build();
        }

        // Cập nhật mật khẩu mới
        user.setPassword(newPassword);
        int result = userService.updatePassword(user);

        if (result > 0) {
            return Response.ok()
                    .entity("{\"message\":\"Password updated successfully\"}").build();
        } else {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"Failed to update password\"}").build();
        }
    }

    @PUT
    @Path("/me/update")
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateProfile(
            @HeaderParam("authorization") String authHeader,
            @FormParam("name") String name,
            @FormParam("avatar") String avatar,
            @FormParam("email") String newEmail) {
        // Kiểm tra token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        User user;
        try {
            user = userService.getUserByAuthHeader(authHeader);
        } catch (RuntimeException e) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Invalid token\"}").build();
        }
        if (user == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"User not found\"}").build();
        }

        // Cập nhật thông tin
        user.setName(name);
        user.setAvatar(avatar);
        user.setEmail(newEmail);

        int result = userService.update(user);

        if (result > 0) {
            return Response.ok()
                    .entity("{\"message\":\"Profile updated successfully\"}").build();
        } else {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"Failed to update profile\"}").build();
        }
    }
}
