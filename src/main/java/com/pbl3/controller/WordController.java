package com.pbl3.controller;

import com.pbl3.dto.Word;
import com.pbl3.service.WordService;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
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

    private final WordService wordService = new WordService();
//@GET
//@Path("{id}")
//@Produces(MediaType.APPLICATION_JSON)
//public Response getWord(@PathParam("id") int id) {
//    Word Word = wordService.selectByID(id);
//
//    if (Word == null) {
//        return Response.status(Response.Status.NOT_FOUND)
//                       .entity("{\"error\":\"Word not found\"}")
//                       .build();
//    }
//    return Response.ok(Word).build();
//}

    @GET
    @Path("/{wordId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getWordDetail(@PathParam("wordId") int wordId) 
    {
        Map<String, Object> result = wordService.getWordDetail(wordId);

        if (result != null && !result.isEmpty()) {
            return Response.ok(result).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"Word not found\"}")
                    .build();
        }
    }

    @POST
    @Path("{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response insertWord(Word Word) {
        int isInserted = wordService.insert(Word);

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
    @Path("{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateWord(@PathParam("id") int id, Word Word) {
        int isUpdated = wordService.update(Word);

        if (isUpdated != 0) {
            return Response.ok("{\"message\":\"Word updated successfully\"}").build();
        } else {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"Word not found\"}")
                    .build();
        }
    }

}
