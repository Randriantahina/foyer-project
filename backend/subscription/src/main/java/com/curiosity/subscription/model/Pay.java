package com.curiosity.subscription.model;

import java.math.BigDecimal;
import java.sql.Timestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Pay {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private long id;
	
	private boolean isPaid;
	@Column(name="paid_at")
	private Timestamp paidAt;
	@Lob
	private String note;
	@Column(name="amount_paid")
	private BigDecimal amountPaid;
	
	@ManyToOne()
	@JoinColumn(name="member_id")
	private Member member;
	
	@ManyToOne()
	@JoinColumn(name="subscription_per_month_id")
	private SubscriptionPerMonth subscription ;
}
