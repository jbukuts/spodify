// logic for song scrubbing
var mouseDown = false;
function mouseDownScrub(e, c) {
    mouseDown = true;
    scrubSong(e, c);
}

function mouseUpScrub(e) {
    mouseDown = false;
}

function scrubSong(e, c) {
    if (mouseDown) {
        var rect = e.target.getBoundingClientRect();
        var x = e.clientX - rect.left;
        const percent = (x / c.offsetWidth);
        document.dispatchEvent(new CustomEvent('scrub_song', { detail : percent}));
    }
}

export function playSong() {    
    const scrub = document.getElementById('scrub');
    scrub.addEventListener("mousedown", (e) => mouseDownScrub(e, scrub));
    scrub.addEventListener("mouseup", (e) => mouseUpScrub(e));
    scrub.addEventListener("mouseleave", (e) => mouseUpScrub(e));
    scrub.addEventListener("mousemove", (e) => scrubSong(e, scrub));
}