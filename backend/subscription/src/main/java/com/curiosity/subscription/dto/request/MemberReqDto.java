package com.curiosity.subscription.dto.request;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MemberReqDto {
	private String firstName;
	private String lastName;
	private String phoneNumber;
	private LocalDateTime payedAt;
	

}
