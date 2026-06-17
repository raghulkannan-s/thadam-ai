package com.thadam.ai.common.exception;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.thadam.ai.common.dto.ApiResponse;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private String getPath(HttpServletRequest request) {
        return request != null ? request.getRequestURI() : "unknown";
    }

    private String getUserId() {
        String uid = MDC.get("userId");
        return uid != null ? uid : "anonymous";
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleNotFoundException(
            NotFoundException exception, HttpServletRequest request) {
        log.warn("NOT_FOUND path={} userId={} message={} correlationId={}",
                getPath(request), getUserId(), exception.getMessage(), MDC.get("correlationId"));
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, exception.getMessage(), null));
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiResponse<Object>> handleForbiddenException(
            ForbiddenException exception, HttpServletRequest request) {
        log.warn("FORBIDDEN path={} userId={} message={} correlationId={}",
                getPath(request), getUserId(), exception.getMessage(), MDC.get("correlationId"));
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(new ApiResponse<>(false, exception.getMessage(), null));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDeniedException(
            AccessDeniedException exception, HttpServletRequest request) {
        log.warn("ACCESS_DENIED path={} userId={} correlationId={}",
                getPath(request), getUserId(), MDC.get("correlationId"));
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(new ApiResponse<>(false, "Access denied", null));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleMethodArgumentNotValidException(
            MethodArgumentNotValidException exception, HttpServletRequest request) {

        Map<String, String> errors = new HashMap<>();
        exception.getBindingResult().getFieldErrors()
                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));

        log.warn("VALIDATION_ERROR path={} userId={} errors={} correlationId={}",
                getPath(request), getUserId(), errors, MDC.get("correlationId"));
        return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Validation Failed", errors));
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiResponse<Object>> handleConflictException(
            ConflictException exception, HttpServletRequest request) {
        log.warn("CONFLICT path={} userId={} message={} correlationId={}",
                getPath(request), getUserId(), exception.getMessage(), MDC.get("correlationId"));
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiResponse<>(false, exception.getMessage(), null));
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Object>> handleUnauthorizedException(
            UnauthorizedException exception, HttpServletRequest request) {
        log.warn("UNAUTHORIZED path={} userId={} message={} correlationId={}",
                getPath(request), getUserId(), exception.getMessage(), MDC.get("correlationId"));
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse<>(false, exception.getMessage(), null));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataIntegrityViolation(
            DataIntegrityViolationException exception, HttpServletRequest request) {
        log.warn("DATA_INTEGRITY_VIOLATION path={} userId={} correlationId={}",
                getPath(request), getUserId(), MDC.get("correlationId"), exception);
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiResponse<>(false, "Database constraint violation", null));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Object>> handleMethodArgumentTypeMismatch(
            MethodArgumentTypeMismatchException exception, HttpServletRequest request) {
        log.warn("ARGUMENT_TYPE_MISMATCH path={} userId={} param={} correlationId={}",
                getPath(request), getUserId(), exception.getName(), MDC.get("correlationId"));
        return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Invalid path variable: " + exception.getName(), null));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Object>> handleHttpMessageNotReadable(
            HttpMessageNotReadableException exception, HttpServletRequest request) {
        log.warn("MALFORMED_JSON path={} userId={} correlationId={}",
                getPath(request), getUserId(), MDC.get("correlationId"));
        return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Malformed JSON body", null));
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadRequestException(
            BadRequestException exception, HttpServletRequest request) {
        log.warn("BAD_REQUEST path={} userId={} message={} correlationId={}",
                getPath(request), getUserId(), exception.getMessage(), MDC.get("correlationId"));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, exception.getMessage(), null));
    }

    @ExceptionHandler(InsufficientCoinsException.class)
    public ResponseEntity<ApiResponse<Object>> handleInsufficientCoinsException(
            InsufficientCoinsException exception, HttpServletRequest request) {
        log.warn("INSUFFICIENT_COINS path={} userId={} message={} correlationId={}",
                getPath(request), getUserId(), exception.getMessage(), MDC.get("correlationId"));
        return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
                .body(new ApiResponse<>(false, exception.getMessage(), null));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalArgumentException(
            IllegalArgumentException exception, HttpServletRequest request) {
        log.warn("ILLEGAL_ARGUMENT path={} userId={} message={} correlationId={}",
                getPath(request), getUserId(), exception.getMessage(), MDC.get("correlationId"));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, exception.getMessage(), null));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalStateException(
            IllegalStateException exception, HttpServletRequest request) {
        log.warn("ILLEGAL_STATE path={} userId={} message={} correlationId={}",
                getPath(request), getUserId(), exception.getMessage(), MDC.get("correlationId"));
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiResponse<>(false, exception.getMessage(), null));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGenericException(
            Exception exception, HttpServletRequest request) {
        log.error("UNHANDLED_EXCEPTION path={} userId={} type={} message={} correlationId={}",
                getPath(request), getUserId(), exception.getClass().getSimpleName(),
                exception.getMessage(), MDC.get("correlationId"), exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Internal server error", null));
    }
}
