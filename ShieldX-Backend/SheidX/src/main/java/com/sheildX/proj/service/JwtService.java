package com.sheildX.proj.service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private final SecretKey accessKey;
    private final SecretKey refreshKey;
    private final long accessTokenSeconds;
    private final long refreshTokenSeconds;

    public JwtService(
        @Value("${shieldx.security.jwt.access-secret}") String accessSecret,
        @Value("${shieldx.security.jwt.refresh-secret}") String refreshSecret,
        @Value("${shieldx.security.jwt.access-token-seconds:900}") long accessTokenSeconds,
        @Value("${shieldx.security.jwt.refresh-token-seconds:1209600}") long refreshTokenSeconds
    ) {
        this.accessKey = Keys.hmacShaKeyFor(accessSecret.getBytes(StandardCharsets.UTF_8));
        this.refreshKey = Keys.hmacShaKeyFor(refreshSecret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenSeconds = accessTokenSeconds;
        this.refreshTokenSeconds = refreshTokenSeconds;
    }

    public String generateAccessToken(UserDetails userDetails, String role) {
        return generateToken(userDetails, role, accessTokenSeconds, accessKey);
    }

    public String generateRefreshToken(UserDetails userDetails, String role) {
        return generateToken(userDetails, role, refreshTokenSeconds, refreshKey);
    }

    public long getAccessTokenSeconds() {
        return accessTokenSeconds;
    }

    public long getRefreshTokenSeconds() {
        return refreshTokenSeconds;
    }

    public String extractUsernameFromAccessToken(String token) {
        return extractAllClaims(token, accessKey).getSubject();
    }

    public String extractUsernameFromRefreshToken(String token) {
        return extractAllClaims(token, refreshKey).getSubject();
    }

    public boolean isAccessTokenValid(String token, UserDetails userDetails) {
        String username = extractUsernameFromAccessToken(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token, accessKey);
    }

    public boolean isRefreshTokenValid(String token, UserDetails userDetails) {
        String username = extractUsernameFromRefreshToken(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token, refreshKey);
    }

    private String generateToken(UserDetails userDetails, String role, long ttlSeconds, SecretKey key) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(ttlSeconds);

        return Jwts.builder()
            .subject(userDetails.getUsername())
            .id(UUID.randomUUID().toString())
            .claims(Map.of("role", role))
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiry))
            .signWith(key)
            .compact();
    }

    private boolean isTokenExpired(String token, SecretKey key) {
        return extractAllClaims(token, key).getExpiration().before(new Date());
    }

    private Claims extractAllClaims(String token, SecretKey key) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }
}
