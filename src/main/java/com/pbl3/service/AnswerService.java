package com.pbl3.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

import com.pbl3.dao.AnswerDAO;
import com.pbl3.dao.QuestionDAO;
import com.pbl3.dto.Answer;
import com.pbl3.dto.ReviewQuestionDTO;
import com.pbl3.dto.SubmissionDTO;
import com.pbl3.dto.Question;

public class AnswerService implements AnswerServiceInterface{
    private AnswerDAO answerDAO;
    private QuestionDAO questionDAO;
    public AnswerService() {
        answerDAO = new AnswerDAO();
        questionDAO = new QuestionDAO();
    }

    @Override
    public int insert(Answer t) {
        return answerDAO.insert(t);
}

    @Override
    public int update(Answer t) {
        return answerDAO.update(t);
    }

    @Override
    public int delete(int t) {
        return answerDAO.delete(t);
    }

    @Override
    public ArrayList<Answer> selectAll() {
        return answerDAO.selectAll();
 }

    @Override
    public Answer selectByID(int id) {
        return answerDAO.selectByID(id);
 }

    @Override
    public Answer selectByCondition(String condition) {
        return answerDAO.selectByCondition(condition);
    }

    @Override
    public ArrayList<Answer> selectByQuestionID(int id) {
        return answerDAO.selectByQuestionID(id);
    }

    public ArrayList<Answer> selectTempByQuestionID(int id) {
        if(new QuestionService().selectByID(id).getQuestion_type_id() == 2) {
            return null;
        }
        ArrayList<Answer> allAnswers = answerDAO.selectByQuestionID(id);
        ArrayList<Answer> correctAnswers = new ArrayList<>();
        ArrayList<Answer> incorrectAnswers = new ArrayList<>();
    
        for (Answer answer : allAnswers) {
            if (answer.isCorrect()) {
                correctAnswers.add(answer);
            } else {
                incorrectAnswers.add(answer);
            }
        }
    
        Collections.shuffle(correctAnswers);
        Collections.shuffle(incorrectAnswers);
    
        ArrayList<Answer> finalAnswers = new ArrayList<>();
    
        if (!correctAnswers.isEmpty()) {
            finalAnswers.add(correctAnswers.get(0));
        }
    
        int numberOfIncorrectToAdd = Math.min(3, incorrectAnswers.size());
        for (int i = 0; i < numberOfIncorrectToAdd; i++) {
            finalAnswers.add(incorrectAnswers.get(i));
        }

        for(Answer answer : finalAnswers) {
            answer.setCorrect(false);
        }
    
        Collections.shuffle(finalAnswers);
    
        return finalAnswers;
    }

public List<ReviewQuestionDTO> checkAnswers(List<SubmissionDTO> submissions) {
    List<ReviewQuestionDTO> reviews = new ArrayList<>();

    for (SubmissionDTO submission : submissions) {
        Question question = questionDAO.selectByID(submission.getQuestion_id());
        if (question == null) continue;

        ReviewQuestionDTO review = new ReviewQuestionDTO();
        review.setQuestion_id(question.getQuestion_id());
        review.setContent(question.getContent());
        review.setQuestion_type_id(question.getQuestion_type_id());

        boolean isCorrect = false;

        if (question.getQuestion_type_id() == 1) { 
            List<Answer> allOptions = answerDAO.selectByQuestionID(question.getQuestion_id());
            if (allOptions == null) {
                allOptions = new ArrayList<>();
            }
            review.setAnswers(allOptions);
            
            List<Answer> correctAnswers = answerDAO.selectTrueByQuestionID(question.getQuestion_id());
            if (correctAnswers == null) {
                correctAnswers = new ArrayList<>();
            }

            List<Integer> correctIds = correctAnswers.stream()
                .map(Answer::getAnswer_id)
                .collect(Collectors.toList());

            if (submission.getAnswerIdList() != null && !submission.getAnswerIdList().isEmpty()) {
                isCorrect = new HashSet<>(submission.getAnswerIdList()).equals(new HashSet<>(correctIds));
            } else if (submission.getAnswer_id() != null) {
                isCorrect = correctIds.size() == 1 && correctIds.contains(submission.getAnswer_id());
            }

        } else if (question.getQuestion_type_id() == 2) { 
                List<Answer> correctAnswers = answerDAO.selectTrueByQuestionID(question.getQuestion_id());
            if (correctAnswers == null) {
                correctAnswers = new ArrayList<>();
            }
            
            List<String> correctAnswerContents = correctAnswers.stream()
                                                               .map(Answer::getContent)
                                                               .collect(Collectors.toList());
            review.setAnswer_list(correctAnswerContents);

            if (submission.getAnswer() != null) {
                isCorrect = correctAnswerContents.stream()
                        .anyMatch(correct -> correct.equalsIgnoreCase(submission.getAnswer().trim()));
            }
        }
        
        review.setAnswer(isCorrect);
        reviews.add(review);
    }
    return reviews;
}
}