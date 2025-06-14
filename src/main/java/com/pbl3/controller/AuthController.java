/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.controller;

import com.pbl3.dto.User;
import com.pbl3.service.UserService;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.Map;

/**
 *
 * @author Hoang Duong
 */
@Path("/auth")
public class AuthController {

    private final UserService userService = new UserService();

@POST
@Path("/register")
@Consumes(MediaType.APPLICATION_FORM_URLENCODED)
@Produces(MediaType.APPLICATION_JSON) 
public Response register(
        @FormParam("username") String username,
        @FormParam("email") String email,
        @FormParam("password") String password,
        @FormParam("name") String name
) {
    try {
        User user = new User();
        user.setName(name);
        user.setAvatar("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkM2OJy9rNds8J8DrtvjImMk-krlUMtDd0hfjdEwQORF9HKPxxSNClCYBCRxMi4dZS-0c&usqp=CAU");
        user.setGroup_user_id(2);
        user.setEmail(email);
        user.setPassword(password);
        user.setUsername(username);
        
        userService.insert(user);
        
        return Response.status(Response.Status.CREATED)
                       .entity("{\"message\":\"Đăng ký thành công!\"}")
                       .build();

    } catch (IllegalArgumentException e) {
         return Response.status(Response.Status.CONFLICT)
                       .entity("{\"error\":\"" + e.getMessage() + "\"}")
                       .build();
    } catch (Exception e) {
        e.printStackTrace();
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                       .entity("{\"error\":\"Đã xảy ra lỗi phía máy chủ. Vui lòng thử lại.\"}")
                       .build();
    }
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
            String token = userService.authenticate(username, password);
            return Response.ok("{\"token\":\"" + token + "\"}").build();
        } catch (SecurityException e) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"" + e.getMessage() + "\"}")
                    .build();
        }
    }

    @POST
    @Path("/forgot-password")
    @Produces(MediaType.APPLICATION_JSON)
    public Response forgotPassword(@FormParam("email") String email) {
        try {
            // Kiểm tra email tồn tại
            User user = userService.getUserByEmail(email);
            if (user == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("{\"error\":\"Email không tồn tại trong hệ thống\"}")
                        .build();
            }

            // Tạo token reset password (có thời hạn 15 phút)
            String resetToken = userService.generateResetPasswordToken(user);
            
            // Gửi email chứa link reset password
            String resetLink = "https://english.up.railway.app/Pages/Components/Login_Register_ForgotPW/resetPassword.html?token=" + resetToken;
            userService.sendResetPasswordEmail(user.getEmail(), resetLink);

            return Response.ok()
                    .entity("{\"message\":\"Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn\"}")
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"" + e.getMessage() + "\"}")
                    .build();
        }
    }

    @POST
    @Path("/reset-password")
    @Produces(MediaType.APPLICATION_JSON)
    public Response resetPassword(
            @FormParam("token") String token,
            @FormParam("newPassword") String newPassword) {
        try {
            // Xác thực token và cập nhật mật khẩu mới
            boolean success = userService.resetPassword(token, newPassword);
            
            if (success) {
                return Response.ok()
                        .entity("{\"message\":\"Mật khẩu đã được đặt lại thành công\"}")
                        .build();
            } else {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("{\"error\":\"Token không hợp lệ hoặc đã hết hạn\"}")
                        .build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"" + e.getMessage() + "\"}")
                    .build();
        }
    }

    @POST
    @Path("/verify-reset-token")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    public Response verifyResetToken(@FormParam("token") String token) {
        try {
            // Xác thực token
            if (!userService.verifyResetToken(token)) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("{\"error\":\"Token không hợp lệ hoặc đã hết hạn\"}")
                        .build();
            }
            
            return Response.ok()
                    .entity("{\"message\":\"Token hợp lệ\"}")
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"Token không hợp lệ hoặc đã hết hạn\"}")
                    .build();
        }
    }
}
