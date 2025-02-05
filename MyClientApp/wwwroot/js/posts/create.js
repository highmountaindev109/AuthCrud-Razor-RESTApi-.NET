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
(_a = document.getElementById("createPostForm")) === null || _a === void 0 ? void 0 : _a.addEventListener("submit", (event) => __awaiter(void 0, void 0, void 0, function* () {
    event.preventDefault();
    const token = localStorage.getItem("AuthToken");
    if (!token) {
        const errorMessageElement = document.getElementById("error-message");
        if (errorMessageElement) {
            errorMessageElement.innerText = "Unauthorized: Token not found.";
            errorMessageElement.style.display = "block";
        }
        window.location.href = '/auth/login';
        return;
    }
    const titleElement = document.getElementById("Title");
    const contentElement = document.getElementById("Content");
    const title = (titleElement === null || titleElement === void 0 ? void 0 : titleElement.value) || "";
    const content = (contentElement === null || contentElement === void 0 ? void 0 : contentElement.value) || "";
    try {
        const response = yield fetch("http://localhost:5290/api/posts", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title, content })
        });
        const successMessageElement = document.getElementById("success-message");
        const errorMessageElement = document.getElementById("error-message");
        if (response.ok) {
            if (successMessageElement) {
                successMessageElement.innerText = "Post created successfully!";
                successMessageElement.style.display = "block";
            }
            window.location.href = '/posts';
        }
        else {
            if (errorMessageElement) {
                errorMessageElement.innerText = "Failed to create post.";
                errorMessageElement.style.display = "block";
            }
        }
    }
    catch (error) {
        const errorMessageElement = document.getElementById("error-message");
        if (errorMessageElement) {
            errorMessageElement.innerText = `Error: ${error.message}`;
            errorMessageElement.style.display = "block";
        }
    }
}));
