/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/SQLTemplate.sql to edit this template
 */
/**
 * Author:  Hoang Duong
 * Created: Apr 24, 2025
 */
--create database EnglishSystem
--use EnglishSystem;



-- Group table (cannot be deleted)
CREATE TABLE group_user (
    group_user_id INT PRIMARY KEY IDENTITY(1, 1) NOT NULL,
    group_name NVARCHAR(50) NOT NULL,
);

-- Users table (deleting also deletes post_history, word_history, exam_history, collection_has_user)
CREATE TABLE _user (
    user_id INT PRIMARY KEY IDENTITY(1, 1) NOT NULL,
    name NVARCHAR(100) NOT NULL,
    avatar NVARCHAR(255) NULL,
    group_user_id INT NOT NULL,
username NVARCHAR(50) UNIQUE NOT NULL,
    email NVARCHAR(255) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    FOREIGN KEY (group_user_id) REFERENCES group_user(group_user_id)
);


-- Language table (cannot be deleted)
CREATE TABLE language (
    language_id INT PRIMARY KEY IDENTITY(1, 1) NOT NULL,
    language_name NVARCHAR(50) NOT NULL,
);

-- Translation type table (cannot be deleted)
CREATE TABLE type_translate (
    type_translate_id INT PRIMARY KEY IDENTITY(1, 1) NOT NULL,
    type_translate_name NVARCHAR(50) NOT NULL,
);

-- Word table (soft delete > hard delete collection_has_word > translate > definition)
CREATE TABLE word (
    word_id INT PRIMARY KEY IDENTITY(1, 1) NOT NULL,
    language_id INT NOT NULL,
    word_name NVARCHAR(100) NOT NULL,
    pronunciation NVARCHAR(100),
    sound NVARCHAR(255),
    FOREIGN KEY (language_id) REFERENCES language(language_id),
    is_deleted BIT DEFAULT 0 NOT NULL
);

-- Translation table (hard delete)
CREATE TABLE translate (
    translate_id INT PRIMARY KEY IDENTITY(1, 1) NOT NULL,
    source_word_id INT NOT NULL,
    trans_word_id INT NOT NULL,
    type_translate_id INT NOT NULL,
    FOREIGN KEY (source_word_id) REFERENCES word(word_id),
    FOREIGN KEY (trans_word_id) REFERENCES word(word_id),
    FOREIGN KEY (type_translate_id) REFERENCES type_translate(type_translate_id),
);

-- Definition table (hard delete)
CREATE TABLE definition (
    definition_id INT PRIMARY KEY IDENTITY(1, 1) NOT NULL,
    word_id INT NOT NULL,
    meaning NVARCHAR(500),
    example NVARCHAR(500),
    word_type NVARCHAR(50),
    FOREIGN KEY (word_id) REFERENCES word(word_id),
);

-- Collection table (hard delete > hard delete collection_has_user, collection_has_word)
CREATE TABLE collection (
    collection_id INT PRIMARY KEY IDENTITY(1, 1) NOT NULL,
    collection_name NVARCHAR(100) NOT NULL,
    is_public BIT DEFAULT 1,
);

-- Collection-word relationship (hard delete)
CREATE TABLE collection_has_word (
    collection_word_id INT PRIMARY KEY IDENTITY(1, 1) NOT NULL,
    collection_id INT NOT NULL,
    word_id INT NOT NULL,
    FOREIGN KEY (collection_id) REFERENCES collection(collection_id),
    FOREIGN KEY (word_id) REFERENCES word(word_id),
);

-- Collection-user relationship (hard delete)
CREATE TABLE collection_has_user (
    collection_user_id INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
    collection_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (collection_id) REFERENCES collection(collection_id),
    FOREIGN KEY (user_id) REFERENCES _user(user_id),
);



-- Word history (cannot be deleted, can be deleted when user is deleted)
CREATE TABLE word_history (
    word_history_id INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
    user_id INT NOT NULL,
    word_id INT NOT NULL,
    word_history_date SMALLDATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES _user(user_id),
    FOREIGN KEY (word_id) REFERENCES word(word_id)
);


-- Topic table (hard delete > hard delete subtopic > move posts/exams to default subtopic id=1)
CREATE TABLE topic (
    topic_id INT PRIMARY KEY IDENTITY(1, 1) NOT NULL,
    topic_name NVARCHAR(200) NOT NULL,
);

