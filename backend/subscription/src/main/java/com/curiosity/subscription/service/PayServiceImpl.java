package com.curiosity.subscription.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.curiosity.subscription.exception.MemberNotFoundException;
import com.curiosity.subscription.exception.SubscriptonNotValaibleException;
import com.curiosity.subscription.model.Member;
import com.curiosity.subscription.model.Pay;
import com.curiosity.subscription.model.Subscription;
import com.curiosity.subscription.repository.MemberRepo;
import com.curiosity.subscription.repository.PayRepo;
import com.curiosity.subscription.repository.SubscriptionRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PayServiceImpl implements PayService{
	private final MemberRepo memberRepo;
	private final PayRepo payRepo;
	private final SubscriptionRepo subscriptionRepo;
	private final MemberService memberService;
	
	@Override
	public Pay memberPaySubscription(Long idMember, Long idSubscrp, BigDecimal amountPay, String note) {
		Member member = memberRepo.findById(idSubscrp)
							.orElseThrow(()-> new MemberNotFoundException("No member exist with the id= "+ idMember));
		
		Subscription subscrp = subscriptionRepo.findById(idSubscrp)
								.orElseThrow(() -> new SubscriptonNotValaibleException("No subscription available with the id= "+idSubscrp));
		
		Pay pay = Pay.builder()
					.member(member)
					.subscription(subscrp)
					.amountPaid(amountPay)
					.isPaid(isComplete(amountPay, subscrp.getAmount()))
					.note(note)
					.payedAt(LocalDateTime.now())
					.build();
		
		 return payRepo.save(pay);
	}
	
	
	//in the Pay Entity , we can see the attribut is_Pay
	//for this  we should compare it with the amount inside the Subscription class
	//ask if the amount in the Subscription is the same for the amount in the Pay
	boolean isComplete(BigDecimal amountPay, BigDecimal amountSubscrp) {
		return amountPay.equals(amountSubscrp);
	}


	@Override
	public List<Pay> payForMonthYear(int month, int year) {
		List<Pay> pays = payRepo.payForMonthYear(month, year);
		return pays;
	}


	//Don't forget to handle the error
	@Override
	public Pay findPayById(Long id) throws Exception {
		
		return payRepo.findById(id)
				.orElseThrow(() -> new Exception("NOt Found Pay"));
	}

	

	@Override
	public Pay updateExistingPay(Pay modifiedPay) {
		return payRepo.save(modifiedPay);
	}
	

}
