package com.pbl3.controller;

import java.util.ArrayList;

import com.pbl3.dto.Answer;
import com.pbl3.service.AnswerService;

import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/answers")
public class AnswerController {
    private AnswerService answerService;
    
    public AnswerController() {
        this.answerService = new AnswerService();
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAnswer(@PathParam("id") int id) {
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
    public Response getAnswers() {
        ArrayList<Answer> answers = answerService.selectAll();
        return Response.ok(answers).build();
    }

    @POST
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response createAnswer(Answer answer) {
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
    public Response updateAnswer(@PathParam("id") int id, Answer answer) {
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
    public Response deleteAnswer(@PathParam("id") int id) {
        int result = answerService.delete(id);
        if (result > 0) {
            return Response.status(Response.Status.OK).build();
        } else {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
    }

}
