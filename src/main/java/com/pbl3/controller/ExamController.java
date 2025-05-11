package com.pbl3.controller;

import java.util.ArrayList;

import com.pbl3.dto.Exam;
import com.pbl3.service.ExamService;
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
    public Response getAllExams(@HeaderParam("Authorization") String token) {
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
    public Response getExamById(@HeaderParam("Authorization") String token, @PathParam("id") int id) {
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

    @POST
    @Path("/")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createExam(@HeaderParam("Authorization") String token, Exam exam) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
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
    public Response updateExam(@HeaderParam("Authorization") String token, @PathParam("id") int id, Exam exam) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
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
    public Response deleteExam(@HeaderParam("Authorization") String token, @PathParam("id") int id, Exam exam) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        exam.set_deleted(true);
        int result = examService.update(exam);
        if (result == 0) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Failed to delete exam").build();
        }
        return Response.status(Response.Status.OK).entity("Exam deleted successfully").build();
    }
}