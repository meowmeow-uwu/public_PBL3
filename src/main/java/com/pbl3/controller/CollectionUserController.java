package com.pbl3.controller;

import com.pbl3.dto.Collection;
import java.util.List;
import java.util.Map;

import com.pbl3.service.CollectionUserService;
import com.pbl3.service.UserService;

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
public class CollectionUserController {

    private static final boolean isPublic = false;
    private final CollectionUserService collectionService = CollectionUserService.getInstance();

    private final UserService userService = new UserService();

    @POST
    @Path("Add/{collectionId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response addUserIntoCollection(
            @HeaderParam("authorization") String authHeader,
            @FormParam("collectionId") int collectionId
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        int userId = userService.getUserIdByAuthHeader(authHeader);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        int success = collectionService.addUserToCollection(collectionId, userId);

        return success != 0 ? Response.ok().build() : Response.status(Response.Status.BAD_REQUEST).build();

    }

    // Tạo bộ sưu tập mới
    @POST
    @Path("create")
    @Produces(MediaType.APPLICATION_JSON)

    public Response createCollection(
            @HeaderParam("authorization") String authHeader,
            @FormParam("name") String name
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        int userId = userService.getUserIdByAuthHeader(authHeader);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }

        int collectionId = collectionService.createCollection(name, isPublic, userId);
        if (collectionId > 0) {
            return Response.ok("{\"collectionId\": " + collectionId + "}").build();
        }
        return Response.status(Response.Status.BAD_REQUEST).build();
    }

    // Thêm 1 từ vào bộ sưu tập
    @POST
    @Path("{collectionId}/words/{wordId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response addWordToCollection(
            @HeaderParam("Authorization") String authHeader,
            @PathParam("collectionId") int collectionId,
            @PathParam("wordId") int wordId
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        int userId = userService.getUserIdByAuthHeader(authHeader);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        Collection collection = collectionService.selectByID(collectionId);

        if (collection.isPublic() == true) {
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        if (!collectionService.hasAccessToCollection(userId, collectionId)) {
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
            @HeaderParam("Authorization") String authHeader,
            @PathParam("collectionId") int collectionId
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        int userId = userService.getUserIdByAuthHeader(authHeader);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        Collection collection = collectionService.selectByID(collectionId);
        if (!collectionService.hasAccessToCollection(userId, collectionId) && collection.isPublic() == false) {
            return Response.status(Response.Status.FORBIDDEN).build();
        }

        List<Map<String, Object>> words = collectionService.getWordsInCollection(collectionId);
        return Response.ok(words).build();
    }

    // Lấy danh sách bộ sưu tập của user
    @GET
    @Path("user")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUserCollections(
            @HeaderParam("Authorization") String authHeader
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        try {
            int userId = userService.getUserIdByAuthHeader(authHeader);
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
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateCollection(
            @HeaderParam("Authorization") String authHeader,
            @PathParam("collectionId") int collectionId,
            @FormParam("name") String name
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        int userId = userService.getUserIdByAuthHeader(authHeader);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        Collection collection = collectionService.selectByID(collectionId);

        if (collection.isPublic() == true) {
            return Response.status(Response.Status.FORBIDDEN).build();
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
            @HeaderParam("Authorization") String authHeader,
            @PathParam("collectionId") int collectionId
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        int userId = userService.getUserIdByAuthHeader(authHeader);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }

        if (!collectionService.hasAccessToCollection(userId, collectionId)) {
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        Collection collection = collectionService.selectByID(collectionId);
        boolean success = false;
        if (collection.isPublic() == true) {
            success = collectionService.deleteUserFromCollection(collectionId, userId);
        } else {
            success = collectionService.deleteCollection(collectionId);
        }
        return (success) ? Response.ok().build() : Response.status(Response.Status.BAD_REQUEST).build();
    }

    //Xóa 1 từ khỏi bộ sưu tập
    @DELETE
    @Path("{collectionId}/delete-word")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteWordFromCollection(
            @HeaderParam("Authorization") String authHeader,
            @PathParam("collectionId") int collectionId,
            @FormParam("wordId") int wordId
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        int userId = userService.getUserIdByAuthHeader(authHeader);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }

        if (!collectionService.hasAccessToCollection(userId, collectionId)) {
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        Collection collection = collectionService.selectByID(collectionId);
        if (collection.isPublic() == true) {
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        int success = collectionService.deleteWordFromCollection(collectionId, wordId);

        return success != 0 ? Response.ok().build() : Response.status(Response.Status.BAD_REQUEST).build();
    }

}
