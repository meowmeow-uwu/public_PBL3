package com.pbl3.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_EMPTY) 
public class ReviewQuestionDTO {
    private int question_id;
    private String content;
    private int question_type_id;
    
    private boolean answer;

    private List<Answer> answers;
    private List<String> answer_list;
}