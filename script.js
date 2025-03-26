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

    db.ref("posts").push(post); // Store post in Firebase
    document.getElementById("postContent").value = "";
}

function loadPosts() {
    const feed = document.getElementById("feed");
    feed.innerHTML = "";

    db.ref("posts").on("value", (snapshot) => {
        feed.innerHTML = ""; // Clear before loading new data

        snapshot.forEach((childSnapshot) => {
            const post = childSnapshot.val();
            const postId = childSnapshot.key;
            const currentUser = localStorage.getItem("user");
            const userReaction = post.reactions?.[currentUser] || "";

            const postElement = document.createElement("div");
            postElement.classList.add("post");
            postElement.innerHTML = `
                <strong>${post.user}</strong> <br>
                ${post.content} <br>
                <small>${post.time}</small><br>
                <div class="reaction-buttons">
                    ${createReactionButtons(postId, userReaction)}
                </div>
                <div class="reaction-counts" id="reaction-counts-${postId}">
                    ${generateReactionCounts(post.reactions)}
                </div>
            `;
            feed.appendChild(postElement);
        });
    });
}

function createReactionButtons(postId, userReaction) {
    const reactions = ["👍", "♥️", "👎", "😂", "😭", "😱"];
    return reactions
        .map(
            (reaction) => `
        <button class="reaction-button ${userReaction === reaction ? "active" : ""}" 
                onclick="reactToPost('${postId}', '${reaction}')">
            ${reaction}
        </button>
    `
        )
        .join("");
}

function reactToPost(postId, reaction) {
    const currentUser = localStorage.getItem("user");

    if (!currentUser) {
        alert("Please log in to react!");
        return;
    }

    db.ref(`posts/${postId}/reactions/${currentUser}`).set(reaction);
}

function generateReactionCounts(reactions = {}) {
    const reactionCounts = {};
    Object.values(reactions).forEach((reaction) => {
        reactionCounts[reaction] = (reactionCounts[reaction] || 0) + 1;
    });

    return Object.entries(reactionCounts)
        .map(([reaction, count]) => `<span>${reaction} ${count}</span>`)
        .join(" ");
}

// Auto-login if user exists
if (localStorage.getItem("user")) {
    document.getElementById("login-page").style.display = "none";
    document.getElementById("main-page").style.display = "block";
    loadPosts();
                }
        
