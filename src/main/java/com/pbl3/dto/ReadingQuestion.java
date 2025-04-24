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

/**
 *
 * @author Danh
 */
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString

public class ReadingQuestion implements Serializable{
    private int reading_question_id;
    private int reading_id;
    private int question_type_id;
    private String content;
}
