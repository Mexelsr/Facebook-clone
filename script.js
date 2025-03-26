<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyA4VE4mxYVBGQPKs-Y5g5_K6-UjTC2Hc_g",
    authDomain: "facebook-clone-ad7d8.firebaseapp.com",
    projectId: "facebook-clone-ad7d8",
    storageBucket: "facebook-clone-ad7d8.firebasestorage.app",
    messagingSenderId: "89704012515",
    appId: "1:89704012515:web:61a937fb6454d47eb3c3d6",
    measurementId: "G-XK8SS32QZF"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Please enter a username and password!");
        return;
    }

    localStorage.setItem("user", username);
    document.getElementById("login-page").style.display = "none";
    document.getElementById("main-page").style.display = "block";
    loadPosts();
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

    db.ref("posts").push(post); // Save post to Firebase
    document.getElementById("postContent").value = "";
}

function loadPosts() {
    const feed = document.getElementById("feed");
    feed.innerHTML = "";

    db.ref("posts").on("value", snapshot => {
        feed.innerHTML = "";
        snapshot.forEach(childSnapshot => {
            const post = childSnapshot.val();
            const postKey = childSnapshot.key;
            const currentUser = localStorage.getItem("user");
            const userReaction = post.reactions?.[currentUser] || "";

            const postElement = document.createElement("div");
            postElement.classList.add("post");
            postElement.innerHTML = `
                <strong>${post.user}</strong> <br> 
                ${post.content} <br> 
                <small>${post.time}</small><br>
                <div class="reaction-buttons">
                    ${createReactionButtons(postKey, userReaction)}
                </div>
                <div class="reaction-counts" id="reaction-counts-${postKey}">
                    ${generateReactionCounts(post.reactions)}
                </div>
            `;
            feed.appendChild(postElement);
        });
    });
}

function createReactionButtons(postKey, userReaction) {
    const reactions = ["👍", "♥️", "👎", "😂", "😭", "😱"];
    return reactions.map(reaction => `
        <button class="reaction-button ${userReaction === reaction ? 'active' : ''}" 
                onclick="reactToPost('${postKey}', '${reaction}')">
            ${reaction}
        </button>
    `).join("");
}

function reactToPost(postKey, reaction) {
    const currentUser = localStorage.getItem("user");
    if (!currentUser) return alert("Please log in to react!");

    db.ref(`posts/${postKey}/reactions/${currentUser}`).set(reaction);
}

function generateReactionCounts(reactions = {}) {
    const reactionCounts = {};
    Object.values(reactions).forEach(reaction => {
        reactionCounts[reaction] = (reactionCounts[reaction] || 0) + 1;
    });

    return Object.entries(reactionCounts).map(([reaction, count]) =>
        `<span>${reaction} ${count}</span>`).join(" ");
}

if (localStorage.getItem("user")) {
    document.getElementById("login-page").style.display = "none";
    document.getElementById("main-page").style.display = "block";
    loadPosts();
}
