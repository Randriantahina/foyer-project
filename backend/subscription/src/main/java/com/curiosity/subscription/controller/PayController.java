package com.curiosity.subscription.controller;

import java.util.ArrayList;
import java.util.List;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


import com.curiosity.subscription.dto.request.PayReqDto;
import com.curiosity.subscription.dto.response.ApiResponse;
import com.curiosity.subscription.dto.response.PayRespDto;
import com.curiosity.subscription.mapper.MemberMapper;
import com.curiosity.subscription.mapper.PayMapper;
import com.curiosity.subscription.mapper.SubscriptionMapper;
import com.curiosity.subscription.model.Member;
import com.curiosity.subscription.model.Pay;
import com.curiosity.subscription.model.Subscription;
import com.curiosity.subscription.service.MemberService;
import com.curiosity.subscription.service.PayService;
import com.curiosity.subscription.service.SubscriptionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/{version}/pays")
@RequiredArgsConstructor
@CrossOrigin
public class PayController {
	private final PayService payService;
	private final PayMapper payMapper;
	
	private final MemberService memberService;
	private final MemberMapper memberMapper;
	
	private final SubscriptionService subscrpService;
	private final SubscriptionMapper subscrpMapper;
	
	
	@PostMapping("/{idMember}/members/{idSubscrp}/subscriptions")
	ResponseEntity<ApiResponse<PayRespDto>> memberPaySubscrp(
			@PathVariable("idMember") Long idMember, 
			@PathVariable("idSubscrp" )Long idSubscrp, 
			@RequestBody PayReqDto payReq
	) {
		
		Pay pay = payService.memberPaySubscription(
					idMember, 
					idSubscrp,
					payReq.getAmountPaid(), 
					payReq.getNote()
				);
		
		PayRespDto payResp = payMapper.PayToDto(pay);
		
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(
						ApiResponse.<PayRespDto>builder()
							.success(true)
							.message("Add pay is Successful")
							.data(payResp)
							.build()
				);
	}
	
	
	@GetMapping("/subscriptions")
	 ResponseEntity<ApiResponse<List<PayRespDto>>> getMemberPayMonth(
			 @RequestParam(name="month")int month,
			 @RequestParam(name="year") int year
	){
		List<Pay> pays = payService.payForMonthYear(month, year);
		
		List<PayRespDto> payResp = pays.stream()
							.map(payMapper::PayToDto)
							.toList();
		
		
		return ResponseEntity.status(HttpStatus.OK)
				.body(
						ApiResponse.<List<PayRespDto>>builder()
							.success(true)
							.message("member Pay for the month " + month + "and the year "+ year)
							.data(payResp)
							.build()
				);
	}
	
	@GetMapping("/{id}/unpaid-subscriptions")
	 ResponseEntity<ApiResponse<List<PayRespDto>>> getMemberUnPaidMonth(
			@PathVariable("id") Long idSubscrp
	){
		Subscription subscrp = subscrpService.findSubscriptionById(idSubscrp);
		List<Member> memberUnpaid = memberService.memberUnpaid(
							subscrp.getMonth(),
							subscrp.getYear()
		);
		
		
		List<PayRespDto> unpayResps = new ArrayList<>();
		
		memberUnpaid.forEach((member) -> {
			unpayResps.add(PayRespDto.builder()
				.amountPaid(null)
				.id(null)
				.member(memberMapper.memberToDto(member))
				.subscr(subscrpMapper.subscriptionToDto(subscrp))
				.note("you Must pay it")
				.build()
				);
			});
		
		
		return ResponseEntity.status(HttpStatus.OK)
				.body(
						ApiResponse.<List<PayRespDto>>builder()
							.success(true)
							.message("member Pay for the month " + subscrp.getMonth()+ "and the year "+ subscrp.getYear())
							.data(unpayResps)
							.build()
				);
	}
	
	@PutMapping("/{idPay}")
	ResponseEntity<ApiResponse<PayRespDto>> putPay(
			@PathVariable("idPay") Long idPay,
			@RequestParam(name="idMember",required=false) Long idMember, 
			@RequestParam(name="idSubscrp", required=false )Long idSubscrp, 
			@RequestBody PayReqDto payReq
	) throws Exception{
		Pay pay = payService.findPayById(idSubscrp);
		
		Member member = pay.getMember();
		Subscription subscrp = pay.getSubscription();
		
		if(idMember != null)
			 member = memberService.findAnyMemberById(idMember);
		
		if(idSubscrp != null)
			 subscrp = subscrpService.findSubscriptionById(idSubscrp);
		
		Pay ModifiedPay = Pay.builder()
								.id(pay.getId())
								.amountPaid(payReq.getAmountPaid())
								.note(payReq.getNote())
								.member(member)
								.subscription(subscrp)
								.build();
		
		PayRespDto data = payMapper.PayToDto(payService.updateExistingPay(ModifiedPay));
		
		
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(
						ApiResponse.<PayRespDto>builder()
							.success(true)
							.message("Updating pay is Successful")
							.data(data)
							.build()
				);
		
	}
	

	
	
}
