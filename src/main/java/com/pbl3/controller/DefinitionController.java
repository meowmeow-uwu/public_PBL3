/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.controller;

import com.pbl3.dto.Definition;
import com.pbl3.service.AuthService;
import com.pbl3.service.DefinitionService;
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
import java.util.List;

/**
 *
 * @author Hoang Duong
 */
@Path("/definitions")
public class DefinitionController {

    private final AuthService authService = new AuthService();
    private final DefinitionService definitionService = new DefinitionService();

    @POST
    @Path("/create")
    @Produces(MediaType.APPLICATION_JSON)
    public Response addDefinition(@HeaderParam("authorization") String authHeader,
            @FormParam("word_id") int wordId,
            @FormParam("meaning") String meaning,
            @FormParam("example") String example,
            @FormParam("word_type") String wordType) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        if (!authService.isContentManagerOrAdmin(authHeader)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"Access denied\"}").build();
        }

        try {
            Definition definition = new Definition();
            definition.setExample(example);
            definition.setMeaning(meaning);
            definition.setWord_id(wordId);
            definition.setWord_type(wordType);
            int result = definitionService.insert(definition);

            if (result != 0) {
                return Response.status(Response.Status.CREATED)
                        .entity("{\"message\":\"Definition created successfully\"}")
                        .build();
            } else {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("{\"error\":\"Failed to create Definition\"}")
                        .build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Lỗi khi thêm định nghĩa: " + e.getMessage())
                    .build();
        }
    }

    @PUT
    @Path("/update")
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateDefinition(@HeaderParam("authorization") String authHeader,
            @FormParam("definition_id") int definitionId,
            @FormParam("word_id") int wordId,
            @FormParam("meaning") String meaning,
            @FormParam("example") String example,
            @FormParam("word_type") String wordType) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        if (!authService.isContentManagerOrAdmin(authHeader)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"Access denied\"}").build();
        }
        try {
            Definition definition = new Definition();

            definition.setDefinition_id(definitionId);
            definition.setExample(example);
            definition.setMeaning(meaning);
            definition.setWord_id(wordId);
            definition.setWord_type(wordType);
            int isUpdated = definitionService.update(definition);
            if (isUpdated != 0) {
                return Response.ok("{\"message\":\"Definition updated successfully\"}").build();
            } else {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("{\"error\":\"Definition not found\"}")
                        .build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Lỗi khi cập nhật định nghĩa: " + e.getMessage())
                    .build();
        }
    }

    @DELETE
    @Path("/delete/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteDefinition(@HeaderParam("authorization") String authHeader,
            @PathParam("id") int id) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        if (!authService.isContentManagerOrAdmin(authHeader)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"Access denied\"}").build();
        }
        try {
            int resultId = definitionService.delete(id);
            if (resultId > 0) {
                return Response.ok()
                        .entity("{\"message\":\"Definition deleted successfully\"}").build();
            } else {
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                        .entity("{\"error\":\"Failed to delete Definition\"}").build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Lỗi khi xóa định nghĩa: " + e.getMessage())
                    .build();
        }
    }



}
