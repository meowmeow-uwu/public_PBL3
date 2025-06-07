package com.pbl3.controller;

import java.util.ArrayList;

import com.pbl3.dto.Answer;
import com.pbl3.service.AnswerService;
import com.pbl3.service.AnswerServiceInterface;
import com.pbl3.service.AuthService;
import com.pbl3.util.JwtUtil;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/answers")
public class AnswerController {
    private AnswerServiceInterface answerService;
    private AnswerService answerServices;

    public AnswerController() {
        this.answerService = new AnswerService();
        this.answerServices = new AnswerService();
    }

    private void chooseAnswerService(int type) {
            answerService = answerServices;
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAnswer(@HeaderParam("Authorization") String authHeader, @HeaderParam("type") Integer type, @PathParam("id") int id) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        if (type != null) {
            chooseAnswerService(type);
        }
        Answer answer = answerService.selectByID(id);
        if (answer != null) {
            return Response.ok(answer).build();
        } else {    
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAnswers(@HeaderParam("Authorization") String authHeader, @HeaderParam("type") Integer type) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        if (type != null) {
            chooseAnswerService(type);
        }
        ArrayList<Answer> answers = answerService.selectAll();
        return Response.ok(answers).build();
    }

    @POST
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public Response createAnswer(@HeaderParam("Authorization") String authHeader, @HeaderParam("type") Integer type, Answer answer) {

    System.out.println(">>> [POST] Received Answer: " + (answer == null ? "NULL" : answer.toString())); 

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        if(!new AuthService().isContentManagerOrAdmin(authHeader)) {
            return Response.status(403).entity("Forbidden").build();
        }
        if (type != null) {
            chooseAnswerService(type);
        }
        // if(answer.isCorrect()) answer.set
        int result = answerService.insert(answer);
        if (result > 0) {
            return Response.status(Response.Status.CREATED).build();
        } else {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
    }   

    @PUT
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateAnswer(@HeaderParam("Authorization") String authHeader, @PathParam("id") int id, Answer answer, @HeaderParam("type") Integer type) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        if(!new AuthService().isContentManagerOrAdmin(authHeader)) {
            return Response.status(403).entity("Forbidden").build();
        }
        if (type != null) {
            chooseAnswerService(type);
        }
        answer.setAnswer_id(id);
        int result = answerService.update(answer);
        if (result > 0) {
            return Response.status(Response.Status.OK).build();
        } else {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
    }

    @DELETE
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteAnswer(@HeaderParam("Authorization") String authHeader, @PathParam("id") int id, @HeaderParam("type") Integer type) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        if(!new AuthService().isContentManagerOrAdmin(authHeader)) {
            return Response.status(403).entity("Forbidden").build();
        }
        if (type != null) {
            chooseAnswerService(type);
        }
        int result = answerService.delete(id);
        if (result > 0) {
            return Response.status(Response.Status.OK).build();
        } else {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
    }

}
