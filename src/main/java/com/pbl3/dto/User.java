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

public class User implements Serializable{
    private int user_id;
    private String username;
    private String email;
    private String password;
    private String name;
    private String avatar;
    //Foreign key UserGroup
    private int group_user_id;
}
