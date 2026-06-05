package com.curiosity.subscription.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MemberRespDto {
	private Long id;
	private String firstName;
	private String lastName;
	private String phoneNumber;
}
