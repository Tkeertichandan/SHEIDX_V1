package com.sheildX.proj.service;

import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.sheildX.proj.dto.UserRegistrationDTO;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserService userService;
    private final AuthService authService;
    private final String adminUsername;
    private final String adminEmail;
    private final String adminPassword;

    public DataSeeder(
        UserService userService,
        AuthService authService,
        @Value("${shieldx.security.bootstrap.admin-username:admin}") String adminUsername,
        @Value("${shieldx.security.bootstrap.admin-email:admin@shieldx.local}") String adminEmail,
        @Value("${shieldx.security.bootstrap.admin-password:Admin@12345}") String adminPassword
    ) {
        this.userService = userService;
        this.authService = authService;
        this.adminUsername = adminUsername;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(String... args) {
        authService.bootstrapAdminIfMissing(adminUsername, adminEmail, adminPassword);

        if (!userService.getAllUsers().isEmpty()) {
            return;
        }

        userService.createUser(new UserRegistrationDTO("Rahul", "Mumbai", "MUMBAI-CENTRAL", 1.25, 1.15));
        userService.createUser(new UserRegistrationDTO("Aman", "Pune", "PUNE-WEST", 1.1, 1.05));
    }
}
