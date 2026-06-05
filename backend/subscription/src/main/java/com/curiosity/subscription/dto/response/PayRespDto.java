package com.curiosity.subscription.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayRespDto {
	private Long id;
	private BigDecimal amountPaid;
	private String note;
	private LocalDateTime payedAt;
	private boolean isPaid;
	
	private MemberRespDto member;
	private SubscriptionRespDto subscr;
	
}
