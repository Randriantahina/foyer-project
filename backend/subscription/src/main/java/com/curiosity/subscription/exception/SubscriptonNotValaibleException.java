package com.curiosity.subscription.exception;

public class SubscriptonNotValaibleException extends RuntimeException {

	private static final long serialVersionUID = 1L;
	private String message;
	public SubscriptonNotValaibleException(String message) {
		super(message);
	}
	

}
