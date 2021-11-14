// important elements to create
export let NOW_PLAYING = [
    "<h3 id=\"song-number\">1 of 99</h3>",
    "<h3 id=\"song-title\"></h3>",
    "<h3 id=\"artist\"></h3>",
    "<h3 id=\"album\"></h3>",
    "<div id=\"scrub\"><div id=\"scrub-bar\"><div id=\"scrub-handle\"></div></div></div>",
    "<h3 id=\"player-time\">0:00 -0:00</h3>"
];

export const SEARCH_BOX = '<input type="text" id="search" name="search" placeholder="Search...">';

// menu items
export const MENUS = {
    music: [
        '<p class="menu-item disabled">Recently Played</p>',
        '<p class="menu-item">Artists</p>',
        '<p class="menu-item">Albums</p>',
        '<p class="menu-item disabled">Songs</p>',
        '<p class="menu-item disabled">Playlists</p>',
        '<p class="menu-item disabled">Search</p>'
    ],
    extras: [
        '<p class="menu-item">Games</p>',
        '<p class="menu-item disabled">Clock</p>',
    ],
    games: [
        '<p class="menu-item">Snake</p>',
        '<p class="menu-item disabled">Song Quiz</p>',
    ],
    settings: [
        '<p class="menu-item">About</p>',
        '<p class="menu-item disabled">Info</p>',
        '<p>Shuffle On</p>',
        '<p>Repeat Off</p>',
        '<p class="disabled">Logout</p>'
    ],
    now_playing: NOW_PLAYING,
    albums: [],
    artists: [],
    songs: [],
    about: [],
    lyrics: [],
    recently_played: [],
    snake: [
        '<canvas id="snake" width="400" height="260"></canvas>',
    ]
}

