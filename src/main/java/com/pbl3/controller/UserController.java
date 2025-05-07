/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.controller;

import com.pbl3.dto.User;
import com.pbl3.service.UserService;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
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
