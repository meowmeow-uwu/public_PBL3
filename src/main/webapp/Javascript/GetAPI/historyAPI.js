const API_BASE_URL = window.APP_CONFIG.API_BASE_URL;

async function getAllHistories(type) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/history/?type=${type}`);
        return response;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Hàm lấy lịch sử theo ID
async function getHistoryById(id, type) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/history/${id}?type=${type}`);
        return response;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
// Hàm tiện ích để thực hiện fetch với Authorization header (giữ nguyên)
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem("token");
    const headers = {
        ...options.headers,
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    try {
        const response = await fetch(url, {...options, headers});
        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage += ` - ${errorData.error || errorData.message || JSON.stringify(errorData)}`;
            } catch (e) { /* Ignore */ }
            throw new Error(errorMessage);
        }
        if (response.status === 204)
            return null;
        return response.json();
    } catch (networkError) {
        console.error("Network error or server unreachable:", networkError);
        throw new Error(`Network error: ${networkError.message}`);
    }
}

async function addWordHistory(wordId) {
    try {
        const historyData = {key_id: wordId};
        await fetchWithAuth(`${API_BASE_URL}/history/?type=1`, {
            method: 'POST',
            body: JSON.stringify(historyData)
        });
        console.log(`word history : ${wordId}`);
    } catch (error) {
        if (error.message && (error.message.includes("400") || error.message.includes("409")) &&
                error.message.toLowerCase().includes("history already exists")) {
            console.log(`Post history already exists for post_id ${wordId}.`);
        } else {
            console.error(`CLIENT: Error adding post history for post_id ${wordId}:`, error.message);
        }
    }
}
// Hàm tạo lịch sử mới
async function createHistory(history, type) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/history/?type=${type}`, {
            method: 'POST',
            body: JSON.stringify(history)
        });
        return response;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Hàm cập nhật lịch sử
async function updateHistory(id, history, type) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/history/${id}?type=${type}`, {
            method: 'PUT',
            body: JSON.stringify(history)
        });
        return response;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Hàm xóa lịch sử
async function deleteHistory(id, type) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/history/${id}?type=${type}`, {
            method: 'DELETE'
        });
        return response;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Thêm các hàm xử lý exam history
async function addExamResultHistory(examId, correctNumber, wrongNumber, totalQuestion) {
    try {
        const examHistoryData = {
            exam_id: examId,
            correct_number: correctNumber,
            wrong_number: wrongNumber,
            total_question: totalQuestion
        };
        await fetchWithAuth(`${API_BASE_URL}/exam-history/`, {
            method: 'POST',
            body: JSON.stringify(examHistoryData)
        });
        console.log(`Exam result history added for exam_id ${examId}`);
    } catch (error) {
        console.error(`CLIENT: Error adding exam result history for exam_id ${examId}:`, error.message);
    }
}

async function getExamHistory(examId) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/exam-history/${examId}`);
        return response;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function getAllExamHistories() {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/exam-history/`);
        return response;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Hàm lấy danh sách chủ đề chính
async function getMainTopics() {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/topic/`);
        return response || [];
    } catch (error) {
        console.error("Error fetching main topics:", error);
        throw error;
    }
}

// Hàm lấy danh sách chủ đề con
async function getSubTopicsForTopic(topicId) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/topic/${topicId}/subtopics`);
        return response || [];
    } catch (error) {
        console.error(`Error fetching subtopics for topic ${topicId}:`, error);
        throw error;
    }
}

// Hàm lấy danh sách bài học
async function getPostsForSubTopic(subTopicId) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/subtopic/${subTopicId}/posts`);
        return (response || []).filter(p => !p.is_deleted);
    } catch (error) {
        console.error(`Error fetching posts for subtopic ${subTopicId}:`, error);
        throw error;
    }
}

