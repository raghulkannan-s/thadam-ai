package com.thadam.ai.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.thadam.ai.entity.User;

public interface UserRepository extends JpaRepository<User, Long>{
    
    public boolean existsByEmail(String email);

}