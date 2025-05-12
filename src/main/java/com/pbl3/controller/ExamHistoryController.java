package com.pbl3.controller;

import java.util.ArrayList;

import com.pbl3.dto.ExamHistory;
import com.pbl3.service.ExamHistoryService;
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

@Path("/exam-history")
public class ExamHistoryController {
    private ExamHistoryService examHistoryService;

    public ExamHistoryController() {
        examHistoryService = new ExamHistoryService();
    }

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllExams(@HeaderParam("Authorization") String token) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        ArrayList<ExamHistory> examHistories = examHistoryService.selectAll(userId);
        if (examHistories != null) {
            return Response.status(Response.Status.OK).entity(examHistories).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getExamByID(@HeaderParam("Authorization") String token, @PathParam("id") int id) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
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
    public Response createExam(@HeaderParam("Authorization") String token, ExamHistory examHistory) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        examHistory.setUser_id(userId);
        int result = examHistoryService.insert(examHistory);
        if (result == 0) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Failed to create exam history").build();
        }
        return Response.status(Response.Status.CREATED).entity(examHistory).build();
    }

    @PUT
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateExam(@HeaderParam("Authorization") String token, @PathParam("id") int id, ExamHistory examHistory) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        examHistory.setUser_id(userId);
        int result = examHistoryService.update(examHistory);
        if (result == 0) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Failed to update exam history").build();
        }
        return Response.status(Response.Status.OK).entity(examHistory).build();
    }

    @DELETE
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteExamHistory(@HeaderParam("Authorization") String token, @PathParam("id") int id) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        int result = examHistoryService.delete(id, userId);
        if (result == 0) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Failed to delete exam history").build();
        }
        return Response.status(Response.Status.OK).entity("Exam history deleted successfully").build();
    }
}