// Hàm lấy danh sách bài kiểm tra
async function getExamsForSubTopic(subTopicId) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/exam/subtopic/${subTopicId}`);
        return (response || []).filter(ex => !ex.is_deleted);
    } catch (error) {
        console.error(`Error fetching exams for subtopic ${subTopicId}:`, error);
        throw error;
    }
}
async function getWordDetails(wordId) {
    if (!wordId) return null;
    try {
        const details = await fetchWithAuth(`${API_BASE_URL}/word/${wordId}`);
        return details;
    } catch (error) {
        console.error(`Error fetching details for word ${wordId}:`, error);
        return null;
    }
}
// Hàm lấy chi tiết bài học
async function getPostDetails(postId) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/post/${postId}`);
        return response;
    } catch (error) {
        console.error(`Error fetching details for post ${postId}:`, error);
        throw error;
    }
}

async function getExamName(examId){
    try{
        const response = await fetchWithAuth(`${API_BASE_URL}/exam/${examId}`);
        return response;
    } catch (e){
        throw e;
    }
}
// Hàm lấy chi tiết bài kiểm tra
async function getExamDetails(examId) {
    try {
        const examBasicInfo = await fetchWithAuth(`${API_BASE_URL}/exam/${examId}`);
        if (!examBasicInfo) throw new Error("Thông tin bài kiểm tra không tìm thấy.");

        const questionsFromApi = await fetchWithAuth(`${API_BASE_URL}/questions/exam/${examId}`);
        
        const processedQuestions = [];
        if (questionsFromApi && questionsFromApi.length > 0) {
            for (const qDto of questionsFromApi) {
                if (qDto.is_deleted) continue;
                const answersFromApi = await fetchWithAuth(`${API_BASE_URL}/questions/${qDto.question_id}/answers`);
                let correctOptId = null;
                const options = (answersFromApi || [])
                    .filter(ans => !ans.is_deleted)
                    .map(ansDto => {
                        if (ansDto.correct === true) { 
                            correctOptId = ansDto.answer_id;
                        }
                        return { optionId: ansDto.answer_id, optionText: ansDto.content };
                    });
                processedQuestions.push({
                    questionId: qDto.question_id,
                    questionText: qDto.content,
                    options: options,
                    correctOptionId: correctOptId
                });
            }
        }
        return {
            id: examBasicInfo.exam_id,
            title: examBasicInfo.name,
            questions: processedQuestions,
            timeLimit: examBasicInfo.timeLimitSeconds || 0,
            type: 'quiz'
        };
    } catch (error) {
        console.error(`Error fetching full details for exam ${examId}:`, error);
        throw error;
    }
}

// Hàm lấy tên chủ đề con
async function getSubTopicName(subTopicId) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/subtopic/${subTopicId}`);
        return response?.name || "Danh sách";
    } catch (error) {
        console.error("Could not fetch subtopic name for title", error);
        return "Danh sách";
    }
}
async function getTotalHistory(type){
    try{
        const response = await fetchWithAuth(`${API_BASE_URL}/history/count?type=${type}`);
        return response?.total||0;
    } catch (error){
        console.error("could not fetch total history",error);
            return 0;
    }
    
}
async function getHistoryRecently(type){
    try{
        const response = await fetchWithAuth(`${API_BASE_URL}/history/recently?type=${type}`);
        return response;
    } catch (e){
        throw e;
    }
}
async function getExamRecently(){
    try{
        const response = await fetchWithAuth(`${API_BASE_URL}/exam-history/recently`);
        return response;
    } catch (e){
        throw e;
    }
}
// Thêm vào window để có thể sử dụng từ bất kỳ đâu
window.historyAPI = {
    getAllHistories,
    getHistoryById,
    createHistory,
    updateHistory,
    deleteHistory,
    addWordHistory,
    addExamResultHistory,
    getExamHistory,
    getAllExamHistories,
    getMainTopics,
    getSubTopicsForTopic,
    getPostsForSubTopic,
    getExamsForSubTopic,
    getPostDetails,
    getExamDetails,
    getSubTopicName,
    getHistoryRecently,
    getExamRecently,
    getWordDetails,
    getExamName,
    getTotalHistory
}; 