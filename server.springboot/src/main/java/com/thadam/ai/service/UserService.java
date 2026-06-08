package com.thadam.ai.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.thadam.ai.dto.CreateUserRequest;
import com.thadam.ai.dto.CreateUserResponse;
import com.thadam.ai.dto.UpdateUserRequest;
import com.thadam.ai.dto.UserResponse;
import com.thadam.ai.entity.User;
import com.thadam.ai.exception.ConflictException;
import com.thadam.ai.exception.NotFoundException;
import com.thadam.ai.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public CreateUserResponse createUser(CreateUserRequest request){
        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .build();
        
        if( userRepository.existsByEmail(request.email()) ){
            throw new ConflictException(
                "Email already exists"
            );
        }

        User savedUser = userRepository.save(user); 
        
        return new CreateUserResponse(
            savedUser.getId(),
            savedUser.getName(),
            savedUser.getEmail()
        );
    
    }   

    public UserResponse getUserById(Long id){

        User user = userRepository.findById(id).orElseThrow(()-> new NotFoundException("User not found with this id : " + id));

        return new UserResponse(
            user.getId(),
            user.getName(),
            user.getEmail()
        );
    }

    public List<UserResponse> getAllUsers(){
        return userRepository.findAll()
                .stream().map( user ->  new UserResponse(
                    user.getId(),
                    user.getName(),
                    user.getEmail()
                )).toList();
    }

    public UserResponse updateUser(Long id, UpdateUserRequest req){

        User user = userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found with this id : " + id));

        user.setName(req.name());
        user.setEmail(req.email());
        
        User updatedUser = userRepository.save(user);

        return new UserResponse(
            updatedUser.getId(),
            updatedUser.getName(),
            updatedUser.getEmail()
        );
        

    }

    public void deleteUser(Long id){

        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with this id : " + id));
        
        userRepository.delete(user);

    }


}
