package com.pbl3.controller;

import com.pbl3.dto.Translate;
import com.pbl3.service.AuthService;
import com.pbl3.service.TranslationService;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.FormParam;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Map;

@Path("translate")
public class TranslationController {

    private final TranslationService translationService = new TranslationService();
    private final AuthService authService = new AuthService();

    // Định nghĩa constant cho language
    private static final int ENGLISH_LANGUAGE_ID = 1;
    private static final int VIETNAMESE_LANGUAGE_ID = 2;

    @GET
    @Path("{sourceWord}/{sourceLanguageId}/{targetLanguageId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response translateWord(
            @PathParam("sourceWord") String sourceWord,
            @PathParam("sourceLanguageId") int sourceLanguageId,
            @PathParam("targetLanguageId") int targetLanguageId
    ) {
        // Kiểm tra sourceLanguageId
        if ((sourceLanguageId != ENGLISH_LANGUAGE_ID && sourceLanguageId != VIETNAMESE_LANGUAGE_ID)
                || (targetLanguageId != ENGLISH_LANGUAGE_ID && targetLanguageId != VIETNAMESE_LANGUAGE_ID)) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"Invalid language ID. Use 1 for English or 2 for Vietnamese\"}")
                    .build();
        }

        // Gọi service với sourceLanguageId và targetLanguageId tương ứng
        List<Map<String, Object>> results = translationService.translateWord(
                sourceWord,
                sourceLanguageId,
                targetLanguageId
        );

        if (results != null && !results.isEmpty()) {
            return Response.ok(results).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"No matching words found\"}")
                    .build();
        }
    }

    @POST
    @Path("/create")
    @Produces(MediaType.APPLICATION_JSON)
    public Response createTranslate(@HeaderParam("authorization") String authHeader,
            @FormParam("sourceId") int sourceId,
            @FormParam("targetId") int targetId,
            @FormParam("typeTranslateId") int typeTranslateId) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        if (!authService.isContentManagerOrAdmin(authHeader)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"Access denied\"}").build();
        }
        Translate translate = new Translate();
        translate.setSource_word_id(sourceId);
        translate.setTrans_word_id(targetId);
        translate.setType_translate_id(typeTranslateId);
        int isInserted = translationService.insert(translate);
        
        if (isInserted > 0) {
            return Response.status(Response.Status.CREATED)
                    .entity("{\"message\":\"Translate created successfully\"}")
                    .build();
        } else {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"Failed to create Translate\"}")
                    .build();
        }
    }
    @PUT
    @Path("/update")
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateTranslate(@HeaderParam("authorization") String authHeader,
            @FormParam("id") int id,
            @FormParam("sourceId") int sourceId,
            @FormParam("targetId") int targetId,
            @FormParam("typeTranslateId") int typeTranslateId) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        if (!authService.isContentManagerOrAdmin(authHeader)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"Access denied\"}").build();
        }
        Translate translate = new Translate();
        translate.setTranslate_id(id);
        translate.setSource_word_id(sourceId);
        translate.setTrans_word_id(targetId);
        translate.setType_translate_id(typeTranslateId);
        int isUpdated = translationService.update(translate);
        
        if (isUpdated != 0) {
            return Response.status(Response.Status.OK)
                    .entity("{\"message\":\"Translate updated successfully\"}")
                    .build();
        } else {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"Failed to update Translate\"}")
                    .build();
        }
    }

    @DELETE
    @Path("/delete/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteTranslate(@HeaderParam("authorization") String authHeader,
            @PathParam("id") int id) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        if (!authService.isContentManagerOrAdmin(authHeader)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"Access denied\"}").build();
        }
        int isDeleted = translationService.delete(id);
        if (isDeleted != 0) {
            return Response.status(Response.Status.OK)
                    .entity("{\"message\":\"Translate deleted successfully\"}")
                    .build();
        } else {
            return Response.status(Response.Status.BAD_REQUEST) 
                    .entity("{\"error\":\"Failed to delete Translate\"}")
                    .build();
        }
    }
    @GET
    @Path("/get/{id}/{type}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getTranslateByWordId(@PathParam("id") int wid,
                                         @PathParam("type") int typeId) {
        
        List<Translate> translates = translationService.selectAllByWordIdAndType(wid,typeId);
        return Response.ok(translates).build();
    }   

}
