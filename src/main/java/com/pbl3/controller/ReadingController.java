package com.pbl3.controller;

import java.util.ArrayList;

import com.pbl3.dto.Reading;
import com.pbl3.service.ReadingService;
import com.pbl3.util.JwtUtil;

import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/reading")
public class ReadingController {
    private ReadingService readingService;

    public ReadingController(){
        readingService = new ReadingService();
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getReading( @HeaderParam("Authorization") String token, @PathParam("id") int id) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        
        Reading reading = readingService.selectByID(id);
        if (reading != null) {
            return Response.ok(reading).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getReadings(@HeaderParam("Authorization") String token) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        ArrayList<Reading> readings = readingService.selectAll();
        return Response.ok(readings).build();
    }

    @POST
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response createReading(@HeaderParam("Authorization") String token, Reading reading) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        readingService.insert(reading);
        return Response.ok(reading).build();
    }

    @PUT
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateReading(@HeaderParam("Authorization") String token, @PathParam("id") int id, Reading reading) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        readingService.update(reading);
        return Response.ok(reading).build();
    }

    @DELETE
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteReading(@HeaderParam("Authorization") String token, @PathParam("id") int id) {
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        readingService.delete(id);
        return Response.ok().build();
    }
}
