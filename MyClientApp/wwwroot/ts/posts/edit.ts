document.addEventListener("DOMContentLoaded", async () => {
    const token: string | null = localStorage.getItem("AuthToken");
    const urlParams = new URLSearchParams(window.location.search);
    const postId: string | null = urlParams.get("id");

    if (!token || !postId) {
        const errorMessage = document.getElementById("error-message") as HTMLElement;
        errorMessage.innerText = "Unauthorized or Post ID missing.";
        errorMessage.style.display = "block";
        window.location.href = '/auth/login';
        return;
    }

    try {
        const response = await fetch(`http://localhost:5290/api/posts/${postId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            const post = await response.json();
            (document.getElementById("Title") as HTMLInputElement).value = post.title;
            (document.getElementById("Content") as HTMLTextAreaElement).value = post.content;
        } else {
            const errorMessage = document.getElementById("error-message") as HTMLElement;
            errorMessage.innerText = "Failed to fetch post details.";
            errorMessage.style.display = "block";
        }
    } catch (error: any) {
        const errorMessage = document.getElementById("error-message") as HTMLElement;
        errorMessage.innerText = `Error: ${error.message}`;
        errorMessage.style.display = "block";
    }
});

document.getElementById("editPostForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = document.getElementById("editPostForm") as HTMLFormElement;
    const titleInput = document.getElementById("Title") as HTMLInputElement;
    const contentInput = document.getElementById("Content") as HTMLTextAreaElement;
    const titleError = document.getElementById("titleError") as HTMLElement;
    const contentError = document.getElementById("contentError") as HTMLElement;
    let isValid = true;

    const titleValue = titleInput.value.trim();
    if (titleValue.length < 5 || titleValue.length > 100) {
        titleError.style.display = "block";
        isValid = false;
    } else {
        titleError.style.display = "none";
    }

    const contentValue = contentInput.value.trim();
    if (contentValue.length < 20) {
        contentError.style.display = "block";
        isValid = false;
    } else {
        contentError.style.display = "none";
    }

    if (!isValid) {
        event.preventDefault();
        return;
    }

    const token: string | null = localStorage.getItem("AuthToken");
    const urlParams = new URLSearchParams(window.location.search);
    const postId: string | null = urlParams.get("id");

    if (!token || !postId) {
        const errorMessage = document.getElementById("error-message") as HTMLElement;
        errorMessage.innerText = "Unauthorized or Post ID missing.";
        errorMessage.style.display = "block";
        return;
    }

    const title = titleInput.value;
    const content = contentInput.value;

    try {
        const response = await fetch(`http://localhost:5290/api/posts/${postId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title, content })
        });

        if (response.ok) {
            const successMessage = document.getElementById("success-message") as HTMLElement;
            successMessage.innerText = "Post updated successfully!";
            successMessage.style.display = "block";
            window.location.href = '/posts';
        } else {
            const errorMessage = document.getElementById("error-message") as HTMLElement;
            errorMessage.innerText = "Failed to update post.";
            errorMessage.style.display = "block";
        }
    } catch (error: any) {
        const errorMessage = document.getElementById("error-message") as HTMLElement;
        errorMessage.innerText = `Error: ${error.message}`;
        errorMessage.style.display = "block";
    }
});
