package com.curiosity.subscription.exceptionhandling;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.curiosity.subscription.dto.response.ResponseError;
import com.curiosity.subscription.exception.MemberNotFoundException;

@ControllerAdvice
public class MemberHandlingException {
	@ExceptionHandler(MemberNotFoundException.class)
	@ResponseStatus(HttpStatus.NOT_FOUND)
	public ResponseEntity<ResponseError<MemberNotFoundException>> memberNotFound(){
		MemberNotFoundException exception = new MemberNotFoundException("Member not Found");
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(
						ResponseError.<MemberNotFoundException>builder()
						.message(exception.getMessage())	
						.status(404)
						.build()
					);
	}

}
