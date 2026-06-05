package com.curiosity.subscription.dto.request;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SubscriptionReqDto {
	private String name;
	private Integer month;
	private Integer year;
	private BigDecimal amount;
}
