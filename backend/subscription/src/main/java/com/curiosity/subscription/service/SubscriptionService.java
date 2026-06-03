package com.curiosity.subscription.service;

import java.util.List;


import com.curiosity.subscription.model.Subscription;


public interface SubscriptionService {
	List<Subscription> subcriptionAvailable();
	List<Subscription> subscriptionMonthYear(int month, int year);
	Subscription findSubscriptionById(Long id);
	
	Subscription addSubscription(Subscription subcription);
	Subscription updateSubscription(Subscription Subcription);
	void removeSubscription(Long idSubcription);
	
}
