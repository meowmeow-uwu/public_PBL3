/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.util;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author Danh
 */
public class DBUtil {

    public static Connection makeConnection() {
//        Connection conn = null;
//        try {
//
//            String dbURL = "jdbc:sqlserver://MSI\\SQLEXPRESS:1433;databaseName=EngLishSystem;encrypt=true;trustServerCertificate=true;";
//
//            String user = "sa";
//            String pass = "sa123456";
//            Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
//            conn = DriverManager.getConnection(dbURL, user, pass);
//            //System.out.println("Connect to DB successfully");
//        } catch (Exception ex) {
//            ex.printStackTrace();
//        }
//        return conn;
//    }
//
//    public static void closeConnection(Connection conn) {
//
//        if (conn != null) {
//            try {
//                conn.close();
//            } catch (SQLException ex) {
//                Logger.getLogger(DBUtil.class.getName()).log(Level.SEVERE, null, ex);
//            }
//        }
//    }
//    
//    ////////////////////////////////////////////////////////////////////////////
//
//    public static void main(String[] args) throws SQLException {
//        
//        System.out.println("This is to test if we can connect to SQLServer");
//        Connection conn = makeConnection();
//        DatabaseMetaData dm = (DatabaseMetaData) conn.getMetaData();
//        System.out.println("Driver name: " + dm.getDriverName());
//        System.out.println("Driver version: " + dm.getDriverVersion());
//        closeConnection(conn);
//    }
        Connection conn = null;
        try {
            String host = "mysql-b353a14-meowmeow01aa-3899.d.aivencloud.com";
            String port = "11220";
            String databaseName = "EnglishSystem";
            String username = "avnadmin";
            String password = "AVNS_7U3p8HyC7r4ap5HGxTF"; // Mật khẩu thực tế của bạn


            // Đường dẫn đến truststore và mật khẩu
            String trustStorePath = "my_truststore.jks"; // << THAY ĐỔI ĐƯỜNG DẪN NÀY
            String trustStorePassword = "123456";    // << THAY ĐỔI MẬT KHẨU NÀY

            String dbURL = "jdbc:mysql://" + host + ":" + port + "/" + databaseName
                    + "?sslmode=VERIFY_CA"
                    + "&trustCertificateKeyStoreUrl=file:" + trustStorePath
                    + "&trustCertificateKeyStorePassword=" + trustStorePassword
                    + "&autoReconnect=true"; // Thêm autoReconnect nếu muốn

            Class.forName("com.mysql.cj.jdbc.Driver");

            System.out.println("Attempting to connect to: " + dbURL);
            conn = DriverManager.getConnection(dbURL, username, password);

            System.out.println("Connect to MySQL Cloud DB (Aiven) successfully with SSL (VERIFY_CA)!");

        } catch (ClassNotFoundException ex) {
            Logger.getLogger(DBUtil.class.getName()).log(Level.SEVERE, "MySQL JDBC Driver not found!", ex);
            ex.printStackTrace();
        } catch (SQLException ex) {
            Logger.getLogger(DBUtil.class.getName()).log(Level.SEVERE, "Failed to connect to MySQL Cloud DB! Check SSL config, credentials, and network.", ex);
            ex.printStackTrace();
        } catch (Exception ex) {
            Logger.getLogger(DBUtil.class.getName()).log(Level.SEVERE, "An unexpected error occurred!", ex);
            ex.printStackTrace();
        }
        return conn;
    }

    // ... (phần closeConnection và main giữ nguyên)
    public static void closeConnection(Connection conn) {
        if (conn != null) {
            try {
                conn.close();
            } catch (SQLException ex) {
                Logger.getLogger(DBUtil.class.getName()).log(Level.ALL.SEVERE, "Error closing connection", ex);
            }
        }
    }

    public static void main(String[] args) throws SQLException {
        System.out.println("This is to test if we can connect to MySQL Cloud DB (Aiven) with VERIFY_CA");
        Connection conn = makeConnection();
        if (conn != null) {
            DatabaseMetaData dm = conn.getMetaData();
            System.out.println("Driver name: " + dm.getDriverName());
            System.out.println("Driver version: " + dm.getDriverVersion());
            System.out.println("Database name: " + dm.getDatabaseProductName());
            System.out.println("Database version: " + dm.getDatabaseProductVersion());
            closeConnection(conn);
        } else {
            System.out.println("Failed to make connection to the database.");
        }
    }
}
