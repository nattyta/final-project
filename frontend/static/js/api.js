const API_BASE = window.location.origin;

export const apiService = {
    async getBooks() {
        try {
            const response = await fetch(`${API_BASE}/api/books/`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch books:', error);
            throw error;
        }
    },

    async borrowBook(bookId) {
        try {
            const response = await fetch(`${API_BASE}/api/books/${bookId}/borrow/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                credentials: 'include'
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Borrow failed:', error);
            throw error;
        }
    },

    // Add other API methods similarly
};

function handleResponse(response) {
    if (!response.ok) {
        return response.json().then(err => { throw err; });
    }
    return response.json();
}

function getCookie(name) {
    // Django CSRF token handling
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}