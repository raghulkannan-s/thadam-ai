package com.thadam.ai.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thadam.ai.dto.ApiResponse;
import com.thadam.ai.dto.CreateUserRequest;
import com.thadam.ai.dto.CreateUserResponse;
import com.thadam.ai.dto.UpdateUserRequest;
import com.thadam.ai.dto.UserResponse;
import com.thadam.ai.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse<CreateUserResponse>> createUser( @Valid @RequestBody CreateUserRequest req ){

        CreateUserResponse response = userService.createUser(req);

        return ResponseEntity.ok(
            new ApiResponse<>(
                true,
                "User created successfully",
                response
            )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById( @PathVariable Long id ){

        UserResponse fetchedUser = userService.getUserById(id);

        return ResponseEntity.ok(
            new ApiResponse<>(
                true,
                "User fetched successfully",
                fetchedUser
            )
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers(){

        List<UserResponse> users = userService.getAllUsers();

        return ResponseEntity.ok(
            new ApiResponse<>(
                true,
                "Fetched all users successfully",
                users
            )
        );

    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
        @PathVariable Long id,
        @Valid @RequestBody UpdateUserRequest request
    ){

        UserResponse response = userService.updateUser(id, request);

        return ResponseEntity.ok( 
            new ApiResponse<>(
                true,
                "User updated successfully",
                response
            )
        );

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteUser( @PathVariable Long id ){
        
        userService.deleteUser(id);

        return ResponseEntity.ok(
            new ApiResponse<>(
                true,
                "User deleted successfully",
                null
            )
        );

    }




}
