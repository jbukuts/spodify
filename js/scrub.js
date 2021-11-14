import { createTimeString } from './common/helper.js';

// logic for song scrubbing
var mouseDown = false;

export function mouseDownScrub(e, c) {
    document.dispatchEvent(new CustomEvent('scrub_song_pause'));
    mouseDown = true;
    scrubSong(e, c);
}

export function mouseUpScrub(e) {
    if (mouseDown) {
        mouseDown = false;
        const scrubBar = document.getElementById('scrub-bar');
        const percent = parseInt(scrubBar.style.width.replaceAll('%','')) / 100;
        document.dispatchEvent(new CustomEvent('scrub_song', { detail : percent}));
    }
}

export function scrubSong(e, c) {
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

export function convertTimeString(timeString) {
    const split = timeString.replaceAll('-','')
        .split(':')
        .map(x => parseInt(x));
    return (split[0] * 60) + split[1];
}