package com.pbl3.controller;

import java.util.ArrayList;

import com.pbl3.dto.History;
import com.pbl3.service.HistoryService;
import com.pbl3.util.JwtUtil;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/history")
public class HistoryController {
    private HistoryService historyService;

    public HistoryController() {
        historyService = new HistoryService();
    }

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllExams(@HeaderParam("Authorization") String authHeader, @QueryParam("type") int type) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Invalid or expired token\"}").build();
        }
        historyService.chooseHistoryDAO(type);
        ArrayList<History> histories = historyService.selectAll(userId);
        if (histories != null) {
            return Response.status(Response.Status.OK).entity(histories).build();
        } else {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
        public Response getHistoryByID(@HeaderParam("Authorization") String authHeader, @PathParam("id") int id, @QueryParam("type") int type) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        historyService.chooseHistoryDAO(type);
        History history = historyService.selectByID(id, userId);
        if (history == null) {
            return Response.status(Response.Status.NOT_FOUND).entity("History not found").build();
        }
        return Response.status(Response.Status.OK).entity(history).build();
    }

    @POST
    @Path("/")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createHistory(@HeaderParam("Authorization") String authHeader, History history, @QueryParam("type") int type) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        int userId = JwtUtil.getUserIdFromToken(token);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        historyService.chooseHistoryDAO(type);
        history.setUser_id(userId);
        history.setHistory_date(new java.util.Date());
        if(historyService.selectByID(history.getKey_id(), userId) != null) {
            return Response.status(Response.Status.BAD_REQUEST).entity("History already exists").build();
        }
        int result = historyService.insert(history);
        if (result == 0) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Failed to create history").build();
        }
        return Response.status(Response.Status.CREATED).entity(history).build();
    }

}