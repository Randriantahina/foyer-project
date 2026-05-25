package com.curiosity.subscription.exception;

public class MemberNotFoundException  extends RuntimeException{

	private static final long serialVersionUID = 1L;
	private  String message;


	public MemberNotFoundException(String message) {
		super(message);
	}

}
