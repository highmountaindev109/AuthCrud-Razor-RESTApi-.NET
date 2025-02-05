"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
document.addEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () {
    const token = localStorage.getItem("AuthToken");
    if (!token) {
        const errorMessage = document.getElementById("error-message");
        errorMessage.innerText = "Unauthorized: Token not found. Please log in.";
        errorMessage.style.display = "block";
        window.location.href = '/auth/login';
        return;
    }
    try {
        const response = yield fetch("http://localhost:5290/api/posts", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (response.status === 401) {
            const errorMessage = document.getElementById("error-message");
            errorMessage.innerText = "Unauthorized: Invalid or expired token.";
            errorMessage.style.display = "block";
            return;
        }
        if (!response.ok) {
            const errorMessage = document.getElementById("error-message");
            errorMessage.innerText = "Failed to fetch posts. Please try again.";
            errorMessage.style.display = "block";
            return;
        }
        const posts = yield response.json();
        if (posts.length > 0) {
            const postsTable = document.getElementById("posts-table");
            const postsBody = document.getElementById("posts-body");
            posts.forEach((post) => {
                const row = document.createElement("tr");
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
            const deleteButtons = document.querySelectorAll(".delete-btn");
            deleteButtons.forEach((button) => {
                button.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
                    const target = event.target;
                    const postId = target.getAttribute("data-id");
                    if (!postId) {
                        alert("Post ID not found.");
                        return;
                    }
                    if (!confirm("Are you sure you want to delete this post?"))
                        return;
                    try {
                        const deleteResponse = yield fetch(`http://localhost:5290/api/posts/${postId}`, {
                            method: "DELETE",
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        });
                        if (deleteResponse.ok) {
                            alert("Post deleted successfully!");
                            const row = target.closest("tr");
                            if (row)
                                row.remove();
                        }
                        else if (deleteResponse.status === 401) {
                            alert("Unauthorized: Invalid or expired token.");
                        }
                        else {
                            alert("Failed to delete the post. Please try again.");
                        }
                    }
                    catch (error) {
                        alert(`Error: ${error.message}`);
                    }
                }));
            });
        }
        else {
            const errorMessage = document.getElementById("error-message");
            errorMessage.innerText = "No posts found.";
            errorMessage.style.display = "block";
        }
    }
    catch (error) {
        const errorMessage = document.getElementById("error-message");
        errorMessage.innerText = `Error: ${error.message}`;
        errorMessage.style.display = "block";
    }
    // Add SignOut functionality
    const signOutButton = document.getElementById("sign-out-btn");
    if (signOutButton) {
        signOutButton.addEventListener("click", () => {
            localStorage.removeItem("AuthToken");
            window.location.href = '/auth/login';
        });
    }
}));
