package com.thadam.ai.exception;



public class UnauthorizedException extends RuntimeException{
    public UnauthorizedException( String message ){
        super(message);
    }
}
