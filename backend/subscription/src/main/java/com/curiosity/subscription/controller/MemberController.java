package com.curiosity.subscription.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.curiosity.subscription.service.MemberService;
import com.curiosity.subscription.dto.request.MemberReqDto;
import com.curiosity.subscription.dto.response.ApiResponse;
import com.curiosity.subscription.dto.response.MemberRespDto;
import com.curiosity.subscription.exception.MemberNotFoundException;
import com.curiosity.subscription.mapper.MemberMapper;
import com.curiosity.subscription.model.Member;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/{version}/members")
@RequiredArgsConstructor
@CrossOrigin
public class MemberController {
	private final MemberService memberService;
	private final MemberMapper memberMapper;
	
	@PostMapping
	ResponseEntity<ApiResponse<MemberRespDto>> saveMember(@RequestBody MemberReqDto memberReqDto) {
		Member newOne = memberMapper.memberDtoMember(memberReqDto) ;
		MemberRespDto data = memberMapper.memberToDto(memberService.addNewMember(newOne));
		return ResponseEntity.ok(
				ApiResponse.<MemberRespDto>builder()
				.success(true)
				.message("Adding member Successful")
				.data(data)
				.build()
				
				);
	}
	
	@GetMapping("/{id}")
	ResponseEntity<ApiResponse<MemberRespDto>> getMemberById(@PathVariable Long id) throws  MemberNotFoundException{
		Member member = memberService.findAnyMemberById(id);
		return ResponseEntity.ok(
				ApiResponse.<MemberRespDto>builder()
				.success(true)
				.message("Adding member Successful")
				.data(memberMapper.memberToDto(member))
				.build()
				
				);
	}

	//filtering by a member's name 
	@GetMapping("?name={name}")
	ResponseEntity<ApiResponse<List<MemberRespDto>>> getMemberByName(@RequestParam String name){
		List<MemberRespDto> listMemberMatchName =memberService.findMemberByName(name)
				.stream()
				.map(member ->  memberMapper.memberToDto(member))
				.toList();
		
		return  ResponseEntity.ok(
				ApiResponse.<List<MemberRespDto>>builder()
				.success(true)
				.message("Adding member Successful")
				.data(listMemberMatchName)
				.build()
				
				);
	}
	
	
	@GetMapping
	ResponseEntity<ApiResponse<List<MemberRespDto>>> getAllMember(){
		List<MemberRespDto> listAllMember =memberService.findAllMember()
				.stream()
				.map(member ->  memberMapper.memberToDto(member))
				.toList();
		
		return  ResponseEntity.ok(
				ApiResponse.<List<MemberRespDto>>builder()
				.success(true)
				.message("Adding member Successful")
				.data(listAllMember)
				.build()
				
				);
	}
	
	@PutMapping
	ResponseEntity<ApiResponse<MemberRespDto>> putMember(@RequestBody Member member) throws Exception {
		MemberRespDto memberUpdate = memberMapper.memberToDto(memberService.updateMember(member));
		return ResponseEntity.ok(
					ApiResponse.<MemberRespDto>builder()
					.success(true)
					.message("Updating member Succesful")
					.data(memberUpdate)
					.build()
				);
	}
	
	@DeleteMapping("/{id}")
	ResponseEntity<ApiResponse<Void>> DeleteMember(@PathVariable Long id) {
		memberService.deleteMember(id);
		return ResponseEntity.status(HttpStatus.NO_CONTENT)
				.body(
						ApiResponse.<Void>builder()
						.success(true)
						.message("Delet member Successful")
						.data(null)
						.build()
						
				);
		}
	
	@DeleteMapping
	ResponseEntity<ApiResponse<Void>> DelectSelectedMember(@RequestParam List<Long> memberIds) {
		memberService.deleteManyMember(memberIds);
		return ResponseEntity.status(HttpStatus.NO_CONTENT)
				.body(
						ApiResponse.<Void>builder()
						.success(true)
						.message("Delet member Successful")
						.data(null)
						.build()
						
				);
	}
}
	

