import { createPlayer } from './spotify.js';
import { createPageFromArray, createHTMLFromInput } from './common/helper.js';
import { MENUS, SEARCH_BOX } from './templates.js';
import { SpotifyData } from './classes/spotify-data.js';
import conf from './conf/conf.json' assert { type: "json" };
import { 
    getUsersAlbumsSpotify, 
    getProfileData, 
    getCurrentlyPlaying, 
    getRecentlyPlayedTracks,
    setUsersRepeatMode,
    setUsersPlaybackShuffle
} from './common/client-api-calls.js';

// stack of menu titles
let titleText = ['iPod'];

// defining animation times
const animationTime = 500;

// important dom elements 
const title = document.getElementById('title');
const menu = document.getElementsByClassName('menu')[0];
const screen = document.getElementById('screen');
const loginButton = document.getElementById('btn-login');

const spotifyData = new SpotifyData();

/** LISTENERS **/
// set listener for the title
title.addEventListener('click', async () => shiftPageAmount(1));

// on login click prompt the user for auth
loginButton.addEventListener('click', function() {
    login(async function(accessToken) {
        // this is the callback
        window.document.removeEventListener("message", this, false);
        localStorage.setItem('access_token', accessToken);
        spotifyData.setAccessToken(accessToken);

        loginButton.style.opacity = 0;

        // get the full catalog for the user
        getUsersAlbumsSpotify(accessToken).then(async allAlbums => {
            spotifyData.setAllData(allAlbums);

            MENUS.albums = createHTMLFromInput(spotifyData.getAlbums(), ['menu-item','album-item']);
            MENUS.songs = createHTMLFromInput(spotifyData.getSongs(), ['song-item']);
            MENUS.artists = createHTMLFromInput(spotifyData.getArtists(), ['menu-item','artist-item']);
            
            createPlayer(accessToken);

            MENUS.about = [
                ...MENUS.about,
                `<p class="justify-text">Songs ${MENUS.songs.length}</p>`,
                `<p class="justify-text">Albums ${MENUS.albums.length}</p>`,
                `<p class="justify-text">Artist ${MENUS.artists.length}</p>`
            ];

            MENUS.albums.unshift(SEARCH_BOX);
            MENUS.songs.unshift(SEARCH_BOX);
            MENUS.artists.unshift(SEARCH_BOX);

            document.documentElement.style.setProperty('--screen-state', 'flex');
            new Promise(resolve => setTimeout(resolve, 1000)).then(() => {
                document.documentElement.style.setProperty('--screen-opacity', '1');
            });
            
            document.getElementById('login').style.display = 'none';
        });

        getRecentlyPlayedTracks(accessToken, 10).then(r => {
            MENUS.recently_played = createHTMLFromInput(r.items.map(s => s.track), ['song-item']);
        })

        // get the profile data for the user to save to the menus
        getProfileData(accessToken).then(profileData => {
            console.log(profileData);
            titleText[0] = `${profileData.display_name}'s iPod`;
            document.title = titleText[0];

            MENUS.about = [
                `<p class="who-ipod">${titleText[0].toUpperCase()}</p>`,
                `<p class="justify-text">Version ${conf.version}</p>`
            ]
        });
    });
});

document.addEventListener('show_lyrics', (e) => {
    console.log(MENUS.lyrics);
    onMenuClick({
        target: {
            textContent: 'Lyrics',
            classList: []
        }
    });
});

// go to artist/album from now playing
document.addEventListener('go_to_item', (e) => {
    const item =  e.detail.album ? e.detail.album : e.detail.artist;
    onMenuClick({
        target: {
            textContent: e.detail.heading,
            dataset: {
                uri: item
            },
            classList: e.detail.album ? ['album-item'] : ['artist-item']
        }
    });
});

/** FUNCTIONS **/
// log the user in and get their  access token
function login(callback) {
    var CLIENT_ID = '0981792b5bc94457a102687309d0beb6';
    var REDIRECT_URI = `${conf.host}${conf.redirectPath}`;
    function getLoginURL(scopes) {
        return 'https://accounts.spotify.com/authorize?client_id=' + CLIENT_ID +
          '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
          '&scope=' + encodeURIComponent(scopes.join(' ')) +
          '&response_type=token';
    }
    
    var url = getLoginURL(conf.spotifyPermissions);
    
    var width = 450,
        height = 730,
        left = (screen.width / 2) - (width / 2),
        top = (screen.height / 2) - (height / 2);

    window.addEventListener("message", function handler(event) {
        var hash = JSON.parse(event.data);
        if (hash.type == 'access_token') {
            console.log(hash);
            callback(hash.access_token);
        }
        this.removeEventListener('message', handler);
    }, false);
    
    var w = window.open(url,
        'Spotify',
        'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left
    );
}

