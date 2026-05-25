package com.curiosity.subscription.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.curiosity.subscription.model.Member;

@Repository
public interface MemberRepo  extends JpaRepository<Member, Long>{
	@Query(
			nativeQuery=true,
			value="SELECT * FROM subscription_db.member WHERE first_name LIKE CONCAT('%', :name, '%') OR last_name LIKE CONCAT('%',:name,'%')"
	)
	List<Member> findByName(@Param(value = "name") String name);
}
