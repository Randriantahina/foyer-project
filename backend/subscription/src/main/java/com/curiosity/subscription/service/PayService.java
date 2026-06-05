package com.curiosity.subscription.service;

import java.math.BigDecimal;
import java.util.List;

import com.curiosity.subscription.model.Pay;

public interface PayService {
	Pay memberPaySubscription(Long idMember, Long idSubscr, BigDecimal amount, String note);
	List<Pay> payForMonthYear(int month, int year);
	Pay findPayById(Long id) throws Exception;
	Pay updateExistingPay(Pay modifiedPay);

	
}
