package com.thadam.ai.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.thadam.ai.dto.LoginRequest;
import com.thadam.ai.dto.LoginResponse;
import com.thadam.ai.entity.User;
import com.thadam.ai.dto.RegisterRequest;
import com.thadam.ai.dto.RegisterResponse;
import com.thadam.ai.enums.AuthProvider;
import com.thadam.ai.enums.Role;
import com.thadam.ai.exception.ConflictException;
import com.thadam.ai.exception.UnauthorizedException;
import com.thadam.ai.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public RegisterResponse register ( RegisterRequest request ){
        
        if( userRepository.existsByEmail(request.email()) ) {
            throw new ConflictException("Email already Exists");
        }

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(
                    passwordEncoder.encode(request.password())
                )
                .role(Role.USER)
                .provider(AuthProvider.LOCAL)
                .build();
        
        User savedUser = userRepository.save(user);

        return new RegisterResponse(
            savedUser.getId(),
            savedUser.getName(),
            savedUser.getEmail()
        );
    }

    public LoginResponse login( LoginRequest request ){
     
        User user = userRepository
                        .findByEmail(request.email())
                        .orElseThrow(()-> new UnauthorizedException("Invalid Credentials") );

        boolean isValid = passwordEncoder.matches(request.password(), user.getPassword());

        if( !isValid ){
            throw new UnauthorizedException(
                "Invalid Credentials"
            );
        }

        String token = jwtService.generateToken(user);

        return new LoginResponse(
            token
        );

    }

}
