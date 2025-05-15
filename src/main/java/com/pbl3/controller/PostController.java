package com.pbl3.controller;

import java.util.ArrayList;

import com.pbl3.dto.Post;
import com.pbl3.service.PostService;
import com.pbl3.service.AuthService;
import com.pbl3.util.JwtUtil;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/post")
public class PostController {
    private PostService postService;

    public PostController() {
        postService = new PostService();
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
            return Response.status(401).entity("Unauthorized").build();
        }

        ArrayList<Post> posts = postService.selectAll();
        if (posts == null) {
            return Response.status(404).entity("No posts found").build();
        }
        return Response.status(200).entity(posts).build();
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
            return Response.status(401).entity("Unauthorized").build();
        }

        Post post = postService.selectByID(id);
        if (post == null) {
            return Response.status(404).entity("Post not found").build();
        }
        return Response.status(200).entity(post).build();
    }

    @POST
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response createPost(@HeaderParam("Authorization") String authHeader, Post post) {
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

        int result = postService.insert(post);
        if (result == 0) {
            return Response.status(400).entity("Failed to create post").build();
        }
        return Response.status(201).entity("Post created successfully").build();
    }

    @PUT
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response updatePost(@HeaderParam("Authorization") String authHeader, @PathParam("id") int id, Post post) {
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

        int result = postService.update(post);
        if (result == 0) {
            return Response.status(400).entity("Failed to update post").build();
        }
        return Response.status(200).entity("Post updated successfully").build();
    }
    
    @PUT
    @Path("/delete/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteSubTopic(@HeaderParam("Authorization") String authHeader, @PathParam("id") int id, Post post) {
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
        post.set_deleted(true);
        int result = postService.update(post);
        if (result == 0) {
            return Response.status(400).entity("Failed to delete post").build();
        }
        return Response.status(200).entity("Post deleted successfully").build();
    }
}
