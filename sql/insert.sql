/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/SQLTemplate.sql to edit this template
 */
/**
 * Author:  Hoang Duong
 * Created: Apr 24, 2025
 */

INSERT INTO group_user (group_name)
VALUES 
    (N'quản lý'),
    (N'người dùng'),
    (N'nhân viên');


	INSERT INTO _user (name, avatar, group_user_id)
VALUES 
    (N'Nguyễn Văn A', NULL, 1), -- quản lý
    (N'Trần Thị B', NULL, 2),   -- người dùng
    (N'Lê Văn C', NULL, 3);    -- nhân viên


	INSERT INTO account (username, email, password, user_id)
VALUES
    (N'admin1', N'admin1@example.com', '8c00c375d20e6a2b4cd25bfa4c1b2343fc3c2f6f99dd88d87808f937161ce63f', 1),
    (N'user1', N'user1@example.com', '8c00c375d20e6a2b4cd25bfa4c1b2343fc3c2f6f99dd88d87808f937161ce63f', 2),
    (N'staff1', N'staff1@example.com', '8c00c375d20e6a2b4cd25bfa4c1b2343fc3c2f6f99dd88d87808f937161ce63f', 3);


	
-- Thêm dữ liệu vào bảng language
INSERT INTO language (language_name)
VALUES (N'Anh'), (N'Việt');

-- Thêm dữ liệu vào bảng type_translate
INSERT INTO type_translate (type_translate_name)
VALUES (N'Anh-Việt');





-- Thêm từ mới
INSERT INTO word (language_id, word_name, pronunciation, sound)
VALUES 
(1, N'hello', N'həˈləʊ', 'hello.mp3'),
(2, N'xin chào', N'sin chao', 'xin_chao.mp3'),
(1, N'apple', N'ˈæp.əl', 'apple.mp3'),
(2, N'quả táo', N'qua tao', 'qua_tao.mp3'),
(1, N'run', N'rʌn', 'run.mp3'),
(2, N'chạy', N'chay', 'chay.mp3');

-- Thêm bản dịch (translate)
INSERT INTO translate (source_word_id, trans_word_id, type_translate_id)
VALUES 
(1, 2, 1), -- hello -> xin chào
(3, 4, 1), -- apple -> quả táo
(5, 6, 1); -- run -> chạy


-- Thêm định nghĩa (definition)
INSERT INTO definition (word_id, meaning, example, word_type)
VALUES 
(1, 'A greeting or expression of goodwill.', 'She said hello to everyone.', 'interjection'),
(3, 'A fruit that is round and red or green.', 'I eat an apple every day.', 'noun'),
(5, 'To move swiftly on foot.', 'He runs every morning.', 'verb');


-- Thêm định nghĩa cho từ "xin chào" (word_id = 2)
INSERT INTO definition (word_id, meaning, example, word_type)
VALUES 
(2, N'Một lời chào hỏi thể hiện sự thân thiện.', N'Cô ấy nói "xin chào" với mọi người.', N'thán từ');

-- Thêm định nghĩa cho từ "quả táo" (word_id = 4)
INSERT INTO definition (word_id, meaning, example, word_type)
VALUES 
(4, N'Một loại trái cây tròn, có màu đỏ hoặc xanh, thường được ăn sống.', N'Tôi ăn một quả táo mỗi ngày.', N'danh từ');

-- Thêm định nghĩa cho từ "chạy" (word_id = 6)
INSERT INTO definition (word_id, meaning, example, word_type)
VALUES 
(6, N'Hành động di chuyển nhanh bằng chân.', N'Anh ấy chạy bộ mỗi sáng.', N'động từ');


-- Thêm dữ liệu mẫu vào bảng collection
INSERT INTO collection (collection_name, is_public)
VALUES 
(N'Từ vựng tiếng Anh', 1),  -- collection_id = 1, công khai
(N'Từ vựng tiếng Việt', 0), -- collection_id = 2, riêng tư
(N'Từ vựng chuyên ngành', 1); -- collection_id = 3, công khai


