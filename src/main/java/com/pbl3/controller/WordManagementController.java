/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.controller;

import com.pbl3.dto.Word;
import com.pbl3.service.AuthService;
import com.pbl3.service.WordService;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.FormParam;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.Map;

/**
 *
 * @author Hoang Duong
 */
@Path("admin/words")
public class WordManagementController {

    private final WordService wordService = new WordService();
    private final AuthService authService = new AuthService();

    @GET
    @Path("{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getWord(@HeaderParam("authorization") String authHeader,
            @PathParam("id") int id) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        if (!authService.isAdmin(authHeader) && !authService.isContentManager(authHeader)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"Access denied\"}").build();
        }
        Word Word = wordService.selectByID(id);

        if (Word == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"Word not found\"}")
                    .build();
        }
        return Response.ok(Word).build();
    }

    @GET
    @Path("/list/{page_number}/{pagesize}/{language_id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getWordsByPageLanguageKeyword(@HeaderParam("authorization") String authHeader,
            @PathParam("page_number") int pageNumber,
            @PathParam("pagesize") int pageSize,
            @PathParam("language_id") int languageId,
            @QueryParam("keyword") String keyword) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        if (!authService.isAdmin(authHeader) && !authService.isContentManager(authHeader)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"Access denied\"}").build();
        }
        if (keyword == null || keyword.equalsIgnoreCase("null")) {
            keyword = "";
        }
        Map<String,Object> list = wordService.getWordsByPage(pageNumber, pageSize, languageId, keyword);
        if (list == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"Word not found\"}")
                    .build();
        }
        return Response.ok(list).build();
    }

    @POST
    @Path("/create")
    @Produces(MediaType.APPLICATION_JSON)
    public Response insertWord(@HeaderParam("authorization") String authHeader,
            @FormParam("word_name") String wordName,
            @FormParam("pronunciation") String pronunciation,
            @FormParam("sound") String sound,
            @FormParam("language_id") int languageId) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        if (!authService.isAdmin(authHeader) && !authService.isContentManager(authHeader)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"Access denied\"}").build();
        }
        Word word = new Word();
        word.setLanguage_id(languageId);
        word.setPronunciation(pronunciation);
        word.setSound(sound);
        word.setWord_name(wordName);
        word.set_deleted(false);
        int isInserted = wordService.insert(word);

        if (isInserted != 0) {
            return Response.status(Response.Status.CREATED)
                    .entity("{\"message\":\"Word created successfully\"}")
                    .build();
        } else {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\":\"Failed to create Word\"}")
                    .build();
        }
    }

    @PUT
    @Path("/update")
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateWord(@HeaderParam("authorization") String authHeader,
            @FormParam("id") int id,
            @FormParam("word_name") String wordName,
            @FormParam("pronunciation") String pronunciation,
            @FormParam("sound") String sound,
            @FormParam("language_id") int languageId) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        if (!authService.isAdmin(authHeader) && !authService.isContentManager(authHeader)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"Access denied\"}").build();
        }
        Word word = new Word();
        word.setWord_id(id);
        word.setLanguage_id(languageId);
        word.setPronunciation(pronunciation);
        word.setSound(sound);
        word.setWord_name(wordName);
        word.set_deleted(false);
        int isUpdated = wordService.update(word);

        if (isUpdated != 0) {
            return Response.ok("{\"message\":\"Word updated successfully\"}").build();
        } else {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"Word not found\"}")
                    .build();
        }
    }

    @DELETE
    @Path("delete/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteWord(@HeaderParam("authorization") String authHeader,
            @PathParam("id") int id) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        if (!authService.isAdmin(authHeader) && !authService.isContentManager(authHeader)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"Access denied\"}").build();
        }

        int resultId = wordService.delete(id);
        if (resultId > 0) {
            return Response.ok()
                    .entity("{\"message\":\"Word deleted successfully\"}").build();
        } else {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"Failed to delete word\"}").build();
        }
    }

}
