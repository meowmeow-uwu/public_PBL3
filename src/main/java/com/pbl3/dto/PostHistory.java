/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.pbl3.dto;

import java.io.Serializable;
import java.util.Date;
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

public class PostHistory implements Serializable{
    private int post_history_id;
    private int user_id;
    private int post_id;
    private Date date;
}
