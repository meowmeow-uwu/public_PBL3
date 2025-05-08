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
    @Path("{sourceWord}/{type}")  // type: 1 = Anh-Việt, 2 = Anh-Anh
    @Produces(MediaType.APPLICATION_JSON)
    public Response translateWord(
        @PathParam("sourceWord") String sourceWord,
        @PathParam("type") int type
    ) {
        // Kiểm tra type
        if (type != 1 && type != 2) {
            return Response.status(Response.Status.BAD_REQUEST)
                          .entity("{\"error\":\"Invalid type. Use 1 for English-Vietnamese or 2 for English-English\"}")
                          .build();
        }

        // Gọi service với sourceLanguageId luôn là tiếng Anh (1)
        Map<String, Object> result = translationService.translateWord(
            sourceWord, 
            1,  // sourceLanguageId luôn là 1 (tiếng Anh)
            type == 1 ? 2 : 1  // targetLanguageId: 2 cho Anh-Việt, 1 cho Anh-Anh
        );

        if (result != null) {
            return Response.ok(result).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND)
                          .entity("{\"error\":\"Translation not found\"}")
                          .build();
        }
    }
}
