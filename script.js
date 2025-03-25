function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Please enter a username and password!");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || {};

    if (users[username]) {
        if (users[username] === password) {
            localStorage.setItem("user", username);
            document.getElementById("login-page").style.display = "none";
            document.getElementById("main-page").style.display = "block";
            loadPosts();
        } else {
            alert("Incorrect password!");
        }
    } else {
        users[username] = password;
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("user", username);
        document.getElementById("login-page").style.display = "none";
        document.getElementById("main-page").style.display = "block";
        loadPosts();
    }
}

function logout() {
    localStorage.removeItem("user");
    document.getElementById("main-page").style.display = "none";
    document.getElementById("login-page").style.display = "block";
}

function createPost() {
    const content = document.getElementById("postContent").value.trim();
    if (!content) {
        alert("Post cannot be empty!");
        return;
    }

    const post = {
        user: localStorage.getItem("user"),
        content: content,
        time: new Date().toLocaleString(),
        reactions: {}
    };

    let posts = JSON.parse(localStorage.getItem("posts")) || [];
    posts.unshift(post);
    localStorage.setItem("posts", JSON.stringify(posts));

    document.getElementById("postContent").value = "";
    loadPosts();
}

function loadPosts() {
    const feed = document.getElementById("feed");
    feed.innerHTML = "";

    let posts = JSON.parse(localStorage.getItem("posts")) || [];
    posts.forEach((post, index) => {
        const currentUser = localStorage.getItem("user");
        const userReaction = post.reactions[currentUser] || "";

        const postElement = document.createElement("div");
        postElement.classList.add("post");
        postElement.innerHTML = `
            <strong>${post.user}</strong> <br> 
            ${post.content} <br> 
            <small>${post.time}</small><br>
            <div class="reaction-buttons">
                ${createReactionButtons(index, userReaction)}
            </div>
            <div class="reaction-counts" id="reaction-counts-${index}">
                ${generateReactionCounts(post.reactions)}
            </div>
            <button onclick="deletePost(${index})">🗑️ Delete</button>
        `;
        feed.appendChild(postElement);
    });
}

function createReactionButtons(postIndex, userReaction) {
    const reactions = ["👍", "♥️", "👎", "😂", "😭", "😱"];
    return reactions.map(reaction => `
        <button class="reaction-button ${userReaction === reaction ? 'active' : ''}" 
                onclick="reactToPost(${postIndex}, '${reaction}')">
            ${reaction}
        </button>
    `).join("");
}

function reactToPost(postIndex, reaction) {
    let posts = JSON.parse(localStorage.getItem("posts")) || [];
    const currentUser = localStorage.getItem("user");

    if (!currentUser) return alert("Please log in to react!");

    posts[postIndex].reactions[currentUser] = reaction;
    localStorage.setItem("posts", JSON.stringify(posts));

    loadPosts();
}

function generateReactionCounts(reactions) {
    const reactionCounts = {};
    Object.values(reactions).forEach(reaction => {
        reactionCounts[reaction] = (reactionCounts[reaction] || 0) + 1;
    });

    return Object.entries(reactionCounts).map(([reaction, count]) =>
        `<span>${reaction} ${count}</span>`).join(" ");
}

function deletePost(index) {
    let posts = JSON.parse(localStorage.getItem("posts")) || [];
    posts.splice(index, 1);
    localStorage.setItem("posts", JSON.stringify(posts));
    loadPosts();
}

if (localStorage.getItem("user")) {
    document.getElementById("login-page").style.display = "none";
    document.getElementById("main-page").style.display = "block";
    loadPosts();
}
