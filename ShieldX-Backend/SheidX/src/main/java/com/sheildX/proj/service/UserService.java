package com.sheildX.proj.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.sheildX.proj.dto.UserRegistrationDTO;
import com.sheildX.proj.model.UserProfile;
import com.sheildX.proj.repository.UserProfileRepository;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserProfileRepository userProfileRepository;

    public UserService(UserProfileRepository userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    public UserProfile createUser(UserRegistrationDTO dto) {
        log.info("Creating user profile for zone={} city={}", dto.zone(), dto.city());
        UserProfile user = new UserProfile(
            dto.name(),
            dto.city(),
            dto.zone(),
            dto.zoneRisk(),
            dto.workerRiskScore()
        );
        return userProfileRepository.save(user);
    }

    public List<UserProfile> getAllUsers() {
        return userProfileRepository.findAll();
    }

    public UserProfile getUser(Long userId) {
        log.debug("Fetching user by id={}", userId);
        return userProfileRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found for id: " + userId));
    }

    public UserProfile save(UserProfile userProfile) {
        return userProfileRepository.save(userProfile);
    }
}