-- Thêm mối quan hệ giữa bộ sưu tập và từ vựng
INSERT INTO collection_has_word (collection_id, word_id)
VALUES 
(1, 1),  -- "Từ vựng tiếng Anh" chứa từ với word_id = 1 (hello)
(1, 3),  -- "Từ vựng tiếng Anh" chứa từ với word_id = 3 (apple)
(2, 2),  -- "Từ vựng tiếng Việt" chứa từ với word_id = 2 (xin chào)
(2, 4),  -- "Từ vựng tiếng Việt" chứa từ với word_id = 4 (quả táo)
(3, 1),  -- "Từ vựng chuyên ngành" chứa từ với word_id = 1 (hello)
(3, 5);  -- "Từ vựng chuyên ngành" chứa từ với word_id = 5 (run)


-- Thêm dữ liệu mẫu vào bảng word_history
INSERT INTO word_history (user_id, word_id, word_history_date)
VALUES 
(2, 1, '2025-04-24 10:00'),  -- Người dùng với user_id = 2 học từ "hello" (word_id = 1) vào ngày 24/04/2025
(2, 2, '2025-04-23 11:15'),  -- Người dùng với user_id = 2 học từ "xin chào" (word_id = 2) vào ngày 23/04/2025
(2, 3, '2025-04-22 14:30'),  -- Người dùng với user_id = 2 học từ "apple" (word_id = 3) vào ngày 22/04/2025
(2, 4, '2025-04-21 09:45'),  -- Người dùng với user_id = 2 học từ "quả táo" (word_id = 4) vào ngày 21/04/2025
(2, 5, '2025-04-20 16:00');  -- Người dùng với user_id = 2 học từ "run" (word_id = 5) vào ngày 20/04/2025


-- Thêm chủ đề về "Học Ngữ Pháp Tiếng Anh"
INSERT INTO topic (topic_name)
VALUES 
(N'Học Ngữ Pháp Tiếng Anh');


-- Thêm sub-topic về ngữ pháp tiếng Anh
INSERT INTO sub_topic (sub_topic_name, topic_id)
VALUES 
(N'Các thì trong tiếng Anh', 1),  -- Sub-topic về các thì trong tiếng Anh
(N'Cấu trúc câu trong tiếng Anh', 1),  -- Sub-topic về cấu trúc câu
(N'Phương thức câu hỏi', 1),  -- Sub-topic về câu hỏi trong tiếng Anh
(N'Từ vựng và ngữ pháp cơ bản', 1);  -- Sub-topic về từ vựng và ngữ pháp cơ bản

-- Thêm bài đăng về các chủ đề ngữ pháp tiếng Anh
INSERT INTO post (post_name, content, sub_topic_id, is_deleted)
VALUES 
(N'Hiểu về các thì trong tiếng Anh', N'Tìm hiểu các thì trong tiếng Anh và cách sử dụng chúng trong câu.', 1, 0),  -- Bài đăng về các thì
(N'Các cấu trúc câu trong tiếng Anh', N'Giới thiệu về các cấu trúc câu cơ bản trong tiếng Anh.', 2, 0),  -- Bài đăng về cấu trúc câu
(N'Câu hỏi trong tiếng Anh', N'Giới thiệu về cách tạo câu hỏi trong tiếng Anh.', 3, 0),  -- Bài đăng về câu hỏi
(N'Từ vựng cơ bản trong tiếng Anh', N'Một số từ vựng và ngữ pháp cơ bản để giúp người học tiếng Anh.', 4, 0);  -- Bài đăng về từ vựng và ngữ pháp cơ bản

-- Thêm lịch sử chỉnh sửa bài đăng vào bảng post_history
INSERT INTO post_history (user_id, post_id, post_history_date)
VALUES 
(2, 1, '2025-04-24 10:00'),  -- Người dùng với user_id = 2 chỉnh sửa bài đăng "Hiểu về các thì trong tiếng Anh"
(2, 2, '2025-04-23 11:15'),  -- Người dùng với user_id = 2 chỉnh sửa bài đăng "Các cấu trúc câu trong tiếng Anh"
(2, 3, '2025-04-22 14:30'),  -- Người dùng với user_id = 2 chỉnh sửa bài đăng "Câu hỏi trong tiếng Anh"
(2, 4, '2025-04-21 09:45');  -- Người dùng với user_id = 2 chỉnh sửa bài đăng "Từ vựng cơ bản trong tiếng Anh"



