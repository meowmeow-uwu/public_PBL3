// js/Staff/grammarManagement/state.js
export const state = {
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    currentKeyword: "",
    currentView: 'topics',
    currentContentListType: 'posts',
    currentTopicId: null,
    currentTopicName: '',
    currentSubTopicId: null,
    currentSubTopicName: '',
    currentPostId: null,
    currentPostName: '',
    currentExamId: null,
    currentExamName: '',
    currentQuestionId: null,
    currentQuestionContent: '',
    currentExamIdForQuestionsManagement: null,
    currentEditingId: null,
    currentEntityType: '',
    currentParentId: null,
    currentDataCache: [],
};

export function updateState(newState) {
    Object.assign(state, newState);
}