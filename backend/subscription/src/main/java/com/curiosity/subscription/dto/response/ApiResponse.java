package com.curiosity.subscription.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
@Builder
public class ApiResponse <T>{
	private boolean success;
	private String message;
	private T data;
	
}
