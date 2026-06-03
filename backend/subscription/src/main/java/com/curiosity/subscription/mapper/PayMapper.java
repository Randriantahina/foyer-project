package com.curiosity.subscription.mapper;

import org.springframework.stereotype.Component;

import com.curiosity.subscription.dto.response.PayRespDto;
import com.curiosity.subscription.model.Pay;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PayMapper {
	private final MemberMapper memberMapper;
	private final SubscriptionMapper subscrpMapper;
	
	public PayRespDto PayToDto(Pay pay) {
		return PayRespDto.builder()
							.id(pay.getId())
							.payedAt(pay.getPayedAt())
							.isPaid(pay.isPaid())
							.note(pay.getNote())
							.amountPaid(pay.getAmountPaid())
							.member(memberMapper.memberToDto(pay.getMember()))
							.subscr(subscrpMapper.subscriptionToDto(pay.getSubscription()))
							.build();
	}
}
