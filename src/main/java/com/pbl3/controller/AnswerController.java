package com.pbl3.controller;

import java.util.ArrayList;

import com.pbl3.dto.Answer;
import com.pbl3.service.AnswerService;
import com.pbl3.service.AnswerServiceInterface;
import com.pbl3.service.ReadingAnswerService;
import com.pbl3.util.JwtUtil;

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

@Path("/answers")
public class AnswerController {
    private AnswerServiceInterface answerService;
    private ReadingAnswerService readingAnswerService;
    private AnswerService answerServices;

    public AnswerController() {
        this.answerService = new AnswerService();
        this.readingAnswerService = new ReadingAnswerService();
        this.answerServices = new AnswerService();
    }

    private void chooseAnswerService(int type) {
        if (type == 1) {
            answerService = readingAnswerService;
        } else {
            answerService = answerServices;
        }
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAnswer(@HeaderParam("Authorization") String token, @PathParam("id") int id, @HeaderParam("type") Integer type) {
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
    public Response getAnswers(@HeaderParam("Authorization") String token, @HeaderParam("type") Integer type) {
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
    public Response createAnswer(@HeaderParam("Authorization") String token, Answer answer, @HeaderParam("type") Integer type) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        if (type != null) {
            chooseAnswerService(type);
        }
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
    public Response updateAnswer(@HeaderParam("Authorization") String token, @PathParam("id") int id, Answer answer, @HeaderParam("type") Integer type) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
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
    public Response deleteAnswer(@HeaderParam("Authorization") String token, @PathParam("id") int id, @HeaderParam("type") Integer type) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
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