-- Subtopic table (hard delete > move posts/exams to default subtopic id=1)
CREATE TABLE sub_topic (
    sub_topic_id INT PRIMARY KEY IDENTITY(1, 1) NOT NULL,
    sub_topic_name NVARCHAR(300) NOT NULL,
    topic_id INT NOT NULL,
    FOREIGN KEY (topic_id) REFERENCES topic(topic_id),
);

-- Post table (soft delete because has history)
CREATE TABLE post (
    post_id INT PRIMARY KEY IDENTITY(1, 1) NOT NULL,
    post_name NVARCHAR(400) NOT NULL,
    content NVARCHAR(MAX),
    sub_topic_id INT NOT NULL,
    FOREIGN KEY (sub_topic_id) REFERENCES sub_topic(sub_topic_id),
	is_deleted BIT DEFAULT 0 NOT NULL

);
-- Post history (cannot be deleted, can be deleted when user is deleted)
CREATE TABLE post_history (
    post_history_id INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
    user_id INT NOT NULL,
    post_id INT NOT NULL,     
    post_history_date SMALLDATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES _user(user_id),
    FOREIGN KEY (post_id) REFERENCES post(post_id)
);

-- Reading passage table (hard delete > delete all related questions and answers)
CREATE TABLE reading (
    reading_id INT PRIMARY KEY IDENTITY(1, 1) NOT NULL,
    title NVARCHAR(100) NOT NULL,
    content NVARCHAR(MAX) NOT NULL
);

-- Exam table (soft delete > hard delete exam_has_question, exam_has_reading)
CREATE TABLE exam (
    exam_id INT PRIMARY KEY IDENTITY(1, 1) NOT NULL,
    name NVARCHAR(200) NOT NULL,
    sub_topic_id INT NOT NULL,
    FOREIGN KEY (sub_topic_id) REFERENCES sub_topic(sub_topic_id),
    is_deleted BIT DEFAULT 0 NOT NULL
);
CREATE TABLE question_type (
    question_type_id INT PRIMARY KEY IDENTITY(1, 1) NOT NULL,
    question_type_name NVARCHAR(50) NOT NULL
);

-- Question table (hard delete > hard delete answers)
CREATE TABLE question (
    question_id INT PRIMARY KEY IDENTITY(1, 1) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    question_type_id INT NOT NULL,
    FOREIGN KEY (question_type_id) REFERENCES question_type(question_type_id)
);

-- Answer table (hard delete)
CREATE TABLE answer (
    answer_id INT PRIMARY KEY IDENTITY(1, 1) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    is_correct BIT NOT NULL,
    question_id INT NOT NULL,
    FOREIGN KEY (question_id) REFERENCES question(question_id)
);

-- Exam-question relationship (hard delete)
CREATE TABLE exam_has_question (
    exam_question_id INT PRIMARY KEY IDENTITY(1, 1) NOT NULL,
    exam_id INT NOT NULL,
    question_id INT NOT NULL,
    FOREIGN KEY (exam_id) REFERENCES exam(exam_id),
    FOREIGN KEY (question_id) REFERENCES question(question_id)
);

-- Exam-reading relationship (hard delete)
CREATE TABLE exam_has_reading (
    exam_reading_id INT PRIMARY KEY IDENTITY(1, 1) NOT NULL,
    exam_id INT NOT NULL,
    reading_id INT NOT NULL,
    FOREIGN KEY (exam_id) REFERENCES exam(exam_id),
    FOREIGN KEY (reading_id) REFERENCES reading(reading_id)
);

-- Exam history (cannot be deleted, deleted when user is deleted)
CREATE TABLE exam_history (
    exam_history_id INT PRIMARY KEY IDENTITY(1, 1) NOT NULL,
    correct_number INT NOT NULL,
    wrong_number INT NOT NULL,
    total_question INT NOT NULL,
    user_id INT NOT NULL,
    exam_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES _user(user_id),
    FOREIGN KEY (exam_id) REFERENCES exam(exam_id),
);
CREATE TABLE reading_question (
    reading_question_id INT PRIMARY KEY IDENTITY(1, 1) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    question_type_id INT NOT NULL,
    reading_id INT NOT NULL,
    FOREIGN KEY (question_type_id) REFERENCES question_type(question_type_id),
    FOREIGN KEY (reading_id) REFERENCES reading(reading_id)
);


-- Answer table (hard delete)
CREATE TABLE reading_answer (
    reading_answer_id INT PRIMARY KEY IDENTITY(1, 1) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    is_correct BIT NOT NULL,
    reading_question_id INT NOT NULL,
    FOREIGN KEY (reading_question_id) REFERENCES reading_question(reading_question_id)
);

