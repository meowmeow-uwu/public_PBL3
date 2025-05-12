package com.pbl3.controller;

import java.util.ArrayList;

import com.pbl3.dto.Topic;
import com.pbl3.service.TopicService;
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

    public TopicController() {
        topicService = new TopicService();
    }

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllTopics(@HeaderParam("Authorization") String token) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(401).entity("Unauthorized").build();
        }

        ArrayList<Topic> topics = topicService.selectAll();
        if (topics == null) {
            return Response.status(404).entity("No topics found").build();
        }
        return Response.status(200).entity(topics).build();
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getTopicById(@HeaderParam("Authorization") String token, @PathParam("id") int id) {
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
    public Response createTopic(@HeaderParam("Authorization") String token, Topic topic) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(401).entity("Unauthorized").build();
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
    public Response updateTopic(@HeaderParam("Authorization") String token, @PathParam("id") int id, Topic topic) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(401).entity("Unauthorized").build();
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
    public Response deleteTopic(@HeaderParam("Authorization") String token, @PathParam("id") int id) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(401).entity("Unauthorized").build();
        }

        int result = topicService.delete(id);
        if(result == -1) 
            return Response.status(400).entity("Can't delete default topic").build();
        if (result == 0) {
            return Response.status(400).entity("Failed to delete topic").build();
        }
        return Response.status(200).entity("Topic deleted successfully").build();
    }
}
