// script.js
document.addEventListener('DOMContentLoaded', () => {
    const navigationButtons = `
        <div class="navigation-buttons">
            <button id="prevEpisode" onclick="loadPreviousEpisode()"><span>&#171;</span> Prev</button>
            <button id="nextEpisode" onclick="loadNextEpisode()">Next <span>&#187;</span></button>
        </div>
    `;

    // Insert the buttons after the video container
    const videoContainer = document.querySelector('#episodeTitle');
    if (videoContainer) {
        videoContainer.insertAdjacentHTML('afterend', navigationButtons);
    }
});

function showBuffering() {
    const videoContainer = document.querySelector('.video-container');
    const existingLoader = videoContainer.querySelector('.lds-ellipsis');

    if (existingLoader) {
        existingLoader.style.display = 'inline-block';
        return;
    }

    const loader = document.createElement('div');
    loader.className = 'lds-ellipsis';
    loader.innerHTML = `
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    `;
    videoContainer.appendChild(loader);
}

function hideBuffering() {
    const loader = document.querySelector('.video-container .lds-ellipsis');
    if (loader) {
        loader.style.display = 'none';
    }
}

function switchServer() {
    const iframe = document.getElementById('videoFrame');
    const serverSelector = document.getElementById('serverSelector');
    showBuffering(); // Show buffering when switching servers
    iframe.src = serverSelector.value;
}

document.getElementById('videoFrame').addEventListener('load', () => {
    hideBuffering(); // Hide buffering when the video loads
});

function loadEpisode(epNumber) {
    const serverSelector = document.getElementById('serverSelector');
    const iframe = document.getElementById('videoFrame');
    const episodeTitle = document.getElementById('episodeTitle');

    if (episodes[epNumber]) {
        serverSelector.innerHTML = episodes[epNumber].map((server, index) =>
            `<option value="${server}">Server ${index + 1}</option>`
        ).join('');

        serverSelector.selectedIndex = 0;
        iframe.src = episodes[epNumber][0];
        episodeTitle.innerHTML = `You are watching: <b style="color: #3e83dd;">${episodeTitles[epNumber]}</b>.
        <br>If the current server doesn't work, please try other servers beside.`;

        showBuffering();

        // Change localStorage to sessionStorage
        sessionStorage.setItem('lastPlayedEpisode', epNumber);
        highlightCurrentEpisode(epNumber);
    } else {
        alert('Episode not available!');
    }
}

function loadNextEpisode() {
    const currentEpisode = sessionStorage.getItem('lastPlayedEpisode');
    const episodeNumbers = Object.keys(episodes).sort((a, b) => parseInt(a) - parseInt(b));
    const currentIndex = episodeNumbers.indexOf(currentEpisode);

    if (currentIndex < episodeNumbers.length - 1) {
        const nextEpisode = episodeNumbers[currentIndex + 1];
        loadEpisode(nextEpisode);
    } else {
        alert('No more episodes available!');
    }
}

function loadPreviousEpisode() {
    const currentEpisode = sessionStorage.getItem('lastPlayedEpisode');
    const episodeNumbers = Object.keys(episodes).sort((a, b) => parseInt(a) - parseInt(b));
    const currentIndex = episodeNumbers.indexOf(currentEpisode);

    if (currentIndex > 0) {
        const previousEpisode = episodeNumbers[currentIndex - 1];
        loadEpisode(previousEpisode);
    } else {
        alert('This is the first episode!');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const lastPlayedEpisode = sessionStorage.getItem('lastPlayedEpisode');

    // Check if the last played episode exists in the current dataset
    if (lastPlayedEpisode && episodes[lastPlayedEpisode]) {
        loadEpisode(lastPlayedEpisode);
    } else {
        // Load the first available episode if the last played episode is not found
        const firstEpisode = Object.keys(episodes).sort((a, b) => parseInt(a) - parseInt(b))[0];
        loadEpisode(firstEpisode);
    }
});

document.getElementById('videoFrame').addEventListener('load', hideBuffering);

// button-colour.js
function highlightCurrentEpisode(epNumber) {
    const buttons = document.querySelectorAll('.episode-buttons button');
    buttons.forEach(button => {
        button.classList.remove('active');
    });

    const currentButton = document.getElementById(`episode-${epNumber}`);
    if (currentButton) {
        currentButton.classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const lastPlayedEpisode = sessionStorage.getItem('lastPlayedEpisode');
    
    if (lastPlayedEpisode) {
        highlightCurrentEpisode(lastPlayedEpisode);
    } else {
        const firstEpisode = Object.keys(episodes).sort((a, b) => parseInt(a) - parseInt(b))[0];
        highlightCurrentEpisode(firstEpisode);
    }
});

const originalLoadEpisode = loadEpisode;
loadEpisode = function(epNumber) {
    originalLoadEpisode(epNumber);
    highlightCurrentEpisode(epNumber);
};
