package com.curiosity.subscription.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.curiosity.subscription.exception.MemberNotFoundException;
import com.curiosity.subscription.exception.SubscriptonNotValaibleException;
import com.curiosity.subscription.model.Subscription;
import com.curiosity.subscription.repository.SubscriptionRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService{
	private final  SubscriptionRepo subscriptionRepo;
	
	@Override
	public List<Subscription> subcriptionAvailable() {
		return subscriptionRepo.findAll();
	}

	@Override
	public List<Subscription> subscriptionMonthYear(int month, int year) {
		return subscriptionRepo.AboutSubscription(month, year);		
	}
	
	@Override
	public Subscription findSubscriptionById(Long id) {
		return subscriptionRepo.findById(id)
				.orElseThrow(() -> new MemberNotFoundException("Member Not Excist with id = "+id));
	}
	@Override
	public Subscription addSubscription(Subscription subscription) {
		return  subscriptionRepo.save(subscription);
	}

	@Override
	public Subscription updateSubscription(Subscription subscription) {
		if(!subscriptionRepo.existsById(subscription.getId())) {
			throw new SubscriptonNotValaibleException("Not yet valaible");
		}
		return subscriptionRepo.save(subscription);
	}

	@Override
	public void removeSubscription(Long idSubcription) {
		subscriptionRepo.deleteById(idSubcription);
	}

}
