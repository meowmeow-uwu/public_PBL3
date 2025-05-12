package com.pbl3.service;

import java.util.ArrayList;

import com.pbl3.dto.Answer;

public interface AnswerServiceInterface extends ServiceInterface<Answer> {
    public ArrayList<Answer> selectByQuestionID(int id);
}
