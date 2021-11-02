import { createTimeString } from './helper.js';

// logic for song scrubbing
var mouseDown = false;

function mouseDownScrub(e, c) {
    document.dispatchEvent(new CustomEvent('scrub_song_pause'));
    mouseDown = true;
    scrubSong(e, c);
}

function mouseUpScrub(e) {
    mouseDown = false;
    const scrubBar = document.getElementById('scrub-bar');
    const percent = parseInt(scrubBar.style.width.replaceAll('%','')) / 100;
    document.dispatchEvent(new CustomEvent('scrub_song', { detail : percent}));
}

function scrubSong(e, c) {
    if (mouseDown) {
        var rect = e.target.getBoundingClientRect();
        var x = e.clientX - rect.left;
        const percent = (x / c.offsetWidth);
        const scrubBar = document.getElementById('scrub-bar');
        scrubBar.style.width = `${percent * 100}%`;

        const timeStrings = document.getElementById('player-time');
        const fullTime = timeStrings.innerHTML
            .replaceAll('-','')
            .split(' ')
            .map(x => convertTimeString(x))
            .reduce((acc, curr) => acc + curr, 0);
    
        timeStrings.innerHTML = createTimeString(fullTime, Math.floor(fullTime * percent));
    }
}

function convertTimeString(timeString) {
    const split = timeString.replaceAll('-','')
        .split(':')
        .map(x => parseInt(x));
    return (split[0] * 60) + split[1];
}

export function playSong() {    
    const scrub = document.getElementById('scrub');
    scrub.addEventListener("mousedown", (e) => mouseDownScrub(e, scrub));
    scrub.addEventListener("mouseup", (e) => mouseUpScrub(e));
    // scrub.addEventListener("mouseleave", (e) => mouseUpScrub(e));
    scrub.addEventListener("mousemove", (e) => scrubSong(e, scrub));

    document.dispatchEvent(new CustomEvent('show_now_playing'));
}