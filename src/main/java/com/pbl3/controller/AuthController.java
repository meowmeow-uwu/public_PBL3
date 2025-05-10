/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.controller;

import com.pbl3.dto.Account;
import com.pbl3.dto.User;
import com.pbl3.service.AccountService;
import com.pbl3.service.UserService;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 *
 * @author Hoang Duong
 */
@Path("/auth")
public class AuthController {

    private final AccountService accountService = new AccountService();
    private final UserService userService = new UserService();

    @POST
    @Path("/register")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Response register(
            @FormParam("username") String username,
            @FormParam("email") String email,
            @FormParam("password") String password,
            @FormParam("name") String name
    ) {
        
        User user = new User();
        user.setName(name);
        user.setAvatar("https://imgur.com/a/Ne5GWsq.png");
        user.setGroup_user_id(2);
        int userId = userService.insert(user);
        if(userId == -1) return Response.status(Response.Status.BAD_REQUEST)
                        .entity("{\"error\":\"Unable to register user\"}")
                        .build();
        // 2. Tạo account mới
        Account account = new Account();
        account.setUsername(username);
        account.setEmail(email);
        account.setPassword(password);
        account.setUser_id(userId);
        int result;
        try{
        result = accountService.insert(account);
        }catch(Exception e){
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("{\"error\":\"Unable to register account\"}")
                        .build();
                }
        return (result > 0)
                ? Response.status(Response.Status.CREATED).build()
                : Response.status(Response.Status.BAD_REQUEST)
                        .entity("{\"error\":\"Unable to register account\"}")
                        .build();
    }

    @POST
    @Path("/login")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    public Response login(
            @FormParam("username") String username,
            @FormParam("password") String password
    ) {
        try {
            String token = accountService.authenticate(username, password);
            return Response.ok("{\"token\":\"" + token + "\"}").build();
        } catch (SecurityException e) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"" + e.getMessage() + "\"}")
                    .build();
        }
    }
}
