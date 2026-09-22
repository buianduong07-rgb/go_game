@echo off
set "JAVA_HOME=C:\AndroidSDK\jdk21\jdk-21.0.4+7"
set "ANDROID_HOME=C:\AndroidSDK"
set "PATH=%JAVA_HOME%\bin;%PATH%"
set "GRADLE_OPTS=-Xmx1024m"
echo [BUILD] Starting Gradle bundleRelease (skipping lint)... > build_out.log
call gradlew.bat bundleRelease -x lintVitalRelease -x lintVitalAnalyzeRelease --info >> build_out.log 2>&1
echo [BUILD] Finished with exit code %ERRORLEVEL% >> build_out.log
