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
        Connection conn = null;
        try {
            // Thông tin kết nối từ Aiven Cloud
            String host = "mysql-b353a14-meowmeow01aa-3899.d.aivencloud.com";
            String port = "11220";
            String databaseName = "EnglishSystem"; // Hoặc tên database thực tế của bạn trên Aiven
            String username = "avnadmin"; // Username từ Aiven
            String password = "AVNS_7U3p8HyC7r4ap5HGxTF"; // Password từ Aiven

            System.setProperty("javax.net.ssl.trustStore", "my_truststore.jks");
System.setProperty("javax.net.ssl.trustStorePassword", "123456");
// Và sau đó trong dbURL, bạn vẫn cần sslmode:
            // Xây dựng JDBC URL cho MySQL
            // SSL mode thường là REQUIRED hoặc VERIFY_CA cho Aiven. Kiểm tra tài liệu của Aiven.
            String dbURL = "jdbc:mysql://" + host + ":" + port + "/" + databaseName + "?sslmode=REQUIRED";
            // Nếu Aiven yêu cầu CA certificate, bạn có thể cần thêm các tham số như:
            // "?sslmode=VERIFY_CA&trustCertificateKeyStoreUrl=file:/path/to/your/truststore.jks&trustCertificateKeyStorePassword=your_password"
            // Hoặc "?verifyServerCertificate=true&useSSL=true&requireSSL=true" (cú pháp cũ hơn)


            // Đăng ký MySQL JDBC Driver
            Class.forName("com.mysql.cj.jdbc.Driver"); // Driver mới cho MySQL 8+
            // Hoặc Class.forName("com.mysql.jdbc.Driver"); // Driver cũ hơn

            // Thực hiện kết nối
            System.out.println("Attempting to connect to: " + dbURL); // In ra để kiểm tra
            conn = DriverManager.getConnection(dbURL, username, password);

            System.out.println("Connect to MySQL Cloud DB (Aiven) successfully!");

        } catch (ClassNotFoundException ex) {
            Logger.getLogger(DBUtil.class.getName()).log(Level.SEVERE, "MySQL JDBC Driver not found!", ex);
            ex.printStackTrace();
        } catch (SQLException ex) {
            Logger.getLogger(DBUtil.class.getName()).log(Level.SEVERE, "Failed to connect to MySQL Cloud DB!", ex);
            ex.printStackTrace();
        } catch (Exception ex) { // Bắt các Exception chung khác
            Logger.getLogger(DBUtil.class.getName()).log(Level.SEVERE, "An unexpected error occurred!", ex);
            ex.printStackTrace();
        }
        return conn;
    }

    public static void closeConnection(Connection conn) {
        if (conn != null) {
            try {
                conn.close();
                // System.out.println("Connection closed.");
            } catch (SQLException ex) {
                Logger.getLogger(DBUtil.class.getName()).log(Level.SEVERE, "Error closing connection", ex);
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////////
    public static void main(String[] args) throws SQLException {
        System.out.println("This is to test if we can connect to MySQL Cloud DB (Aiven)");
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