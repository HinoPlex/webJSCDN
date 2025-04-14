document.addEventListener('DOMContentLoaded', () => {
    const iframe = document.getElementById('videoFrame');
    const selector = document.getElementById('serverSelector');
    const titleBox = document.createElement('div');
    titleBox.id = 'episodeTitle';
    titleBox.style.marginTop = '12px';
    titleBox.style.textAlign = 'center';
    titleBox.style.color = '#ccc';
    titleBox.style.fontSize = '14px';
    document.body.insertBefore(titleBox, document.querySelector('.video-container').nextSibling);

    if (typeof episodes !== 'undefined') {
        // === EPISODES MODE ===
        const urlParams = new URLSearchParams(window.location.search);
        const epFromURL = urlParams.get('ep');

        const navigationButtons = `
            <div class="navigation-buttons">
                <button id="prevEpisode"><span>&#171;</span> Prev</button>
                <button id="nextEpisode">Next <span>&#187;</span></button>
            </div>
        `;
        titleBox.insertAdjacentHTML('afterend', navigationButtons);

        const container = document.querySelector('.episode-buttons');
        if (container) {
            Object.keys(episodes).sort((a, b) => parseInt(a) - parseInt(b)).forEach(ep => {
                const btn = document.createElement('button');
                btn.id = `episode-${ep}`;
                btn.textContent = episodeTitles[ep] || `Episode ${ep}`;
                btn.addEventListener('click', () => loadEpisode(ep));
                container.appendChild(btn);
            });
        }

        function loadEpisode(ep) {
            selector.innerHTML = episodes[ep].map((url, i) =>
                `<option value="${url}">Server ${i + 1}</option>`
            ).join('');
            iframe.src = episodes[ep][0];
            titleBox.innerHTML = `You are watching: <b style="color: #3e83dd;">${episodeTitles[ep]}</b>.<br>If the current server doesn't work, please try other servers beside.`;

            highlightEpisode(ep);
            updateNavButtons(ep);
            showBuffering();

            const newURL = `${location.pathname}?ep=${ep}`;
            history.pushState({}, '', newURL);
        }

        function highlightEpisode(ep) {
            document.querySelectorAll('.episode-buttons button').forEach(btn =>
                btn.classList.remove('active')
            );
            document.getElementById(`episode-${ep}`)?.classList.add('active');
        }

        function updateNavButtons(ep) {
            const keys = Object.keys(episodes).sort((a, b) => parseInt(a) - parseInt(b));
            const idx = keys.indexOf(ep);
            document.getElementById('prevEpisode').style.display = idx === 0 ? 'none' : 'inline-block';
            document.getElementById('nextEpisode').style.display = idx === keys.length - 1 ? 'none' : 'inline-block';
        }

        function loadNextEpisode() {
            const keys = Object.keys(episodes).sort((a, b) => parseInt(a) - parseInt(b));
            const current = document.querySelector('.episode-buttons button.active')?.id?.replace('episode-', '');
            const idx = keys.indexOf(current);
            if (idx !== -1 && idx < keys.length - 1) {
                loadEpisode(keys[idx + 1]);
            }
        }

        function loadPreviousEpisode() {
            const keys = Object.keys(episodes).sort((a, b) => parseInt(a) - parseInt(b));
            const current = document.querySelector('.episode-buttons button.active')?.id?.replace('episode-', '');
            const idx = keys.indexOf(current);
            if (idx > 0) {
                loadEpisode(keys[idx - 1]);
            }
        }

        document.getElementById('prevEpisode').addEventListener('click', loadPreviousEpisode);
        document.getElementById('nextEpisode').addEventListener('click', loadNextEpisode);

        if (epFromURL && episodes[epFromURL]) loadEpisode(epFromURL);
        else loadEpisode(Object.keys(episodes)[0]);

    } else if (typeof movies !== 'undefined') {
        // === MOVIES MODE ===
        movies.forEach((movie, index) => {
            const opt = document.createElement('option');
            opt.value = movie.url;
            opt.textContent = movie.name;
            selector.appendChild(opt);
        });

        if (movies.length > 0) {
            iframe.src = movies[0].url;
            updateTitle(movies[0].name);
        }

        selector.addEventListener('change', () => {
            const selectedMovie = movies[selector.selectedIndex];
            iframe.src = selectedMovie.url;
            updateTitle(selectedMovie.name);
            showBuffering();
        });
    }

    iframe.addEventListener('load', hideBuffering);
});

function updateTitle(name) {
    const titleBox = document.getElementById('episodeTitle');
    titleBox.innerHTML = `Current Server: <b style="color: #3e83dd;">${name}</b>.<br>If the current server doesn't work, please try other servers beside.`;
}

function showBuffering() {
    const container = document.querySelector('.video-container');
    if (!container.querySelector('.lds-ellipsis')) {
        const loader = document.createElement('div');
        loader.className = 'lds-ellipsis';
        loader.innerHTML = '<div></div><div></div><div></div><div></div>';
        container.appendChild(loader);
    }
    container.querySelector('.lds-ellipsis').style.display = 'inline-block';
}

function hideBuffering() {
    const loader = document.querySelector('.lds-ellipsis');
    if (loader) loader.style.display = 'none';
}
