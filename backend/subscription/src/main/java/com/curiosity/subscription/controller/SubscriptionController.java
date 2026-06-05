package com.curiosity.subscription.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.curiosity.subscription.dto.request.SubscriptionReqDto;
import com.curiosity.subscription.dto.response.ApiResponse;
import com.curiosity.subscription.dto.response.SubscriptionRespDto;
import com.curiosity.subscription.mapper.SubscriptionMapper;
import com.curiosity.subscription.model.Subscription;
import com.curiosity.subscription.service.SubscriptionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("api/{version}/subscriptions")
@RequiredArgsConstructor
@CrossOrigin
public class SubscriptionController {
	private final SubscriptionService subscriptionService;
	private final  SubscriptionMapper subscriptionMapper;
	
	@PostMapping
	ResponseEntity<ApiResponse<SubscriptionRespDto>> createSubscription(
			@RequestBody SubscriptionReqDto subscReq
	){
		Subscription subsc = subscriptionMapper.dtoToSubscription(subscReq);
		subscriptionService.addSubscription(subsc);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(
					ApiResponse.<SubscriptionRespDto>builder()
					.success(true)
					.message("addSubscription Successful")
					.data(subscriptionMapper.subscriptionToDto(subsc))
					.build()
				);
	}
	
	@GetMapping
	ResponseEntity<ApiResponse<List<SubscriptionRespDto>>> getAvailablesSubscription(){
		List<Subscription>subscriptionAvailable =subscriptionService.subcriptionAvailable();
		List<SubscriptionRespDto> data =subscriptionAvailable.stream()
			.map(
					subscr -> subscriptionMapper.subscriptionToDto(subscr)
			)
			.toList();
			
		return  ResponseEntity.ok(
					ApiResponse.<List<SubscriptionRespDto>>builder()
					.success(true)
					.message("All Subscription Available")
					.data(data)
					.build()
				);
	
	}
	@GetMapping("/{id})")
	ResponseEntity<ApiResponse<SubscriptionRespDto>> getSubsriptionById(
			@PathVariable("id") Long idSubscrp
	){
		Subscription subscrp = subscriptionService.findSubscriptionById(idSubscrp);
		return ResponseEntity.status(HttpStatus.OK)
				.body(
					ApiResponse.<SubscriptionRespDto>builder()
					.success(true)
					.message("addSubscription Successful")
					.data(subscriptionMapper.subscriptionToDto(subscrp))
					.build()
				);
	}
	//Filtering by month and year
	//like  ?month=1&?year=2025
	@GetMapping("?month={month}&year={year}")
	ResponseEntity<ApiResponse<List<SubscriptionRespDto>>> getAboutSubscription(
			@RequestParam int month,
			@RequestParam int year
	){
		List<Subscription> subscrpMonthYear = subscriptionService.subscriptionMonthYear(month, year);
		List<SubscriptionRespDto> data =subscrpMonthYear.stream()
				.map(
						subscr -> subscriptionMapper.subscriptionToDto(subscr)
				)
				.toList();
		
		return ResponseEntity.ok(
				ApiResponse.<List<SubscriptionRespDto>>builder()
				.success(true)
				.message("about Subscription successful")
				.data(data)
				.build()
		);
				
	}
	
	@PutMapping("/{id}")
	ResponseEntity<ApiResponse<SubscriptionRespDto>> updateSubscription(
			@PathVariable Long id,
			@RequestBody SubscriptionReqDto subscription
	){
		//before pass the subscriptionReqDto in the update service 
		//we call the subcrtiption Mapper inside for converting the subscriptionRequest
		Subscription modifiedSubscr = subscriptionService.updateSubscription(subscriptionMapper.dtoToSubscription(subscription));
		return ResponseEntity.ok(
				ApiResponse.<SubscriptionRespDto>builder()
				.success(true)
				.message("Subscription updat is Successful")
				.data(
						//convert the subscrtipn to subscriptionRespDto
						subscriptionMapper.subscriptionToDto(modifiedSubscr)
						
				)
				.build()
				);
	}
	
	@DeleteMapping("/{idSubscr}")
	ResponseEntity<ApiResponse<Void>> deleteSubscripton(@PathVariable("idSubscr") Long idSubscr){
		subscriptionService.removeSubscription(idSubscr);
		return ResponseEntity.noContent()
				.build();
		
	}
	
	
}
