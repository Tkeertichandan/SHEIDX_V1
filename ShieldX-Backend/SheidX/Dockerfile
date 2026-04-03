FROM eclipse-temurin:21-jdk AS build
WORKDIR /workspace
COPY . .
RUN chmod +x mvnw && ./mvnw -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /workspace/target/SheidX-0.0.1-SNAPSHOT.jar /app/app.jar
EXPOSE 9999
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
