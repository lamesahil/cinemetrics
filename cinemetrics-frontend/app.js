// Base URL of your Backend Engine
const API_URL = 'https://cnemetrics.onrender.com/api/movies';

// 🧠 THE BRAIN: Ab token hardcode nahi hoga, seedha LocalStorage se uthega!
const MY_TOKEN = localStorage.getItem('token');

// SECURITY CHECK: Agar localStorage mein token nahi hai, matlab user logged in nahi hai. Bouncer usko bahar pheko!
if (!MY_TOKEN) {
    window.location.href = 'auth.html'; // Usse wapas login page pe bhej do
}

// Optional UI Update: Header mein naam update karna
const userName = localStorage.getItem('userName');
const userGreeting = document.getElementById('user-greeting');
if (userName && userGreeting) {
    userGreeting.innerText = `${userName}'s Watchlist`;
} else if (userGreeting) {
    // Failsafe: Agar galti se naam save nahi hua
    userGreeting.innerText = "My Watchlist";
}

// DOM Elements
const addForm = document.getElementById('add-movie-form');

// Function: Add Movie to Database
async function addMovie(e) {
    e.preventDefault(); 

    const title = document.getElementById('title').value;
    const genreInput = document.getElementById('genre').value;
    const genre = genreInput.split(',').map(g => g.trim()); 
    const rating = document.getElementById('rating').value;
    const releaseYear = document.getElementById('year').value;
    const isWatched = document.getElementById('isWatched').checked;

    const movieData = {
        title,
        genre,
        rating: rating ? Number(rating) : null,
        releaseYear: releaseYear ? Number(releaseYear) : null,
        isWatched
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MY_TOKEN}`
            },
            body: JSON.stringify(movieData)
        });

        const data = await response.json();

        if (data.success) {
            addForm.reset(); 
            // Refresh data immediately
            fetchAnalytics();
            fetchMovies();
        } else {
            alert('❌ Error: ' + data.message);
        }
    } catch (error) {
        console.error("Backend unreachable!", error);
    }
}

// Event Listener for form
addForm.addEventListener('submit', addMovie);

// Function: Fetch and Display Analytics
async function fetchAnalytics() {
    try {
        const response = await fetch(API_URL + '/analytics', {
            headers: {
                'Authorization': `Bearer ${MY_TOKEN}`
            }
        });
        const data = await response.json();

        if (data.success) {
            document.getElementById('total-watched').innerText = data.analytics.totalWatched;
            document.getElementById('avg-rating').innerText = data.analytics.averageRating || '--';
            document.getElementById('top-genre').innerText = data.analytics.topGenre || '--';
        }
    } catch (error) {
        console.error("Analytics fetch fail:", error);
    }
}

// Function: Fetch and Display All Movies
async function fetchMovies() {
    try {
        const response = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${MY_TOKEN}`
            }
        });
        const data = await response.json();

        if (data.success) {
            const movieListDiv = document.getElementById('movie-list');
            movieListDiv.innerHTML = ''; // Clear loading text

            data.data.forEach(movie => {
                const isWatched = movie.isWatched;
                
                // If watched, show Green. If pending, show grey but hover Orange.
                const statusColor = isWatched ? 'text-lbxGreen' : 'text-lbxText hover:text-lbxOrange cursor-pointer';
                const statusText = isWatched ? 'Watched' : 'Pending (Click to Watch)';
                const ratingDisplay = movie.rating ? `<span class="text-lbxOrange font-bold ml-2">★ ${movie.rating}</span>` : '';
                
                const movieCard = document.createElement('div');
                movieCard.className = 'py-3 border-b border-lbxBorder flex justify-between items-start hover:bg-[#1a2127] transition-colors px-2 -mx-2 rounded';
                
                movieCard.innerHTML = `
                    <div>
                        <h3 class="font-bold text-white text-base">${movie.title} <span class="text-xs text-lbxText font-normal ml-1">${movie.releaseYear || ''}</span></h3>
                        <p class="text-xs text-lbxText mt-1 uppercase tracking-wider">${movie.genre.join(', ')}</p>
                    </div>
                    <div class="text-right flex flex-col items-end">
                        <div class="flex items-center text-sm">
                            <span onclick="toggleWatchStatus('${movie._id}', ${isWatched})" class="${statusColor} uppercase tracking-wider text-[10px] font-bold transition-colors">${statusText}</span>
                            ${ratingDisplay}
                        </div>
                    </div>
                `;
                movieListDiv.appendChild(movieCard);
            });
        }
    } catch (error) {
        console.error("Movies fetch fail:", error);
    }
}

// 🚀 NEW FEATURE: Toggle Watch Status
window.toggleWatchStatus = async function(id, currentStatus) {
    if (currentStatus) return; // Agar pehle se watched hai, toh kuch mat karo

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MY_TOKEN}`
            },
            body: JSON.stringify({ isWatched: true }) // Backend ko bolo status true kar de
        });
        const data = await response.json();
        
        if (data.success) {
            // Update hone ke baad list aur numbers wapas refresh kar do
            fetchAnalytics();
            fetchMovies();
        }
    } catch (error) {
        console.error("Toggle fail:", error);
    }
}

// Initial Data Load
fetchAnalytics();
fetchMovies();

// 🚪 THE ESCAPE HATCH: Logout Logic
const logoutBtn = document.getElementById('logout-btn');

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        // 1. Browser ki memory (localStorage) se VIP Pass aur Naam uda do
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        
        // 2. Wapas darwaze pe (Login page) phenk do
        window.location.href = 'auth.html';
    });
}