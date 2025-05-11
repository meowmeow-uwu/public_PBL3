package com.pbl3.controller;

import java.util.ArrayList;

import com.pbl3.dto.Answer;
import com.pbl3.dto.ReadingQuestion;
import com.pbl3.service.ReadingAnswerService;
import com.pbl3.service.ReadingQuestionService;

import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/reading-questions")
public class ReadingQuestionController {
    private ReadingQuestionService questionService;

    public ReadingQuestionController() {
        questionService = new ReadingQuestionService();
    }
    
    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getQuestion(@PathParam("id") int id) {
        ReadingQuestion question = questionService.selectByID(id);
        if (question != null) {
            return Response.ok(question).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getQuestions() {
        ArrayList<ReadingQuestion> questions = questionService.selectAll();
        return Response.ok(questions).build();
    }

    @POST
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response createQuestion(ReadingQuestion question) {
        int result = questionService.insert(question);
        if (result > 0) {
            return Response.status(Response.Status.CREATED).build();
        } else {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
    }

    @PUT
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateQuestion(@PathParam("id") int id, ReadingQuestion question) {
        question.setReading_question_id(id);
        int result = questionService.update(question);
        if (result > 0) {
            return Response.status(Response.Status.OK).build();
        } else {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
    }

    @DELETE
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteQuestion(@PathParam("id") int id) {
        int result = questionService.delete(id);
        if (result > 0) {
            return Response.status(Response.Status.OK).build();
        } else {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
    }

    @GET
    @Path("/{id}/answers")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAnswers(@PathParam("id") int id) {
        ReadingAnswerService answerService = new ReadingAnswerService();
        ArrayList<Answer> answers = answerService.selectByQuestionID(id);
        return Response.ok(answers).build();
    }
}
