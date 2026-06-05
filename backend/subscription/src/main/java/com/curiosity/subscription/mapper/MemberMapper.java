package com.curiosity.subscription.mapper;

import org.springframework.stereotype.Component;

import com.curiosity.subscription.dto.request.MemberReqDto;
import com.curiosity.subscription.dto.response.MemberRespDto;
import com.curiosity.subscription.model.Member;

/*
   	This is a Mapper mannuel without a mapperStructor
   	because for now I don't know 
   	How to use It
  */
@Component
public class MemberMapper {
	public Member memberDtoMember(MemberReqDto memberReqDto) {
		Member member = Member.builder()
				.firstName(memberReqDto.getFirstName())
				.lastName(memberReqDto.getLastName())
				.phoneNumber(memberReqDto.getPhoneNumber())
				.build();
		
		return member;
	}
	
	public MemberRespDto memberToDto(Member member) {
		return  MemberRespDto.builder()
				.id(member.getId())
				.firstName(member.getFirstName())
				.lastName(member.getLastName())
				.phoneNumber(member.getPhoneNumber())
				.build();
	}
}
