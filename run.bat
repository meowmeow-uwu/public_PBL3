@echo off
REM Build project với Maven Daemon
mvnd clean install

REM Copy file WAR vào thư mục webapps của Tomcat
copy target\PBL3-1.0-SNAPSHOT.war "%CATALINA_HOME%\webapps\"

REM Khởi động lại Tomcat (tắt trước nếu đang chạy)
call "%CATALINA_HOME%\bin\shutdown.bat"
timeout /t 0
call "%CATALINA_HOME%\bin\startup.bat"

echo Deploy successfully!
@REM pause
