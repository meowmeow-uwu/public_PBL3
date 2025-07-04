package com.pbl3.config;

import jakarta.ws.rs.ApplicationPath;
import org.glassfish.jersey.server.ResourceConfig;

/**
 * Configures Jakarta RESTful Web Services for the application.
 *
 * @author Juneau
 */
@ApplicationPath("api")
public class Config extends ResourceConfig {

    public Config() {
        packages("com.pbl3.controller", "com.pbl3.filter");
    }
}
