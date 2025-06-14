package com.pbl3.controller;

import java.util.ArrayList;

import com.pbl3.dto.ExamHistory;
import com.pbl3.dto.User;
import com.pbl3.service.ExamHistoryService;
import com.pbl3.service.UserService;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
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
import java.util.Map;

@Path("/exam-history")
public class ExamHistoryController {

    private ExamHistoryService examHistoryService;
    private UserService userService;

    public ExamHistoryController() {
        userService = new UserService();
        examHistoryService = new ExamHistoryService();
    }

    @GET
    @Path("/list/{page_number}/{pagesize}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getExamHistoryByPageLanguageKeyword(@HeaderParam("authorization") String authHeader,
            @PathParam("page_number") int pageNumber,
            @PathParam("pagesize") int pageSize,
            @QueryParam("keyword") String keyword) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        User user = userService.getUserByAuthHeader(authHeader);
        if (user == null) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"Access denied\"}").build();
        }
        if (keyword == null || keyword.equalsIgnoreCase("null")) {
            keyword = "";
        }
        // Tạo Map kết quả
        Map<String, Object> result = examHistoryService.getExamHistoryByPage(user.getUser_id(), pageNumber, pageSize, keyword);
        if (result == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"exam history not found\"}")
                    .build();
        }

        return Response.ok(result).build();
    }

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllExams(@HeaderParam("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }

        int userId = userService.getUserIdByAuthHeader(authHeader);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Invalid or expired token\"}").build();
        }
        ArrayList<ExamHistory> examHistories = examHistoryService.selectAll(userId);
        if (examHistories != null) {
            return Response.status(Response.Status.OK).entity(examHistories).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    @GET
    @Path("/recently")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getRecently(@HeaderParam("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }

        int userId = userService.getUserIdByAuthHeader(authHeader);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Invalid or expired token\"}").build();
        }
        ExamHistory examHistories = examHistoryService.selectRecently(userId);
        if (examHistories != null) {
            return Response.status(Response.Status.OK).entity(examHistories).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getExamByID(@HeaderParam("Authorization") String authHeader, @PathParam("id") int id) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        int userId = userService.getUserIdByAuthHeader(authHeader);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Invalid or expired token\"}").build();
        }
        ExamHistory examHistory = examHistoryService.selectByID(id, userId);
        if (examHistory == null) {
            return Response.status(Response.Status.NOT_FOUND).entity("Exam history not found").build();
        }
        return Response.status(Response.Status.OK).entity(examHistory).build();
    }

    @POST
    @Path("/")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createExam(@HeaderParam("Authorization") String authHeader, ExamHistory examHistory) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        int userId = userService.getUserIdByAuthHeader(authHeader);

        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }

        examHistory.setUser_id(userId);
        examHistory.setExam_history_date(new java.util.Date());
        int result = examHistoryService.insert(examHistory);
        if (result == 0) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Failed to create exam history").build();
        }
        return Response.status(Response.Status.CREATED).entity(examHistory).build();
    }

}
