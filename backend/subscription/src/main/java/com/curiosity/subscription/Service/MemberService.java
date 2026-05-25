package com.curiosity.subscription.Service;

import java.util.List;

import com.curiosity.subscription.exception.MemberNotFoundException;
import com.curiosity.subscription.model.Member;


public interface MemberService {
	Member addNewMember(Member newMember);
	
	Member findAnyMemberById(Long idMember) throws MemberNotFoundException;
	List<Member> findMemberByName(String Name);
	List<Member> findAllMember();
	
	Member updateMember(Member member) throws MemberNotFoundException;


	void deleteMember(Long idMember) ;
	void deleteManyMember(List<Long> idmembers);
}
