package com.curiosity.subscription.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.curiosity.subscription.model.Subscription;

@Repository
public interface SubscriptionRepo  extends JpaRepository<Subscription,Long>{
	@Query(
			nativeQuery=true,
			value="SELECT * FROM subscription_db.subscription WHERE month=:month AND year=:year"
	)
	List<Subscription >AboutSubscription(@Param(value="month") int month, @Param(value="year") int year);
}
