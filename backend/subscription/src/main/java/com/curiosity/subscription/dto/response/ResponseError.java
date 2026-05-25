package com.curiosity.subscription.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ResponseError<T> {
	private String message;
	private int status;
}
