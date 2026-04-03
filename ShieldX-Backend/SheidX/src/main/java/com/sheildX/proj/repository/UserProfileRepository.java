package com.sheildX.proj.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sheildX.proj.model.UserProfile;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
}
