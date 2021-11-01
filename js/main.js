import { createPlayer, getUsersAlbumsSpotify } from './spotify.js';
import { playSong } from './scrub.js';
import { createPageFromArray } from './helper.js';
import { MENUS } from './templates.js';
import { SpotifyData } from './classes/spotify-data.js';

// stack of menu titles
let titleText = ['iPod'];

// defining animation times
const animationTime = 500;

// important dom elements 
var lines = Array.from(document.getElementsByClassName('lines'));
const title = document.getElementById('title');
const menu = document.getElementsByClassName('menu')[0];
const screen = document.getElementById('screen');
const loginButton = document.getElementById('btn-login');

let fullAlbumList = [];
let fullSongList = [];

const spotifyData = new SpotifyData();

// log the user in and get their  access token
function login(callback) {
    var CLIENT_ID = '0981792b5bc94457a102687309d0beb6';
    var REDIRECT_URI = 'http://localhost:35729/proxy.html';
    function getLoginURL(scopes) {
        return 'https://accounts.spotify.com/authorize?client_id=' + CLIENT_ID +
          '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
          '&scope=' + encodeURIComponent(scopes.join(' ')) +
          '&response_type=token';
    }
    
    var url = getLoginURL([
        'user-read-email',
        'user-library-read',
        'streaming',
        'user-read-private',
        'user-modify-playback-state',
        'user-read-currently-playing',
        'user-read-playback-state'
    ]);
    
    var width = 450,
        height = 730,
        left = (screen.width / 2) - (width / 2),
        top = (screen.height / 2) - (height / 2);

    window.addEventListener("message", function handler(event) {
        var hash = JSON.parse(event.data);
        if (hash.type == 'access_token') {
            callback(hash.access_token);
        }
        this.removeEventListener('message', handler);
    }, false);
    
    var w = window.open(url,
        'Spotify',
        'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left
    );
}

loginButton.addEventListener('click', function() {
    login(async function(accessToken) {
        // this is the callback
        window.document.removeEventListener("message", this, false);
        
        localStorage.setItem('access_token', accessToken);
        document.getElementById('screen').style.display = 'block';
        loginButton.style.display = 'none';

        // get the full catalog for the user
        const usersAlbumData = await getUsersAlbumsSpotify(accessToken);
        fullAlbumList = usersAlbumData;
        createPlayer(accessToken);

        // test object
        spotifyData.setAccessToken(accessToken);
        spotifyData.setAllData(usersAlbumData);

        MENUS.songs = spotifyData.getSongs();
        MENUS.albums = spotifyData.getAblums();
        MENUS.artists = spotifyData.getArtists();
    });
});

// will go back to previous page
async function onTitleClick() {
    try {
        // disable click events
        screen.style['pointer-events'] = 'none';
        title.style['pointer-events'] = 'none';

        // update list
        lines = Array.from(document.getElementsByClassName('lines'));

        // cant go back
        if (lines.length === 1) return;

        // keep track of menu title
        titleText.pop();
        title.innerHTML = titleText[titleText.length -1];
        
        // bring back one space
        const multiplier = lines.length - 2;
        lines.forEach(m => {m.style.transform = `translateX(calc(${-multiplier * 100}% - ${multiplier * 15}px))`;});
        // wait for animation to finish and delete element
        await new Promise(resolve => setTimeout(resolve, animationTime));
        document.getElementsByClassName('lines')[lines.length - 1].remove();
        lines.splice(lines.length - 1, 1);
    }
    catch(e) {
        console.error('There was an error going back', e);
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

        // what is the next menu
        const text = e.target.textContent.toLowerCase().replaceAll(' ', '_');
        
        var menuItems = undefined;
        if ([...e.target.classList].includes('album-item')) {
            menuItems = spotifyData.getTracksForAlbum(e.target.textContent);
        }
        else if ([...e.target.classList].includes('artist-item')) {
            menuItems = spotifyData.getAlbumsForArtist(e.target.textContent)
        }
        else {
            menuItems = MENUS[text];
        }

        if (!menuItems) throw new Error();

        // keep track of menu title
        titleText.push(e.target.textContent);
        title.innerHTML = titleText[titleText.length -1];
        
        const div = createPageFromArray(menuItems);
        await menu.append(div);

        // wait workaround
        await new Promise(resolve => setTimeout(resolve, 100));

        // do the transform
        lines = Array.from(document.getElementsByClassName('lines'));
        const multiplier = lines.length -1;
        lines.forEach(m => {
            m.style.transform = `translateX(calc(-${multiplier}00% - ${multiplier * 15}px))`;
        });

        if (text === 'now_playing')
            playSong();

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

    const songList = Array.from(lines[lines.length - 1].getElementsByTagName('p')).map(s => s.id);
    const currentSongIndex = songList.findIndex(i => e.target.id === i);
    const songQueue = songList.slice(currentSongIndex).concat(songList.slice(0,currentSongIndex));

    const data = {
        "uris": songQueue,
        "position_ms": 0
    }

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

    const falseEvent = {
        target: {
            textContent: 'Now Playing',
            classList: []
        }
    }
    onMenuClick(falseEvent);
}

// set the listeners for menu items
function setListeners() {
    console.log('adding listeners');
    const menuElements = document.querySelectorAll('.lines > p.menu-item');
    const songElements = document.querySelectorAll('.lines > p.song-item');

    menuElements.forEach(item => {
        item.addEventListener('click', onMenuClick, false);
    });

    songElements.forEach(item => {
        item.addEventListener('click', onSongClick, false);
    })
}

// set listener for the title
title.addEventListener('click', onTitleClick);

// logic responsible for clock
const timeOptions = { hour: '2-digit', minute: '2-digit' };
function flipClock(showClock) {
    setTimeout(() => {
        title.innerHTML = showClock ? new Date().toLocaleTimeString('en-US', timeOptions) : titleText[titleText.length - 1];
        flipClock(!showClock);
    }, 10000);
}

// initial calls
setListeners();
flipClock(false);
