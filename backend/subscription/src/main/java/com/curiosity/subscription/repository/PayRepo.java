package com.curiosity.subscription.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.curiosity.subscription.model.Pay;

@Repository
public interface PayRepo extends JpaRepository<Pay, Long>{
	@Query(
			nativeQuery=true,
			value="""
					SELECT 
					* 
					FROM subscription_db.pay  pay
					WHERE pay.subscription_id IN (
						SELECT 
							id 
						FROM subscription_db.subscription subscrp
						WHERE subscrp.month=:month AND subscrp.year=:year
		
					)
					
				"""
	)
	List<Pay> payForMonthYear(
			@Param(value="month") int month,
			@Param(value="year") int year
	);
	
	
}
