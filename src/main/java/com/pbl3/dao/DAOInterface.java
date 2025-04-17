/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.pbl3.dao;

/**
 *
 * @author Danh
 */
import java.util.ArrayList;

public interface DAOInterface<T> {
	
	public int insert(T t);
	public int update(T t);
	public int delete(T t);
	public ArrayList<T> selectAll();
	public T selectByID(T t);
	public T selectByCondition(String condition);
}

