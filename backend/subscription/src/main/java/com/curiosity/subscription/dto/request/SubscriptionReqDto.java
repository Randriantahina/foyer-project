package com.curiosity.subscription.dto.request;

import java.math.BigDecimal;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Schema(description = "Données pour créer ou mettre à jour un abonnement")
public class SubscriptionReqDto {

	@Schema(description = "Nom de l'abonnement", example = "Cotisation mensuelle")
	private String name;

	@Schema(description = "Mois (1-12)", example = "1")
	private Integer month;

	@Schema(description = "Année", example = "2025")
	private Integer year;

	@Schema(description = "Montant de l'abonnement", example = "5000.00")
	private BigDecimal amount;
}
