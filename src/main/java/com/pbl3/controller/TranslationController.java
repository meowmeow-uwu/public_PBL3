package com.pbl3.controller;

import com.pbl3.service.TranslationService;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.Map;

@Path("translate")
public class TranslationController {
    private TranslationService translationService = new TranslationService();
    
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
        // Kiểm tra language
        if (sourceLanguageId != ENGLISH_LANGUAGE_ID) {
            return Response.status(Response.Status.BAD_REQUEST)
                          .entity("{\"error\":\"Only English source language is supported\"}")
                          .build();
        }

        if (targetLanguageId != ENGLISH_LANGUAGE_ID && targetLanguageId != VIETNAMESE_LANGUAGE_ID) {
            return Response.status(Response.Status.BAD_REQUEST)
                          .entity("{\"error\":\"Only English or Vietnamese target language is supported\"}")
                          .build();
        }

        Map<String, Object> result = translationService.translateWord(sourceWord, sourceLanguageId, targetLanguageId);

        if (result != null) {
            return Response.ok(result).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND)
                          .entity("{\"error\":\"Translation not found\"}")
                          .build();
        }
    }
}
