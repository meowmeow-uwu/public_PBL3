package com.pbl3.controller;

import com.pbl3.dto.Word;
import com.pbl3.service.AuthService;
import com.pbl3.service.UserService;
import com.pbl3.service.WordService;
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
import java.util.Map;

/**
 *
 * @author
 */
@Path("word")
public class WordController {
    private final UserService userService = new UserService();
    private final AuthService authService = new AuthService();
    private final WordService wordService = new WordService();


    @GET
    @Path("/{wordId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getWordDetail(@PathParam("wordId") int wordId) {
        Map<String, Object> result = wordService.getWordDetail(wordId);

        if (result != null && !result.isEmpty()) {
            return Response.ok(result).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"Word not found\"}")
                    .build();
        }
    }

}
