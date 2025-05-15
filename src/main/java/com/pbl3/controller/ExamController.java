package com.pbl3.controller;

import java.util.ArrayList;

import com.pbl3.dto.Exam;
import com.pbl3.service.ExamService;
import com.pbl3.service.AuthService;
import com.pbl3.util.JwtUtil;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/exam")
public class ExamController {
    private ExamService examService;

    public ExamController() {
        examService = new ExamService();
    }

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllExams(@HeaderParam("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        ArrayList<Exam> exams = examService.selectAll();
        if (exams != null) {
            return Response.status(Response.Status.OK).entity(exams).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getExamById(@HeaderParam("Authorization") String authHeader, @PathParam("id") int id) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        Exam exam = examService.selectByID(id);
        if (exam == null) {
            return Response.status(Response.Status.NOT_FOUND).entity("Exam not found").build();
        }
        return Response.status(Response.Status.OK).entity(exam).build();
    }

    @GET
    @Path("/subtopic/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getExamsBySubTopicId(@HeaderParam("Authorization") String authHeader, @PathParam("id") int id) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Invalid or expired token\"}").build();
        }
 
        ArrayList<Exam> exams = examService.getExamsBySubTopicId(id);
        if (exams == null) {
            return Response.status(Response.Status.NOT_FOUND).entity("Exams not found").build();
        }
        return Response.status(Response.Status.OK).entity(exams).build();
    }


    @POST
    @Path("/")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createExam(@HeaderParam("Authorization") String authHeader, Exam exam) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        if(!new AuthService().isContentManagerOrAdmin(token)) {
            return Response.status(403).entity("Forbidden").build();
        }
        int result = examService.insert(exam);
        if (result == 0) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Failed to create exam").build();
        }
        return Response.status(Response.Status.CREATED).entity(exam).build();
    }

    @PUT
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateExam(@HeaderParam("Authorization") String authHeader, @PathParam("id") int id, Exam exam) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        if(!new AuthService().isContentManagerOrAdmin(token)) {
            return Response.status(403).entity("Forbidden").build();
        }
        int result = examService.update(exam);
        if (result == 0) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Failed to update exam").build();
        }
        return Response.status(Response.Status.OK).entity(exam).build();
    }

    @PUT
    @Path("/delete/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteExam(@HeaderParam("Authorization") String authHeader, @PathParam("id") int id, Exam exam) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        if(!new AuthService().isContentManagerOrAdmin(token)) {
            return Response.status(403).entity("Forbidden").build();
        }
        exam.set_deleted(true);
        int result = examService.update(exam);
        if (result == 0) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Failed to delete exam").build();
        }
        return Response.status(Response.Status.OK).entity("Exam deleted successfully").build();
    }
}