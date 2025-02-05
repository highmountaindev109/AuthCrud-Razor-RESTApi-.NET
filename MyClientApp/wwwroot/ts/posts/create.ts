document.getElementById("createPostForm")?.addEventListener("submit", async (event: Event) => {
    event.preventDefault();

    const token: string | null = localStorage.getItem("AuthToken");
    if (!token) {
        const errorMessageElement = document.getElementById("error-message") as HTMLDivElement;
        if (errorMessageElement) {
            errorMessageElement.innerText = "Unauthorized: Token not found.";
            errorMessageElement.style.display = "block";
        }
        window.location.href = '/auth/login';
        return;
    }

    const titleElement = document.getElementById("Title") as HTMLInputElement;
    const contentElement = document.getElementById("Content") as HTMLTextAreaElement;

    const title: string = titleElement?.value || "";
    const content: string = contentElement?.value || "";

    try {
        const response: Response = await fetch("http://localhost:5290/api/posts", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title, content })
        });

        const successMessageElement = document.getElementById("success-message") as HTMLDivElement;
        const errorMessageElement = document.getElementById("error-message") as HTMLDivElement;

        if (response.ok) {
            if (successMessageElement) {
                successMessageElement.innerText = "Post created successfully!";
                successMessageElement.style.display = "block";
            }
            window.location.href = '/posts';
        } else {
            if (errorMessageElement) {
                errorMessageElement.innerText = "Failed to create post.";
                errorMessageElement.style.display = "block";
            }
        }
    } catch (error: unknown) {
        const errorMessageElement = document.getElementById("error-message") as HTMLDivElement;
        if (errorMessageElement) {
            errorMessageElement.innerText = `Error: ${(error as Error).message}`;
            errorMessageElement.style.display = "block";
        }
    }
});
