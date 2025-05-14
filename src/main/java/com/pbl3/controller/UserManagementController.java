/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.controller;

import com.pbl3.dto.User;
import com.pbl3.service.AuthService;
import com.pbl3.service.UserService;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.FormParam;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @author Hoang Duong
 */
@Path("/admin/users")
public class UserManagementController {

    private final UserService userService = new UserService();
    private final AuthService authService = new AuthService();

    // Tạo người dùng mới
    @POST
    @Path("/create")
    @Produces(MediaType.APPLICATION_JSON)
    public Response createUser(
            @HeaderParam("authorization") String authHeader,
            @FormParam("username") String username,
            @FormParam("password") String password,
            @FormParam("email") String email,
            @FormParam("name") String name,
            @FormParam("role_id") int roleId,
            @FormParam("avatar") String avatar) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        if (!authService.isAdmin(authHeader)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"Access denied\"}").build();
        }

        // Kiểm tra các trường bắt buộc
        if (username == null || password == null || email == null || name == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"Missing required fields\"}").build();
        }

        try {
            User user = new User();
            user.setName(name);
            user.setAvatar(avatar);
            user.setGroup_user_id(roleId);
            user.setEmail(email);
            user.setUsername(username);
            user.setPassword(password);
            int result = userService.insert(user);
           
            if (result >= 0) {
                return Response.ok()
                        .entity("{\"message\":\"User created successfully\"}").build();
            } else {
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                        .entity("{\"error\":\"Failed to create user\"}").build();
            }
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"" + e.getMessage() + "\"}").build();
        }
    }

    @PUT
    @Path("/change-info")
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateUser(
            @HeaderParam("authorization") String authHeader,
            @FormParam("user_id") int userId,
            @FormParam("username") String username,
            @FormParam("email") String email,
            @FormParam("name") String name,
            @FormParam("role_id") int roleId,
            @FormParam("avatar") String avatar) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        if (!authService.isAdmin(authHeader)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"Access denied\"}").build();
        }

        // Kiểm tra các trường bắt buộc
        if (email == null || name == null || username == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"Missing required fields\"}").build();
        }

        try {
            User user = userService.selectByID(userId);
            user.setName(name);
            user.setAvatar(avatar);
            user.setGroup_user_id(roleId);
            user.setEmail(email);
            user.setUsername(username);
            int resultUser = userService.update(user);
            if (resultUser < 0) {
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                        .entity("{\"error\":\"Failed to update user\"}").build();
            } else {
                return Response.ok()
                        .entity("{\"message\":\"User update successfully\"}").build();
            }
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"" + e.getMessage() + "\"}").build();
        }
    }

    @PUT
    @Path("/change-password")
    @Produces(MediaType.APPLICATION_JSON)
    public Response changePassword(
            @HeaderParam("authorization") String authHeader,
            @FormParam("userId") int userId,
            @FormParam("password") String password) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        if (!authService.isAdmin(authHeader)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"Access denied\"}").build();
        }

        
        User user = userService.selectByID(userId);
        try {
            user.setPassword(password);

            // Cập nhật mật khẩu mới
            int result = userService.updatePassword(user);

            if (result > 0) {
                return Response.ok()
                        .entity("{\"message\":\"Password changed successfully\"}").build();
            } else {
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                        .entity("{\"error\":\"Failed to change password\"}").build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"" + e.getMessage() + "\"}").build();
        }
    }

   

    @GET
    @Path("/list/{page_number}/{pagesize}/{group_user_id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getWordsByPageLanguageKeyword(@HeaderParam("authorization") String authHeader,
            @PathParam("page_number") int pageNumber,
            @PathParam("pagesize") int pageSize,
            @PathParam("group_user_id") int groupUserId,
            @QueryParam("keyword") String keyword) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        if (!authService.isContentManagerOrAdmin(authHeader)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"Access denied\"}").build();
        }
        if (keyword == null || keyword.equalsIgnoreCase("null")) {
            keyword = "";
        }
        
        // Tạo Map kết quả
        Map<String, Object> result = userService.getUsersByPage(pageNumber, pageSize, groupUserId, keyword);
        if(result == null)
        {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"user not found\"}")
                    .build();
        }

        return Response.ok(result).build();
    }

    @DELETE
    @Path("/delete/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteUser(
            @HeaderParam("authorization") String authHeader,
            @PathParam("id") int userId) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        if (!authService.isAdmin(authHeader)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"Access denied\"}").build();
        }

        
        
        int userResult = userService.delete(userId);

        if (userResult > 0) {
            return Response.ok()
                    .entity("{\"message\":\"User deleted successfully\"}").build();
        } else {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"Failed to delete user\"}").build();
        }
    }
}
