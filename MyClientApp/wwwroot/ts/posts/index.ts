document.addEventListener("DOMContentLoaded", async () => {
    const token: string | null = localStorage.getItem("AuthToken");

    if (!token) {
        const errorMessage = document.getElementById("error-message") as HTMLElement;
        errorMessage.innerText = "Unauthorized: Token not found. Please log in.";
        errorMessage.style.display = "block";
        window.location.href = '/auth/login';
        return;
    }

    try {
        const response: Response = await fetch("http://localhost:5290/api/posts", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.status === 401) {
            const errorMessage = document.getElementById("error-message") as HTMLElement;
            errorMessage.innerText = "Unauthorized: Invalid or expired token.";
            errorMessage.style.display = "block";
            return;
        }

        if (!response.ok) {
            const errorMessage = document.getElementById("error-message") as HTMLElement;
            errorMessage.innerText = "Failed to fetch posts. Please try again.";
            errorMessage.style.display = "block";
            return;
        }

        const posts: Array<{ id: string; title: string; content: string; userId: string }> = await response.json();

        if (posts.length > 0) {
            const postsTable = document.getElementById("posts-table") as HTMLElement;
            const postsBody = document.getElementById("posts-body") as HTMLElement;

            posts.forEach((post) => {
                const row: HTMLTableRowElement = document.createElement("tr");
                row.innerHTML = `
                    <td>${post.title}</td>
                    <td>${post.content}</td>
                    <td>${post.userId}</td>
                    <td>
                        <a href="/posts/edit?id=${post.id}" class="btn btn-sm btn-warning">Edit</a>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${post.id}">Delete</button>
                    </td>
                `;
                postsBody.appendChild(row);
            });

            postsTable.style.display = "table";

            const deleteButtons = document.querySelectorAll<HTMLButtonElement>(".delete-btn");
            deleteButtons.forEach((button) => {
                button.addEventListener("click", async (event) => {
                    const target = event.target as HTMLButtonElement;
                    const postId: string | null = target.getAttribute("data-id");

                    if (!postId) {
                        alert("Post ID not found.");
                        return;
                    }

                    if (!confirm("Are you sure you want to delete this post?")) return;

                    try {
                        const deleteResponse: Response = await fetch(`http://localhost:5290/api/posts/${postId}`, {
                            method: "DELETE",
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        });

                        if (deleteResponse.ok) {
                            alert("Post deleted successfully!");
                            const row = target.closest("tr");
                            if (row) row.remove();
                        } else if (deleteResponse.status === 401) {
                            alert("Unauthorized: Invalid or expired token.");
                        } else {
                            alert("Failed to delete the post. Please try again.");
                        }
                    } catch (error: any) {
                        alert(`Error: ${error.message}`);
                    }
                });
            });
        } else {
            const errorMessage = document.getElementById("error-message") as HTMLElement;
            errorMessage.innerText = "No posts found.";
            errorMessage.style.display = "block";
        }
    } catch (error: any) {
        const errorMessage = document.getElementById("error-message") as HTMLElement;
        errorMessage.innerText = `Error: ${error.message}`;
        errorMessage.style.display = "block";
    }

    // Add SignOut functionality
    const signOutButton = document.getElementById("sign-out-btn") as HTMLButtonElement;
    if (signOutButton) {
        signOutButton.addEventListener("click", () => {
            localStorage.removeItem("AuthToken");
            window.location.href = '/auth/login';
        });
    }
});
