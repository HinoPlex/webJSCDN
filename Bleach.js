document.addEventListener('DOMContentLoaded', () => {
    const navigationButtons = `
        <div class="navigation-buttons">
            <button id="prevEpisode" onclick="loadPreviousEpisode()"><span>&#171;</span> Prev</button>
            <button id="nextEpisode" onclick="loadNextEpisode()">Next <span>&#187;</span></button>
        </div>
    `;

    const videoContainer = document.querySelector('#episodeTitle');
    if (videoContainer) {
        videoContainer.insertAdjacentHTML('afterend', navigationButtons);
    }

    const episodeButtonsContainer = document.querySelector('.episode-buttons');
    if (episodeButtonsContainer && typeof episodes !== 'undefined') {
        Object.keys(episodes).sort((a, b) => parseInt(a) - parseInt(b)).forEach(epNumber => {
            const button = document.createElement('button');
            button.id = `episode-${epNumber}`;
            button.innerText = episodeTitles[epNumber] || `Episode ${epNumber}`;
            button.onclick = () => loadEpisode(epNumber);
            episodeButtonsContainer.appendChild(button);
        });
    }

    // ✅ MOVIE MODE
    if (typeof movies !== 'undefined') {
        const serverSelector = document.getElementById('serverSelector');
        const videoFrame = document.getElementById('videoFrame');

        movies.forEach(movie => {
            const option = document.createElement('option');
            option.value = movie.url;
            option.textContent = movie.name;
            serverSelector.appendChild(option);
        });

        const urlParams = new URLSearchParams(window.location.search);
        const serverParam = parseInt(urlParams.get('server'));
        const movieIndex = !isNaN(serverParam) && serverParam > 0 ? serverParam - 1 : 0;

        const selectedOption = serverSelector.options[movieIndex];
        serverSelector.selectedIndex = movieIndex;

        const movieTitle = document.getElementById('movieTitle');
        movieTitle.innerHTML = `Current Server: <b style="color: #3e83dd;">${selectedOption.text}</b>.<br>If the current server doesn't work, please try other servers beside.`;

        // Load iframe only after full page load
        window.onload = () => {
            showCustomLoader();
            videoFrame.onload = () => hideCustomLoader();
            videoFrame.src = selectedOption.value;
        };

        const newURL = `${window.location.pathname}?server=${movieIndex + 1}`;
        window.history.pushState({ path: newURL }, '', newURL);

        serverSelector.addEventListener('change', function () {
            const selectedOption = serverSelector.options[serverSelector.selectedIndex];
            movieTitle.innerHTML = `Current Server: <b style="color: #3e83dd;">${selectedOption.text}</b>.<br>If the current server doesn't work, please try other servers beside.`;

            showCustomLoader();
            videoFrame.onload = () => hideCustomLoader();
            videoFrame.src = selectedOption.value;

            const newURL = `${window.location.pathname}?server=${serverSelector.selectedIndex + 1}`;
            window.history.pushState({ path: newURL }, '', newURL);
        });
    }

    // ✅ EPISODE MODE
    if (typeof episodes !== 'undefined') {
        const serverSelector = document.getElementById('serverSelector');
        serverSelector.addEventListener('change', handleEpisodeServerChange);

        const urlParams = new URLSearchParams(window.location.search);
        const epFromURL = urlParams.get('ep');
        const lastPlayedEpisode = sessionStorage.getItem('lastPlayedEpisode');

        if (epFromURL && episodes[epFromURL]) {
            loadEpisode(epFromURL);
        } else if (lastPlayedEpisode && episodes[lastPlayedEpisode]) {
            loadEpisode(lastPlayedEpisode);
        } else {
            const firstEpisode = Object.keys(episodes).sort((a, b) => parseInt(a) - parseInt(b))[0];
            loadEpisode(firstEpisode);
        }
    }
});

function loadEpisode(epNumber) {
    const serverSelector = document.getElementById('serverSelector');
    const iframe = document.getElementById('videoFrame');
    const episodeTitle = document.getElementById('episodeTitle');
    const urlParams = new URLSearchParams(window.location.search);
    const serverParam = parseInt(urlParams.get('server'));
    const serverIndex = !isNaN(serverParam) && serverParam > 0 ? serverParam - 1 : 0;

    if (episodes[epNumber]) {
        serverSelector.innerHTML = episodes[epNumber].map((server, index) =>
            `<option value="${server}">Server ${index + 1}</option>`
        ).join('');

        serverSelector.selectedIndex = serverIndex;

        showCustomLoader();
        iframe.onload = () => hideCustomLoader();
        iframe.src = episodes[epNumber][serverIndex] || episodes[epNumber][0];

        episodeTitle.innerHTML = `You are watching: <b style="color: #3e83dd;">${episodeTitles[epNumber]}</b>.<br>If the current server doesn't work, please try other servers beside.`;

        sessionStorage.setItem('lastPlayedEpisode', epNumber);
        highlightCurrentEpisode(epNumber);
        updateNavigationButtons(epNumber);

        const newURL = `${window.location.pathname}?ep=${epNumber}&server=${serverSelector.selectedIndex + 1}`;
        window.history.pushState({ path: newURL }, '', newURL);
    } else {
        alert('Episode not available!');
    }
}

function handleEpisodeServerChange() {
    const serverSelector = document.getElementById('serverSelector');
    const iframe = document.getElementById('videoFrame');
    const currentEp = sessionStorage.getItem('lastPlayedEpisode');

    if (!currentEp || !episodes[currentEp]) return;

    showCustomLoader();
    iframe.onload = () => hideCustomLoader();
    iframe.src = serverSelector.value;

    const newURL = `${window.location.pathname}?ep=${currentEp}&server=${serverSelector.selectedIndex + 1}`;
    window.history.pushState({ path: newURL }, '', newURL);
}

function updateNavigationButtons(epNumber) {
    const prevButton = document.getElementById('prevEpisode');
    const nextButton = document.getElementById('nextEpisode');
    const episodeNumbers = Object.keys(episodes).sort((a, b) => parseInt(a) - parseInt(b));
    const currentIndex = episodeNumbers.indexOf(epNumber);

    prevButton.style.display = currentIndex === 0 ? 'none' : 'inline-block';
    nextButton.style.display = currentIndex === episodeNumbers.length - 1 ? 'none' : 'inline-block';
}

function highlightCurrentEpisode(epNumber) {
    const buttons = document.querySelectorAll('.episode-buttons button');
    buttons.forEach(button => button.classList.remove('active'));

    const currentButton = document.getElementById(`episode-${epNumber}`);
    if (currentButton) {
        currentButton.classList.add('active');
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

// 🌀 Loader inside .video-container
function showCustomLoader() {
    const container = document.querySelector('.video-container');

    let loader = document.getElementById('customLoader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'customLoader';
        loader.innerHTML = `<div class="spinner"></div>`;
        container.appendChild(loader);
    }
    loader.style.display = 'flex';
}

function hideCustomLoader() {
    const loader = document.getElementById('customLoader');
    if (loader) {
        loader.style.display = 'none';
    }
}
