package com.curiosity.subscription.model;

import java.math.BigDecimal;
import java.util.LinkedHashSet;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="subcription_per_month")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class SubscriptionPerMonth {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private long id;
	private String name;
	private Integer month;
	private Integer year;
	private BigDecimal amount;
	
	@OneToMany(mappedBy = "subscription")
	private LinkedHashSet<Pay> pay = new LinkedHashSet<>();
	
	

}
