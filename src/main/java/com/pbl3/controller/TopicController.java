package com.pbl3.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import com.pbl3.dto.Topic;
import com.pbl3.dto.SubTopic;
import com.pbl3.service.TopicService;
import com.pbl3.service.AuthService;
import com.pbl3.service.SubTopicService;
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

@Path("/topic")
public class TopicController {
    private TopicService topicService;
    private SubTopicService subTopicService;

    public TopicController() {
        topicService = new TopicService();
        subTopicService = new SubTopicService();
    }

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllTopics(@HeaderParam("Authorization") String authHeader) {
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

        ArrayList<Topic> topics = topicService.selectAll();
        if (topics == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"No topics found\"}").build();
        }
        return Response.ok(topics).build();
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getTopicById(@HeaderParam("Authorization") String authHeader, @PathParam("id") int id) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(401).entity("Unauthorized").build();
        }

        Topic topic = topicService.selectByID(id);
        if (topic == null) {
            return Response.status(404).entity("Topic not found").build();
        }
        return Response.status(200).entity(topic).build();
    }

    @POST
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response createTopic(@HeaderParam("Authorization") String authHeader, Topic topic) {
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

        int result = topicService.insert(topic);
        if (result == 0) {
            return Response.status(400).entity("Failed to create topic").build();
        }
        return Response.status(201).entity("Topic created successfully").build();
    }

    @PUT
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateTopic(@HeaderParam("Authorization") String authHeader, @PathParam("id") int id, Topic topic) {
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

        int result = topicService.update(topic);
        if (result == 0) {
            return Response.status(400).entity("Failed to update topic").build();
        }
        return Response.status(200).entity("Topic updated successfully").build();
    }
    
    @DELETE
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteTopic(@HeaderParam("Authorization") String authHeader, @PathParam("id") int id) {
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

        int result = topicService.delete(id);
        if(result == -1) 
            return Response.status(400).entity("Can't delete default topic").build();
        if (result == 0) {
            return Response.status(409).entity("Failed to delete topic").build();
        }
        return Response.status(200).entity("Topic deleted successfully").build();
    }

    @GET
    @Path("/{topicId}/subtopics")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getSubTopicsByTopicId(
            @HeaderParam("Authorization") String authHeader,
            @PathParam("topicId") int topicId) {
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


            Topic topic = topicService.selectByID(topicId);
            if (topic == null) {
                return Response.status(404)
                        .entity("{\"error\": \"Topic not found\"}")
                        .build();
            }

            ArrayList<SubTopic> subtopics = subTopicService.selectByTopicId(topicId);

            return Response.ok(subtopics).build();
        } catch (Exception e) {
            return Response.status(500)
                    .entity("{\"error\": \"" + e.getMessage() + "\"}")
                    .build();
        }
    }
}
