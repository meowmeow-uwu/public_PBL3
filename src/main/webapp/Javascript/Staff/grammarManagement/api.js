// js/Staff/grammarManagement/api.js

export async function fetchAPI(url, options = {}) {
    const currentToken = window.USER_API.getBearerToken();
    if (!currentToken) {
        throw new Error("Token không tồn tại. Vui lòng đăng nhập lại.");
    }
    const customHeaders = options.headers || {};
    const otherOptions = { ...options };
    delete otherOptions.headers;

    try {
        const response = await fetch(`${window.APP_CONFIG.API_BASE_URL}${url}`, {
            ...otherOptions,
            headers: {
                'Authorization': currentToken,
                'Content-Type': 'application/json',
                ...customHeaders,
            },
        });

        if (!response.ok) {
            let errorData = { error: `Lỗi HTTP! Trạng thái: ${response.status}` };
            try {
                const errorJson = await response.json();
                errorData = errorJson || errorData;
            } catch (e) {
                try {
                    const errorText = await response.text();
                    errorData = { error: errorText || errorData.error };
                } catch (textError) {
                    // ignore
                }
            }
            throw new Error(errorData.error || errorData.message || `Lỗi HTTP! Trạng thái: ${response.status}`);
        }

        if (response.status === 204) {
            return null;
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        } else {
            return await response.text();
        }
    } catch (error) {
        console.error("Lỗi trong fetchAPI:", error);
        throw error; // Ném lại lỗi để nơi gọi có thể xử lý
    }
}