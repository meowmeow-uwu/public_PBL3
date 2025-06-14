package com.pbl3.controller;

import java.util.ArrayList;
import java.util.LinkedHashMap;

import com.pbl3.dto.Answer;
import com.pbl3.dto.Question;
import com.pbl3.service.AnswerService;
import com.pbl3.service.AuthService;
import com.pbl3.service.QuestionService;
import com.pbl3.util.JwtUtil;
import java.util.List;
import java.util.Map;

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

@Path("/questions")
public class QuestionController {
    private QuestionService questionService;
    private AnswerService answerService;
    public QuestionController() {
        questionService = new QuestionService();
        answerService = new AnswerService();
    }
    
    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getQuestion(@HeaderParam("Authorization") String authHeader, @PathParam("id") int id) {
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
        Question question = questionService.selectByID(id);
        if (question != null) {
            return Response.ok(question).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getQuestions(@HeaderParam("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        ArrayList<Question> questions = questionService.selectAll();
        if (questions != null) {
            return Response.ok(questions).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    @POST
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response createQuestion(@HeaderParam("Authorization") String authHeader, @PathParam("id") int id, Question question) {
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
        int result = questionService.insert(question, id);
        if (result > 0) {
            return Response.status(Response.Status.CREATED).build();
        } else {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
    }

    @PUT
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateQuestion(@HeaderParam("Authorization") String authHeader, @PathParam("id") int id, Question question) {
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
        question.setQuestion_id(id);
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
    public Response deleteQuestion(@HeaderParam("Authorization") String authHeader, @PathParam("id") int id) {
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
        int result = questionService.delete(id);
        if(result == -1) 
            return Response.status(400).entity("Can't delete default").build();
        if (result == 0) {
            return Response.status(409).entity("Failed to delete question").build();
        }
        return Response.status(200).entity("Question deleted successfully").build();
    }

    @GET
    @Path("/{id}/answers")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAnswers(@HeaderParam("Authorization") String authHeader, @PathParam("id") int id) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        AnswerService answerService = new AnswerService();
        ArrayList<Answer> answers = answerService.selectByQuestionID(id);
        if (answers != null) {
            return Response.ok(answers).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    @GET
    @Path("/{id}/temp-answers")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getTempAnswers(@HeaderParam("Authorization") String authHeader, @PathParam("id") int id) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        AnswerService answerService = new AnswerService();
        ArrayList<Answer> answers = answerService.selectTempByQuestionID(id);
        if (answers != null) {
            return Response.ok(answers).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    @GET
    @Path("/exam/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getQuestionsByExamID(@HeaderParam("Authorization") String authHeader, @PathParam("id") int id) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        try {
            ArrayList<Question> questions = questionService.selectByExamID(id);
            
            if (questions == null || questions.isEmpty()) {
                return Response.status(Response.Status.NOT_FOUND)
                               .entity("{\"error\":\"Exam with ID " + id + " not found.\"}").build();
            }
    
            List<Map<String, Object>> responseData = new ArrayList<>();
    
            for (Question question : questions) {
                Map<String, Object> questionMap = new LinkedHashMap<>();
                
                questionMap.put("question_id", question.getQuestion_id());
                questionMap.put("content", question.getContent());
                questionMap.put("question_type_id", question.getQuestion_type_id());
                
                ArrayList<Answer> answersForThisQuestion;
                answersForThisQuestion = answerService.selectTempByQuestionID(question.getQuestion_id());
                
                if (answersForThisQuestion == null) {
                    answersForThisQuestion = new ArrayList<>();
                }
                
                questionMap.put("answers", answersForThisQuestion);
                
                responseData.add(questionMap);
            }
    
            return Response.ok(responseData).build();
    
        } catch (Exception e) {
            System.err.println("An unexpected error occurred in getQuestionsByExamID: " + e.getMessage());
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                           .entity("{\"error\":\"An internal server error occurred...\"}")
                           .build();
        }
    }
}
