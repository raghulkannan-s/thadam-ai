package com.thadam.ai.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

import com.thadam.ai.dto.ApiResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {
    

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleNotFoundException( NotFoundException exception){
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                    new ApiResponse<>(
                        false,
                        exception.getMessage(),
                        null
                    )
                );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String,String>>>
                handleMethodArgumentNotValidException( 
                    MethodArgumentNotValidException exception 
                ){
        
        Map<String, String> errors = new HashMap<>();

        exception.getBindingResult().getFieldErrors().forEach((error -> {
            
            errors.put(
                error.getField(),
                error.getDefaultMessage()
            );

        }));
        
        return ResponseEntity.badRequest()
                .body(new ApiResponse<>(
                    false,
                    "Validation Failed",
                    errors
                ));

    }


    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiResponse<Object>> handleConflictException( ConflictException exception ){
        
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(
                new ApiResponse<>(
                    false,
                    exception.getMessage(),
                    null
                )
            );

    }


}
