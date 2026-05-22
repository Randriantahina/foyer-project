package com.curiosity.subscription.model;

import java.util.LinkedHashSet;

import jakarta.persistence.Column;
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
@Table(name="member")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Member {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private long id;
	@Column(nullable=false)
	private String firstName;
	@Column(nullable=false)
	private String lastName;
	@Column(nullable=false)
	private String phoneNumber;	
	
	@OneToMany(mappedBy = "member")
	private LinkedHashSet<Pay> pay = new LinkedHashSet<>();
	
	
}
