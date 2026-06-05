package com.curiosity.subscription.mapper;

import org.springframework.stereotype.Component;

import com.curiosity.subscription.dto.request.SubscriptionReqDto;
import com.curiosity.subscription.dto.response.SubscriptionRespDto;
import com.curiosity.subscription.model.Subscription;

@Component
public class SubscriptionMapper {
	public Subscription dtoToSubscription(SubscriptionReqDto subscriptionDto) {
		return Subscription.builder()
				.name(subscriptionDto.getName())
				.month(subscriptionDto.getMonth())
				.year(subscriptionDto.getYear())
				.amount(subscriptionDto.getAmount())
				.build();
	}
	
	public SubscriptionRespDto subscriptionToDto(Subscription subscription) {
		return SubscriptionRespDto.builder()
				.id(subscription.getId())
				.name(subscription.getName())
				.month(subscription.getMonth())
				.year(subscription.getYear())
				.amount(subscription.getAmount())
				.build();
	}
}
