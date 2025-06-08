package com.pbl3.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubmissionDTO {
    private int question_id;
    private int question_type_id;
    
    private String answer; 
    
    private Integer answer_id; 
    
    @JsonProperty("answer_id_list")
    private List<Integer> answerIdList;
}