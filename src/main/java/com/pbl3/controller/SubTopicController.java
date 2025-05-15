package com.pbl3.controller;

import java.util.ArrayList;
import com.pbl3.dto.SubTopic;
import com.pbl3.dto.Post;
import com.pbl3.dto.Exam;
import com.pbl3.service.SubTopicService;
import com.pbl3.service.PostService;
import com.pbl3.service.ExamService;
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
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/subtopic")
public class SubTopicController {
    private final SubTopicService subTopicService;
    private final PostService postService;
    private final ExamService examService;

    public SubTopicController() {
        subTopicService = new SubTopicService();
        postService = new PostService();
        examService = new ExamService();
    }

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllSubTopics(@HeaderParam("Authorization") String authHeader) {
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

        ArrayList<SubTopic> subTopics = subTopicService.selectAll();
        if (subTopics == null) {
            return Response.status(404).entity("No subtopics found").build();
        }
        return Response.status(200).entity(subTopics).build();
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getSubTopicById(@HeaderParam("Authorization") String authHeader, @PathParam("id") int id) {
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

        SubTopic subTopic = subTopicService.selectByID(id);
        if (subTopic == null) {
            return Response.status(404).entity("Subtopic not found").build();
        }
        return Response.status(200).entity(subTopic).build();
    }

    @POST
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response createSubTopic(@HeaderParam("Authorization") String authHeader, SubTopic subTopic) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(401).entity("Unauthorized").build();
        }

        if(!new AuthService().isContentManagerOrAdmin(authHeader)) {
            return Response.status(403).entity("Forbidden").build();
        }

        int result = subTopicService.insert(subTopic);
        if (result == 0) {
            return Response.status(400).entity("Failed to create subtopic").build();
        }
        return Response.status(201).entity("Subtopic created successfully").build();
    }

    @PUT
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateSubTopic(@HeaderParam("Authorization") String authHeader, @PathParam("id") int id, SubTopic subTopic) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(401).entity("Unauthorized").build();
        }

        if(!new AuthService().isContentManagerOrAdmin(authHeader)) {
            return Response.status(403).entity("Forbidden").build();
        }

        int result = subTopicService.update(subTopic);
        if (result == 0) {
            return Response.status(400).entity("Failed to update subtopic").build();
        }
        return Response.status(200).entity("Subtopic updated successfully").build();
    }
    
    @DELETE
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteSubTopic(@HeaderParam("Authorization") String authHeader, @PathParam("id") int id) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(401).entity("Unauthorized").build();
        }

        if(!new AuthService().isContentManagerOrAdmin(authHeader)) {
            return Response.status(403).entity("Forbidden").build();
        }

        int result = subTopicService.delete(id);
        if(result == -1) {
            return Response.status(400).entity("Can't delete default subtopic").build();
        }
        if (result == 0) {
            return Response.status(400).entity("Failed to delete subtopic").build();
        }
        return Response.status(200).entity("Subtopic deleted successfully").build();
    }

    @GET
    @Path("/{subTopicId}/posts")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getPostsBySubTopicId(
            @HeaderParam("Authorization") String authHeader,
            @PathParam("subTopicId") int subTopicId) {
        try {
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

            SubTopic subtopic = subTopicService.selectByID(subTopicId);
            if (subtopic == null) {
                return Response.status(404)
                        .entity("{\"error\": \"SubTopic not found\"}")
                        .build();
            }

            ArrayList<Post> posts = postService.getPostsBySubTopicId(subTopicId);
            return Response.ok(posts).build();
        } catch (Exception e) {
            return Response.status(500)
                    .entity("{\"error\": \"" + e.getMessage() + "\"}")
                    .build();
        }
    }

    @GET
    @Path("/{subTopicId}/exams")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getExamsBySubTopicId(
            @HeaderParam("Authorization") String authHeader,
            @PathParam("subTopicId") int subTopicId) {
        try {
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

            SubTopic subtopic = subTopicService.selectByID(subTopicId);
            if (subtopic == null) {
                return Response.status(404)
                        .entity("{\"error\": \"SubTopic not found\"}")
                        .build();
            }

            ArrayList<Exam> exams = examService.getExamsBySubTopicId(subTopicId);
            return Response.ok(exams).build();
        } catch (Exception e) {
            return Response.status(500)
                    .entity("{\"error\": \"" + e.getMessage() + "\"}")
                    .build();
        }
    }
}