// shifting a page back by x amount
async function shiftPageAmount(a) {
    try {
        // disable click events
        screen.style['pointer-events'] = 'none';
        title.style['pointer-events'] = 'none';

        // update list
        const lines = Array.from(document.getElementsByClassName('lines'));

        // cant go back
        if (lines.length === 1) return;

        titleText = titleText.splice(0, titleText.length - a);
        title.innerHTML = titleText[titleText.length - 1];

        // bring back one space
        const multiplier = lines.length - a - 1;
        lines.forEach(m => {m.style.transform = `translateX(calc(${-multiplier * 100}% - ${multiplier * 15}px))`;});
        
        // wait for animation to finish and delete element
        await new Promise(resolve => setTimeout(resolve, animationTime));

        const linesLenth = lines.length;
        for (var i = titleText.length; i < linesLenth; i++) {
            const temp = document.getElementsByClassName('lines');
            temp[temp.length - 1].remove();
        }
        // lines.splice(titleText.length, a);
    }
    catch(e) {
        console.error(`There was an issue shifting the page ${a} times`);
    }
    finally {
        screen.style['pointer-events'] = 'all';
        title.style['pointer-events'] = titleText.length === 1 ? 'none' : 'all';
    }
}

// responsible for shifting to new page
async function onMenuClick(e) {
    try {
        // disable click events
        screen.style['pointer-events'] = 'none';

        // if already exist go to it
        if (titleText.includes(e.target.textContent)) {    
            const shiftAmount = titleText.length - 1 - titleText.indexOf(e.target.textContent);
            shiftPageAmount(shiftAmount);
            document.dispatchEvent(new CustomEvent('show_now_playing'));
            return;
        }

        // what is the next menu
        const text = e.target.textContent.toLowerCase().replaceAll(' ', '_');
        let titleHead = e.target.textContent;

        var menuItems = undefined;
        if ([...e.target.classList].includes('album-item')) {
            console.log(e.target.dataset.uri);
            const albumJSON = spotifyData.getTracksForAlbum(e.target.dataset.uri);
            menuItems = createHTMLFromInput(albumJSON, ['song-item']);

            console.log(albumJSON);
            
            // if currently playing append the speaker icons
            await getCurrentlyPlaying(spotifyData.getAccessToken()).then(r => {
                const { item: {uri, name, track_number, album: { uri: albumURI } }} = r;
                if (albumURI === e.target.dataset.uri) {
                    console.log('this is same album', track_number);
                    const volumeIcon = '<i class="fas fa-volume-up"></i>';
                    menuItems[track_number-1] = `<p data-uri="${uri}" class="song-item currently-playing">${name} ${volumeIcon}</p>`;
                }
            });
        }
        else if ([...e.target.classList].includes('artist-item')) {
            const albumForArtistJSON = spotifyData.getAlbumsForArtist(e.target.textContent)
            menuItems = createHTMLFromInput(albumForArtistJSON,['menu-item','album-item']);

            // go straight to alubm for artists with single album
            if (menuItems.length === 1) {
                console.log(menuItems[0]);
                const matchURI = menuItems[0].match(/data-uri="[a-z]*:[a-z]*:([a-z]|[0-9])*"/ig);
                const matchTitle = menuItems[0].match(/>.*</ig);
                if (matchURI && matchTitle) {
                    titleHead = matchTitle[0].substring(1,matchTitle[0].length-1);
                    const uriFromList = matchURI[0].substring(10, matchURI[0].length-1);

                    menuItems = createHTMLFromInput(spotifyData.getTracksForAlbum(uriFromList),['song-item']);

                    // if currently playing append the speaker icons
                    await getCurrentlyPlaying(spotifyData.getAccessToken()).then(r => {
                        const { item: {uri, name, track_number, album: { uri: albumURI } }} = r;
                        if (albumURI === uriFromList) {
                            console.log('this is same album', track_number);
                            const volumeIcon = '<i class="fas fa-volume-up"></i>';
                            menuItems[track_number-1] = `<p data-uri="${uri}" class="song-item currently-playing">${name} ${volumeIcon}</p>`;
                        }
                    });
                } 
            }
        }
        else {
            menuItems = MENUS[text];
        }

        if (!menuItems) throw new Error();

        // keep track of menu title
        titleText.push(titleHead);
        title.innerHTML = titleText[titleText.length -1];
        
        const div = createPageFromArray(menuItems);
        await menu.append(div);

        const search = document.getElementById('search');
        if (search) search.addEventListener('input', searchHandler);

        // wait workaround
        await new Promise(resolve => setTimeout(resolve, 100));

        // do the transform
        const lines = [...document.getElementsByClassName('lines')];
        const multiplier = lines.length -1;
        lines.forEach(m => {
            m.style.transform = `translateX(calc(-${multiplier}00% - ${multiplier * 15}px))`;
        });

        // some pages need special treatmeant
        if (text === 'now_playing')
            document.dispatchEvent(new CustomEvent('show_now_playing'));
        else if (menuItems[0] === MENUS.snake[0])
            loadSnake();
        else if(menuItems[0] === MENUS.settings[0])
            createSettingsListeners()

        // new listeners for new menu
        setListeners();
    }
    catch(err) {
        console.error('There was an error shifting menu', err);
    }
    finally {
        screen.style['pointer-events'] = 'all';
        title.style['pointer-events'] = 'all';
    }
}

