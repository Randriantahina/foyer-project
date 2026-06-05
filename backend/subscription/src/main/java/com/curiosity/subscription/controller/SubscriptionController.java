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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("api/{version}/subscriptions")
@RequiredArgsConstructor
@CrossOrigin
@Tag(name = "Subscriptions", description = "Gestion des abonnements")
public class SubscriptionController {
	private final SubscriptionService subscriptionService;
	private final  SubscriptionMapper subscriptionMapper;

	@Operation(summary = "Créer un abonnement")
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

	@Operation(summary = "Lister les abonnements disponibles")
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

	@Operation(summary = "Trouver un abonnement par ID")
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

	@Operation(summary = "Filtrer les abonnements par mois et année")
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

	@Operation(summary = "Mettre à jour un abonnement")
	@PutMapping("/{id}")
	ResponseEntity<ApiResponse<SubscriptionRespDto>> updateSubscription(
			@PathVariable Long id,
			@RequestBody SubscriptionReqDto subscription
	){
		Subscription modifiedSubscr = subscriptionService.updateSubscription(subscriptionMapper.dtoToSubscription(subscription));
		return ResponseEntity.ok(
				ApiResponse.<SubscriptionRespDto>builder()
				.success(true)
				.message("Subscription updat is Successful")
				.data(
						subscriptionMapper.subscriptionToDto(modifiedSubscr)
				)
				.build()
				);
	}

	@Operation(summary = "Supprimer un abonnement")
	@DeleteMapping("/{idSubscr}")
	ResponseEntity<ApiResponse<Void>> deleteSubscripton(@PathVariable("idSubscr") Long idSubscr){
		subscriptionService.removeSubscription(idSubscr);
		return ResponseEntity.noContent()
				.build();
	}
}
