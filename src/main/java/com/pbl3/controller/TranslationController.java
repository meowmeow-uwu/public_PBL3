package com.pbl3.controller;

import com.pbl3.service.TranslationService;
import jakarta.ws.rs.GET;
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

}
