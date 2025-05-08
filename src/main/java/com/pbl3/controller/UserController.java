/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.controller;

import com.pbl3.dto.User;
import com.pbl3.service.UserService;
import com.pbl3.util.JwtUtil;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
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
    @Path("{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUser(@PathParam("id") int id) {
        UserService s = new UserService();
        User user = s.selectByID(id);

        if (user == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"User not found\"}")
                    .build();
        }
        return Response.ok(user).build();
    }

    @GET
    @Path("/me")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getProfile(@HeaderParam("authorization") String authHeader) {
        // Kiểm tra token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        String token = authHeader.substring("Bearer ".length()).trim();

        // Lấy email hoặc username từ token
        int id = JwtUtil.getUserIdFromToken(token);

        if (id == -1) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Invalid token\"}").build();
        }
        User user = userService.selectByID(id);

        if (user == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"User info not found\"}").build();
        }

        return Response.ok(user).build();
    }

    @POST
    @Path("{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response insertUser(User user) {
        UserService s = new UserService();
        int isInserted = s.insert(user);

        if (isInserted != 0) {
            return Response.status(Response.Status.CREATED)
                    .entity("{\"message\":\"User created successfully\"}")
                    .build();
        } else {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"Failed to create user\"}")
                    .build();
        }
    }

    @DELETE
    @Path("{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteUser(int uid) {
        UserService s = new UserService();
        int isDeleted = s.delete(uid);

        if (isDeleted != 0) {
            return Response.ok("{\"message\":\"User deleted successfully\"}").build();
        } else {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"User not found\"}")
                    .build();
        }
    }

    @PUT
    @Path("{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateUser(@PathParam("id") int id, User user) {
        UserService s = new UserService();
        int isUpdated = s.update(user);

        if (isUpdated != 0) {
            return Response.ok("{\"message\":\"User updated successfully\"}").build();
        } else {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"User not found\"}")
                    .build();
        }
    }

}
