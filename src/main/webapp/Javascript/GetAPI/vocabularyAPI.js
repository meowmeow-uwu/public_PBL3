// API functions for vocabulary management
const BASE_URL = 'http://localhost:2005/PBL3/api';

// Function to get JWT token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Function to add new vocabulary (POST /word/{id})
async function addVocabulary(id, vocabularyData) {
    try {
        const response = await fetch(`${BASE_URL}/word/${id}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(vocabularyData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error adding vocabulary:', error);
        throw error;
    }
}

// Function to update vocabulary (PUT /word/{id})
async function updateVocabulary(id, vocabularyData) {
    try {
        const response = await fetch(`${BASE_URL}/word/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(vocabularyData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating vocabulary:', error);
        throw error;
    }
}

// Function to delete vocabulary
async function deleteVocabulary(id) {
    try {
        const response = await fetch(`${BASE_URL}/vocabulary/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error deleting vocabulary:', error);
        throw error;
    }
}

// Function to get all vocabulary
async function getAllVocabulary() {
    try {
        const response = await fetch(`${BASE_URL}/vocabulary`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error getting vocabulary:', error);
        throw error;
    }
} 