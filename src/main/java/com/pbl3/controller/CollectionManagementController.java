package com.pbl3.controller;

import java.util.List;
import java.util.Map;

import com.pbl3.dto.Collection;
import com.pbl3.service.AuthService;
import com.pbl3.service.CollectionManagementService;
import com.pbl3.service.UserService;
import com.pbl3.util.JwtUtil;
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
public class CollectionManagementController {
    private CollectionManagementService collectionService = CollectionManagementService.getInstance();
    private final AuthService authService = new AuthService();
    private final UserService userService = new UserService();
    private final int CID = -1;
    private static boolean Public = true;
    // Tạo bộ sưu tập mới
    @POST
    @Path("/create")
    @Produces(MediaType.APPLICATION_JSON)
    public Response createCollection(
        @HeaderParam("authorization") String authHeader,
        @FormParam("name") String name,
        @FormParam("isPublic") boolean isPublic
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        if (!authService.isAdmin(authHeader) && !authService.isContentManager(authHeader)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"Access denied\"}").build();
        }
        
        if(!collectionService.isAccessed(userService.getUserIdByAuthHeader(authHeader))){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        Public = isPublic;
        Collection collection = new Collection(CID, name, Public);
        int collectionId = collectionService.insert(collection);
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
        if(!collectionService.isAccessed(userId)){
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        int success = collectionService.addWordToCollection(collectionId, wordId);
        return success != 0 ? Response.ok().build() : Response.status(Response.Status.BAD_REQUEST).build();
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
        if (userId == -1 || !collectionService.isAccessed(userId)) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }

        List<Map<String, Object>> words = collectionService.getWordsInCollection(collectionId);
        return Response.ok(words).build();
    }

    // Lấy danh sách bộ sưu tập
    @GET
    @Path("all")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUserCollections(
        @HeaderParam("Authorization") String token
    ) {
        try {
            int userId = JwtUtil.getUserIdFromToken(token);
            if (userId == -1) {
                return Response.status(Response.Status.UNAUTHORIZED).build();
            }

            List<Map<String, Object>> collections = collectionService.getAllPublicCollections();
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

        if (!collectionService.isAccessed(userId)) {
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

        if (!collectionService.isAccessed(userId)) {
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        boolean success = collectionService.deleteCollection(collectionId);
        return success ? Response.ok().build() : Response.status(Response.Status.BAD_REQUEST).build();
    }

    //Xóa 1 từ khỏi bộ sưu tập
    @DELETE
    @Path("{collectionId}/delete-word")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteWordFromCollection(
        @HeaderParam("Authorization") String token,
        @PathParam("collectionId") int collectionId,
        @FormParam("wordId") int wordId
    ) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }

        if (!collectionService.isAccessed(userId)) {
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        int success = collectionService.deleteWordFromCollection(collectionId, wordId);
        return success != 0 ? Response.ok().build() : Response.status(Response.Status.BAD_REQUEST).build();
    }


}