// will play song and shift to now playing
async function onSongClick(e) {
    // if not the current song we can do this
    if (!e.target.classList.contains('currently-playing')) {
        const lines = [...document.getElementsByClassName('lines')];
        const songList = Array.from(lines[lines.length - 1]
            .getElementsByTagName('p'))
            .map(s => s.dataset.uri);
        
        console.log(songList);
    
        const currentSongIndex = songList.findIndex(i => e.target.dataset.uri === i);
        const albumURI = spotifyData.findAlbumBySongID(e.target.dataset.uri);
    
        const data = {
            uris: songList,
            // context_uri: albumURI,
            offset: {
                position: currentSongIndex
            },
            position_ms: 0
        };

        // play the song
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${localStorage.getItem('device_id')}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${spotifyData.getAccessToken()}`
            },
            body: JSON.stringify(data)
        });
    }

    const falseEvent = {
        target: {
            textContent: 'Now Playing',
            classList: []
        }
    }
    onMenuClick(falseEvent);
}

function createSettingsListeners() {
    document.getElementById('repeat-option').onclick = (e) => {
        const repeatOptions = ['off','context','track'];
        setUsersRepeatMode(spotifyData.getAccessToken(), repeatOptions[e.target.dataset.next]);
    };
    document.getElementById('shuffle-option').onclick = (e) => {
        setUsersPlaybackShuffle(spotifyData.getAccessToken(), e.target.dataset.next);
    };
}

// set the listeners for menu items
function setListeners() {
    const menuElements = document.querySelectorAll('.lines > p.menu-item');
    const songElements = document.querySelectorAll('.lines > p.song-item');

    menuElements.forEach(item => {
        item.addEventListener('click', onMenuClick, false);
    });

    songElements.forEach(item => {
        item.addEventListener('click', onSongClick, false);
    })
}

// logic responsible for clock
function flipClock(showClock) {
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    setTimeout(() => {
        title.innerHTML = showClock ? 
            new Date().toLocaleTimeString('en-US', timeOptions) : titleText[titleText.length - 1];
        flipClock(!showClock);
    }, 10000);
}

// loads the snake game
function loadSnake() {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "./js/components/snake.js"; 
    document.getElementsByTagName("head")[0].appendChild(script);
}

// handles the search functionality
const searchHandler = function(e) {
    const input = e.target.value;
    try {
        // current pages nodes
        const lines = [...document.getElementsByClassName('lines')];
        const fullList = [...lines[lines.length-1].children];
        if (fullList) {
            // shift out of the search bar
            fullList.shift();

            // show all again
            fullList.forEach((s) => s.style.display = 'block');

            // query for those that dont match and hide
            const regex = new RegExp(`^${input}[a-z]*`,'i');
            fullList
                .filter(i => !i.innerText.match(regex))
                .forEach((s) => s.style.display = 'none');
        }
    }
    catch(e) {
        console.error('There was an issue with the search funcion', e);
    }
}

flipClock(false);
setListeners();