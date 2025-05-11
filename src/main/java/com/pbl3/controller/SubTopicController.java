package com.pbl3.controller;

import java.util.ArrayList;

import com.pbl3.dto.SubTopic;
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

@Path("/subtopic")
public class SubTopicController {
    private SubTopicService subTopicService;

    public SubTopicController() {
        subTopicService = new SubTopicService();
    }

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllSubTopics(@HeaderParam("Authorization") String token) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(401).entity("Unauthorized").build();
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
    public Response getSubTopicById(@HeaderParam("Authorization") String token, @PathParam("id") int id) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(401).entity("Unauthorized").build();
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
    public Response createSubTopic(@HeaderParam("Authorization") String token, SubTopic subTopic) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(401).entity("Unauthorized").build();
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
    public Response updateSubTopic(@HeaderParam("Authorization") String token, @PathParam("id") int id, SubTopic subTopic) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(401).entity("Unauthorized").build();
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
    public Response deleteSubTopic(@HeaderParam("Authorization") String token, @PathParam("id") int id) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(401).entity("Unauthorized").build();
        }

        int result = subTopicService.delete(id);
        if (result == 0) {
            return Response.status(400).entity("Failed to delete subtopic").build();
        }
        return Response.status(200).entity("Subtopic deleted successfully").build();
    }
}
