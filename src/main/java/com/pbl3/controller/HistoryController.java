package com.pbl3.controller;

import java.util.ArrayList;

import com.pbl3.dto.History;
import com.pbl3.dto.User;
import com.pbl3.service.HistoryService;
import com.pbl3.service.UserService;

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
import java.util.Map;

@Path("/history")
public class HistoryController {

    private HistoryService historyService;
    private UserService userService;

    public HistoryController() {
        historyService = new HistoryService();
        userService = new UserService();
    }

    @GET
    @Path("/list/{page_number}/{pagesize}/{type}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getHistorysByPageLanguageKeyword(@HeaderParam("authorization") String authHeader,
            @PathParam("page_number") int pageNumber,
            @PathParam("pagesize") int pageSize,
            @PathParam("type") int type,
            @QueryParam("keyword") String keyword) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        User user = userService.getUserByAuthHeader(authHeader);
        if (user == null) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"Access denied\"}").build();
        }
        if (keyword == null || keyword.equalsIgnoreCase("null")) {
            keyword = "";
        }
        historyService.chooseHistoryDAO(type);
        // Tạo Map kết quả
        Map<String, Object> result = historyService.getHistoryByPage(user.getUser_id(),pageNumber, pageSize, keyword);
        if (result == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\":\"history not found\"}")
                    .build();
        }

        return Response.ok(result).build();
    }

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAll(@HeaderParam("Authorization") String authHeader, @QueryParam("type") int type) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        int userId = userService.getUserIdByAuthHeader(authHeader);

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
    @Path("/count")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getCount(@HeaderParam("Authorization") String authHeader, @QueryParam("type") int type) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }
        int userId = userService.getUserIdByAuthHeader(authHeader);

        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Invalid or expired token\"}").build();
        }
        historyService.chooseHistoryDAO(type);
        int total = historyService.SelectCount(userId);
        return Response.ok("{\"total\":\"" + total + "\"}").build();
    }

    @GET
    @Path("/recently")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllRecently(@HeaderParam("Authorization") String authHeader, @QueryParam("type") int type) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Missing or invalid Authorization header\"}").build();
        }

        int userId = userService.getUserIdByAuthHeader(authHeader);
        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"Invalid or expired token\"}").build();
        }
        historyService.chooseHistoryDAO(type);
        History histories = historyService.selectRecently(userId);
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
        int userId = userService.getUserIdByAuthHeader(authHeader);

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
        int userId = userService.getUserIdByAuthHeader(authHeader);

        if (userId == -1) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        historyService.chooseHistoryDAO(type);
        history.setUser_id(userId);
        history.setHistory_date(new java.util.Date());
        int result = 0;
        History h = historyService.selectByID(history.getKey_id(), userId);
        if (h != null) {
            h.setHistory_date(history.getHistory_date());
            result = historyService.update(h);
            // return Response.status(Response.Status.BAD_REQUEST).entity("History already exists").build();
        } else
        result = historyService.insert(history);
        if (result == 0) {
            return Response.status(Response.Status.BAD_REQUEST).entity("Failed to create history").build();
        }
        return Response.status(Response.Status.CREATED).entity(history).build();
    }

}
