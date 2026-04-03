package com.sheildX.proj.service;

import java.time.LocalDateTime;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sheildX.proj.dto.AuthLoginRequestDTO;
import com.sheildX.proj.dto.AuthRegisterRequestDTO;
import com.sheildX.proj.dto.AuthResponseDTO;
import com.sheildX.proj.model.AppUser;
import com.sheildX.proj.model.RefreshToken;
import com.sheildX.proj.model.UserRole;
import com.sheildX.proj.repository.AppUserRepository;
import com.sheildX.proj.repository.RefreshTokenRepository;

@Service
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
        AppUserRepository appUserRepository,
        RefreshTokenRepository refreshTokenRepository,
        AuthenticationManager authenticationManager,
        PasswordEncoder passwordEncoder,
        JwtService jwtService
    ) {
        this.appUserRepository = appUserRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponseDTO register(AuthRegisterRequestDTO request) {
        if (appUserRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (appUserRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already exists");
        }

        AppUser user = new AppUser(
            request.username().trim(),
            request.email().trim().toLowerCase(),
            passwordEncoder.encode(request.password()),
            UserRole.OPERATOR,
            true
        );
        AppUser saved = appUserRepository.save(user);

        return issueTokens(saved);
    }

    @Transactional
    public AuthResponseDTO login(AuthLoginRequestDTO request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        AppUser user = appUserRepository.findByUsername(request.username())
            .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        return issueTokens(user);
    }

    @Transactional
    public AuthResponseDTO refresh(String refreshTokenValue) {
        RefreshToken persisted = refreshTokenRepository.findByToken(refreshTokenValue)
            .orElseThrow(() -> new IllegalArgumentException("Refresh token not recognized"));

        if (persisted.isRevoked() || persisted.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Refresh token expired or revoked");
        }

        AppUser user = persisted.getUser();
        if (!jwtService.isRefreshTokenValid(refreshTokenValue, user)) {
            throw new IllegalArgumentException("Refresh token signature is invalid");
        }

        persisted.setRevoked(true);
        refreshTokenRepository.save(persisted);

        return issueTokens(user);
    }

    @Transactional
    public void bootstrapAdminIfMissing(String username, String email, String password) {
        if (appUserRepository.existsByUsername(username)) {
            return;
        }

        AppUser admin = new AppUser(
            username,
            email,
            passwordEncoder.encode(password),
            UserRole.ADMIN,
            true
        );
        appUserRepository.save(admin);
    }

    private AuthResponseDTO issueTokens(AppUser user) {
        String role = user.getRole().name();
        String accessToken = jwtService.generateAccessToken(user, role);
        String refreshToken = jwtService.generateRefreshToken(user, role);

        RefreshToken entity = new RefreshToken(
            refreshToken,
            user,
            LocalDateTime.now().plusSeconds(jwtService.getRefreshTokenSeconds()),
            false
        );
        refreshTokenRepository.save(entity);

        return new AuthResponseDTO(
            accessToken,
            refreshToken,
            "Bearer",
            jwtService.getAccessTokenSeconds(),
            user.getUsername(),
            role
        );
    }
}
