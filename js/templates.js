// important elements to create
const NOW_PLAYING = [
    "<h3 id=\"song-title\"></h3>",
    "<h3 id=\"artist\"></h3>",
    "<h3 id=\"album\"></h3>",
    "<div id=\"scrub\"><div id=\"scrub-bar\"><div id=\"scrub-handle\"></div></div></div>",
    "<h3 id=\"player-time\">0:00 -0:00</h3>"
];

// menu items
export const MENUS = {
    music: [
        '<p class="menu-item">Artists</p>',
        '<p class="menu-item">Albums</p>',
        '<p class="menu-item">Songs</p>'
    ],
    extras: [
        '<p class="menu-item">Games</p>',
        '<p class="menu-item">Clock</p>',
    ],
    games: [
        '<p class="menu-item">Snake</p>',
        '<p class="menu-item">Song Quiz</p>',
    ],
    settings: [
        '<p class="menu-item">About</p>',
        '<p class="menu-item">Gradient</p>',
    ],
    now_playing: NOW_PLAYING,
    albums: [],
    artists: [],
    songs: [],
}