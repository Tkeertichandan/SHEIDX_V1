package com.sheildX.proj.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.sheildX.proj.dto.UserRegistrationDTO;
import com.sheildX.proj.dto.UserResponseDTO;
import com.sheildX.proj.model.UserProfile;
import com.sheildX.proj.service.UserService;

import jakarta.validation.Valid;

@RestController
@Validated
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponseDTO register(@Valid @RequestBody UserRegistrationDTO request) {
        return toResponse(userService.createUser(request));
    }

    @GetMapping
    public List<UserResponseDTO> getAllUsers() {
        return userService.getAllUsers().stream().map(this::toResponse).toList();
    }

    private UserResponseDTO toResponse(UserProfile user) {
        return new UserResponseDTO(
            user.getId(),
            user.getName(),
            user.getCity(),
            user.getZone(),
            user.getZoneRisk(),
            user.getWorkerRiskScore(),
            user.getWalletBalance()
        );
    }
}
