/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.dto;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 *
 * @author Danh
 */
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString

public class Answer implements Serializable{
    private int answer_id;
    private int question_id;
    private String content;
    @JsonProperty("is_correct")
    private boolean isCorrect;
}
