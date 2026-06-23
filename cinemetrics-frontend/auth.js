const API_URL = 'https://cnemetrics.onrender.com/api/movies';

// DOM Elements
const authForm = document.getElementById('auth-form');
const nameGroup = document.getElementById('name-group');
const nameInput = document.getElementById('name');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const toggleText = document.getElementById('toggle-text');
const toggleBtn = document.getElementById('toggle-btn');

// State: Login ya Signup?
let isLogin = true; 

// Toggle between Login and Signup
toggleBtn.addEventListener('click', () => {
    isLogin = !isLogin; // Switch state
    
    if (isLogin) {
        formTitle.innerText = "Sign In";
        submitBtn.innerText = "Sign In";
        toggleText.innerText = "Don't have an account?";
        toggleBtn.innerText = "Sign Up";
        nameGroup.classList.add('hidden');
        nameInput.removeAttribute('required');
    } else {
        formTitle.innerText = "Create Account";
        submitBtn.innerText = "Sign Up";
        toggleText.innerText = "Already have an account?";
        toggleBtn.innerText = "Sign In";
        nameGroup.classList.remove('hidden');
        nameInput.setAttribute('required', 'true');
    }
});

// Handle Form Submission
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Decide endpoint based on state
    const endpoint = isLogin ? '/login' : '/register';
    
    // Prepare Data
    const payload = { email, password };
    if (!isLogin) payload.name = nameInput.value;

    try {
        const response = await fetch(API_URL + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            // THE MAGIC: Token ko browser ki memory (localStorage) mein save karo
            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.name); // Name bhi save kar lete hain UI ke liye
            
            // Redirect to Dashboard
            window.location.href = 'index.html';
        } else {
            alert('❌ Auth Failed: ' + data.message);
        }
    } catch (error) {
        console.error("Auth error:", error);
        alert('Server is down or unreachable!');
    }
});