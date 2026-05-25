package com.curiosity.subscription.Service;

import java.util.List;


import org.springframework.stereotype.Service;

import com.curiosity.subscription.exception.MemberNotFoundException;
import com.curiosity.subscription.model.Member;
import com.curiosity.subscription.repository.MemberRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {
	private final MemberRepo memberRepo;
	
	@Override
	public Member addNewMember(Member newMember) {
		return memberRepo.save(newMember);
	}

	@Override
	public Member findAnyMemberById(Long idMember) throws MemberNotFoundException{
		return memberRepo.findById(idMember)
				.orElseThrow(() -> new MemberNotFoundException("member Don't Exist"));
	}
	

	@Override
	public List<Member> findMemberByName(String name) {
		return memberRepo.findByName(name);
	}

	@Override
	public List<Member> findAllMember() {
		return memberRepo.findAll();
	}

	@Override
	public Member updateMember(Member member) throws MemberNotFoundException{
		if(!memberRepo.existsById(member.getId())) {
			throw new MemberNotFoundException("Member not exist");
		}
		return memberRepo.save(member);
		
	}

	@Override
	public void deleteMember(Long idMember){
		memberRepo.deleteById(idMember);
		
	}

	@Override
	public void deleteManyMember(List<Long> idmembers) {
		memberRepo.deleteAllById(idmembers);
		
	}

}
