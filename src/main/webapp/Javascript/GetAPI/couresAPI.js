const API_COURSE_URL = 'http://localhost:2005/PBL3/api/courses/';

// Lấy danh sách khóa học
async function getCourses() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Không tìm thấy token');
    }

    try {
        const response = await fetch(API_COURSE_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Không thể lấy danh sách khóa học');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách khóa học:', error);
        throw error;
    }
}

// Lấy thông tin chi tiết khóa học
async function getCourseById(courseId) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Không tìm thấy token');
    }

    try {
        const response = await fetch(`${API_COURSE_URL}${courseId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Không thể lấy thông tin khóa học');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi lấy thông tin khóa học:', error);
        throw error;
    }
}

// Tạo khóa học mới
async function createCourse(courseData) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Không tìm thấy token');
    }

    try {
        const response = await fetch(API_COURSE_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(courseData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Không thể tạo khóa học mới');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi tạo khóa học mới:', error);
        throw error;
    }
}

// Cập nhật khóa học
async function updateCourse(courseId, courseData) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Không tìm thấy token');
    }

    try {
        const response = await fetch(`${API_COURSE_URL}${courseId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(courseData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Không thể cập nhật khóa học');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi cập nhật khóa học:', error);
        throw error;
    }
}

// Xóa khóa học
async function deleteCourse(courseId) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Không tìm thấy token');
    }

    try {
        const response = await fetch(`${API_COURSE_URL}${courseId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Không thể xóa khóa học');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi xóa khóa học:', error);
        throw error;
    }
}

// Lấy danh sách bài học trong khóa học
async function getLessonsByCourseId(courseId) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Không tìm thấy token');
    }

    try {
        const response = await fetch(`${API_COURSE_URL}${courseId}/lessons`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Không thể lấy danh sách bài học');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bài học:', error);
        throw error;
    }
}

// Thêm bài học vào khóa học
async function addLessonToCourse(courseId, lessonData) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Không tìm thấy token');
    }

    try {
        const response = await fetch(`${API_COURSE_URL}${courseId}/lessons`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(lessonData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Không thể thêm bài học');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi thêm bài học:', error);
        throw error;
    }
}

// Cập nhật bài học
async function updateLesson(courseId, lessonId, lessonData) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Không tìm thấy token');
    }

    try {
        const response = await fetch(`${API_COURSE_URL}${courseId}/lessons/${lessonId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(lessonData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Không thể cập nhật bài học');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi cập nhật bài học:', error);
        throw error;
    }
}

// Xóa bài học
async function deleteLesson(courseId, lessonId) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Không tìm thấy token');
    }

    try {
        const response = await fetch(`${API_COURSE_URL}${courseId}/lessons/${lessonId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Không thể xóa bài học');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi xóa bài học:', error);
        throw error;
    }
}
