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
var _a;
document.addEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () {
    const token = localStorage.getItem("AuthToken");
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");
    if (!token || !postId) {
        const errorMessage = document.getElementById("error-message");
        errorMessage.innerText = "Unauthorized or Post ID missing.";
        errorMessage.style.display = "block";
        window.location.href = '/auth/login';
        return;
    }
    try {
        const response = yield fetch(`http://localhost:5290/api/posts/${postId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (response.ok) {
            const post = yield response.json();
            document.getElementById("Title").value = post.title;
            document.getElementById("Content").value = post.content;
        }
        else {
            const errorMessage = document.getElementById("error-message");
            errorMessage.innerText = "Failed to fetch post details.";
            errorMessage.style.display = "block";
        }
    }
    catch (error) {
        const errorMessage = document.getElementById("error-message");
        errorMessage.innerText = `Error: ${error.message}`;
        errorMessage.style.display = "block";
    }
}));
(_a = document.getElementById("editPostForm")) === null || _a === void 0 ? void 0 : _a.addEventListener("submit", (event) => __awaiter(void 0, void 0, void 0, function* () {
    event.preventDefault();
    const form = document.getElementById("editPostForm");
    const titleInput = document.getElementById("Title");
    const contentInput = document.getElementById("Content");
    const titleError = document.getElementById("titleError");
    const contentError = document.getElementById("contentError");
    let isValid = true;
    const titleValue = titleInput.value.trim();
    if (titleValue.length < 5 || titleValue.length > 100) {
        titleError.style.display = "block";
        isValid = false;
    }
    else {
        titleError.style.display = "none";
    }
    const contentValue = contentInput.value.trim();
    if (contentValue.length < 20) {
        contentError.style.display = "block";
        isValid = false;
    }
    else {
        contentError.style.display = "none";
    }
    if (!isValid) {
        event.preventDefault();
        return;
    }
    const token = localStorage.getItem("AuthToken");
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");
    if (!token || !postId) {
        const errorMessage = document.getElementById("error-message");
        errorMessage.innerText = "Unauthorized or Post ID missing.";
        errorMessage.style.display = "block";
        return;
    }
    const title = titleInput.value;
    const content = contentInput.value;
    try {
        const response = yield fetch(`http://localhost:5290/api/posts/${postId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title, content })
        });
        if (response.ok) {
            const successMessage = document.getElementById("success-message");
            successMessage.innerText = "Post updated successfully!";
            successMessage.style.display = "block";
            window.location.href = '/posts';
        }
        else {
            const errorMessage = document.getElementById("error-message");
            errorMessage.innerText = "Failed to update post.";
            errorMessage.style.display = "block";
        }
    }
    catch (error) {
        const errorMessage = document.getElementById("error-message");
        errorMessage.innerText = `Error: ${error.message}`;
        errorMessage.style.display = "block";
    }
}));
