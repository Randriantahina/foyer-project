package com.curiosity.subscription.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder

public class Pay {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id;
	
	private boolean isPaid;
	@Column(name="paid_at")
	@CreationTimestamp
	private LocalDateTime payedAt;
	@Lob
	private String note;
	@Column(name="amount_paid")
	private BigDecimal amountPaid;
	
	@ManyToOne()
	@JoinColumn(name="member_id")
	private Member member;
	
	@ManyToOne()
	@JoinColumn(name="subscription_id")
	private Subscription subscription ;
}
