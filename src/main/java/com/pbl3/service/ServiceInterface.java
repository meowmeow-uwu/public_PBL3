/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.pbl3.service;

import java.util.ArrayList;

/**
 *
 * @author Danh
 */
public interface ServiceInterface<T> {
    	public int insert(T t);
	public int update(T t);
	public int delete(int t);
	public ArrayList<T> selectAll();
	public T selectByID(int id);
	public T selectByCondition(String condition);
}
