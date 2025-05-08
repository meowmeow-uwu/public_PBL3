package com.pbl3.controller;

import java.util.List;
import java.util.Map;

import com.pbl3.service.CollectionService;
import com.pbl3.util.JwtUtil;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.FormParam;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("collections")
public class CollectionController {
    private CollectionService collectionService = new CollectionService();

    // Tạo bộ sưu tập mới
    @POST
    @Path("create")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createCollection(
        @HeaderParam("Authorization") String token,
        @FormParam("name") String name,
        @FormParam("isPublic") boolean isPublic
    ) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }

        int collectionId = collectionService.createCollection(name, isPublic, userId);
        if (collectionId > 0) {
            return Response.ok("{\"collectionId\": " + collectionId + "}").build();
        }
        return Response.status(Response.Status.BAD_REQUEST).build();
    }

    // Thêm từ vào bộ sưu tập
    @POST
    @Path("{collectionId}/words/{wordId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response addWordToCollection(
        @HeaderParam("Authorization") String token,
        @PathParam("collectionId") int collectionId,
        @PathParam("wordId") int wordId
    ) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }

        boolean success = collectionService.addWordToCollection(collectionId, wordId);
        return success ? Response.ok().build() : Response.status(Response.Status.BAD_REQUEST).build();
    }

    // Lấy danh sách từ trong bộ sưu tập
    @GET
    @Path("{collectionId}/words")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getWordsInCollection(
        @HeaderParam("Authorization") String token,
        @PathParam("collectionId") int collectionId
    ) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }

        List<Map<String, Object>> words = collectionService.getWordsInCollection(collectionId);
        return Response.ok(words).build();
    }

    // Lấy danh sách bộ sưu tập của user
    @GET
    @Path("user")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUserCollections(
        @HeaderParam("Authorization") String token
    ) {
        try {
            int userId = JwtUtil.getUserIdFromToken(token);
            if (userId == -1) {
                return Response.status(Response.Status.UNAUTHORIZED).build();
            }

            List<Map<String, Object>> collections = collectionService.getUserCollections(userId);
            return Response.ok(collections).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                          .entity("{\"error\":\"" + e.getMessage() + "\"}")
                          .build();
        }
    }

    // Cập nhật bộ sưu tập
    @PUT
    @Path("{collectionId}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateCollection(
        @HeaderParam("Authorization") String token,
        @PathParam("collectionId") int collectionId,
        @FormParam("name") String name,
        @FormParam("isPublic") boolean isPublic
    ) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }

        if (!collectionService.hasAccessToCollection(userId, collectionId)) {
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        boolean success = collectionService.updateCollection(collectionId, name, isPublic);
        return success ? Response.ok().build() : Response.status(Response.Status.BAD_REQUEST).build();
    }

    // Xóa bộ sưu tập
    @DELETE
    @Path("{collectionId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteCollection(
        @HeaderParam("Authorization") String token,
        @PathParam("collectionId") int collectionId
    ) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }

        if (!collectionService.hasAccessToCollection(userId, collectionId)) {
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        boolean success = collectionService.deleteCollection(collectionId);
        return success ? Response.ok().build() : Response.status(Response.Status.BAD_REQUEST).build();
    }
}
