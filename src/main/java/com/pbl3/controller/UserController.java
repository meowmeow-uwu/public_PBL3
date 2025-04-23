/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.controller;

import com.pbl3.dto.User;
import com.pbl3.service.UserService;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 *
 * @author Danh
 */
    @Path("user")
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

}