-- Thêm dữ liệu vào bảng reading
INSERT INTO reading (title, content)
VALUES 
(N'English Grammar Basics', N'This passage explains the basics of English grammar, including parts of speech, sentence structure, and tenses.'),
(N'Tips for Learning English Vocabulary', N'This passage provides tips and strategies for improving English vocabulary, including techniques for memorization and practical usage.');

-- Thêm dữ liệu vào bảng question_type
INSERT INTO question_type (question_type_name)
VALUES 
(N'Trắc nghiệm'),  -- Câu hỏi trắc nghiệm
(N'Điền vào ô trống');  -- Câu hỏi đúng/sai

-- Thêm dữ liệu vào bảng question
INSERT INTO question (content, question_type_id)
VALUES 
(N'What is the correct sentence structure in English?', 1),  -- Câu hỏi trắc nghiệm về cấu trúc câu
(N'Is English grammar important for communication?', 2),  -- Câu hỏi đúng/sai về vai trò của ngữ pháp
(N'Fill in the blank: The cat ___ on the mat.', 2);  -- Câu hỏi điền vào chỗ trống về ngữ pháp

-- Thêm dữ liệu vào bảng answer
INSERT INTO answer (content, is_correct, question_id)
VALUES 
(N'Subject + Verb + Object', 1, 1),  -- Câu trả lời đúng cho câu hỏi về cấu trúc câu
(N'True', 1, 2),  -- Câu trả lời đúng cho câu hỏi đúng/sai
(N'Sits', 1, 3);  -- Câu trả lời đúng cho câu hỏi điền vào chỗ trống

-- Thêm dữ liệu vào bảng exam
INSERT INTO exam (name, sub_topic_id, is_deleted)
VALUES 
(N'English Grammar Test', 3, 0),  -- Bài kiểm tra về ngữ pháp tiếng Anh
(N'Vocabulary Practice Test', 2, 0);  -- Bài kiểm tra về từ vựng tiếng Anh


-- Thêm dữ liệu vào bảng exam_has_question
INSERT INTO exam_has_question (exam_id, question_id)
VALUES 
(1, 1),  -- Câu hỏi về cấu trúc câu cho bài kiểm tra ngữ pháp
(1, 2),  -- Câu hỏi về đúng/sai cho bài kiểm tra ngữ pháp
(2, 3);  -- Câu hỏi điền vào chỗ trống cho bài kiểm tra từ vựng



-- Thêm dữ liệu vào bảng exam_has_reading
INSERT INTO exam_has_reading (exam_id, reading_id)
VALUES 
(1, 1),  -- Bài kiểm tra ngữ pháp có bài đọc "English Grammar Basics"
(2, 2);  -- Bài kiểm tra từ vựng có bài đọc "Tips for Learning English Vocabulary"


-- Thêm dữ liệu vào bảng reading_question
INSERT INTO reading_question (content, question_type_id, reading_id)
VALUES 
(N'What is the main topic of the passage?', 1, 1),  -- Câu hỏi trắc nghiệm về chủ đề bài đọc "English Grammar Basics"
(N'Is it true that reading can improve vocabulary?', 2, 2);  -- Câu hỏi đúng/sai về tác dụng của đọc đối với từ vựng

-- Thêm dữ liệu vào bảng reading_answer
INSERT INTO reading_answer (content, is_correct, reading_question_id)
VALUES 
(N'English grammar basics', 1, 1),  -- Câu trả lời đúng cho câu hỏi về chủ đề bài đọc "English Grammar Basics"
(N'True', 1, 2);  -- Câu trả lời đúng cho câu hỏi đúng/sai về bài đọc "Tips for Learning English Vocabulary"


-- Thêm dữ liệu vào bảng exam_history
INSERT INTO exam_history (correct_number, wrong_number, total_question, user_id, exam_id)
VALUES 
(3, 0, 3, 2, 1),  -- Người dùng với user_id = 2 thi bài kiểm tra ngữ pháp và trả lời đúng cả 3 câu
(2, 1, 3, 2, 2);  -- Người dùng với user_id = 2 thi bài kiểm tra từ vựng và trả lời đúng 2 câu
