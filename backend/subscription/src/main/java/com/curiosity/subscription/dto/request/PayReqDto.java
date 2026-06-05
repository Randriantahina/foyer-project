package com.curiosity.subscription.dto.request;

import java.math.BigDecimal;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Données pour enregistrer un paiement")
public class PayReqDto {

	@Schema(description = "Montant payé", example = "5000.00")
	private BigDecimal amountPaid;

	@Schema(description = "Note ou commentaire sur le paiement", example = "Paiement en espèces")
	private String note;
}
