package com.curiosity.subscription.dto.request;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Schema(description = "Données pour créer ou mettre à jour un membre")
public class MemberReqDto {

	@Schema(description = "Prénom du membre", example = "Jean")
	private String firstName;

	@Schema(description = "Nom de famille du membre", example = "Dupont")
	private String lastName;

	@Schema(description = "Numéro de téléphone (unique)", example = "+261340000000")
	private String phoneNumber;

	@Schema(description = "Date de paiement", example = "2025-01-15T10:30:00")
	private LocalDateTime payedAt;
}
