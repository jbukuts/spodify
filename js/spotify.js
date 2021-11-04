import { createPalette } from './palette/palette.js';
import { getRandomInt, createTimeString } from './helper.js';
import { MENUS } from './templates.js';

Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};

const blobs = [...document.getElementsByClassName("blob")];
const shuffleButton = document.getElementById('shuffleButton');

var currentVolume = .1;

const pauseBtn = `./assets/icons/pause.svg`;
const playBtn = `./assets/icons/play.svg`;


export function createPlayer(token) {

    // drop player script in
    var tag = document.createElement("script");
    tag.src = "https://sdk.scdn.co/spotify-player.js";
    document.getElementsByTagName("head")[0].appendChild(tag);

    console.log('creating player!');
    window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new Spotify.Player({
            name: 'Web Playback SDK Quick Start Player',
            getOAuthToken: cb => { cb(token); },
            volume: currentVolume
        });
    
        // Ready
        player.addListener('ready', ({ device_id }) => {
            console.log('Ready with Device ID', device_id);
            localStorage.setItem('device_id', device_id);
            changeSpofityPlayerById(token, device_id);

            // volume control listeners
            document.addEventListener('keydown', (e) => {
                if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
                    var volMod = 0;
                    switch (e.code) {
                        case 'ArrowUp':
                            volMod = .05;
                            break;
                        case 'ArrowDown':
                            volMod = -.05;
                            break;
                    }
                    player.getVolume().then(currentVolume => {
                        player.setVolume((currentVolume + volMod).clamp(0,1));
                    });
                }
                else if (e.code === 'ArrowLeft') {
                    player.previousTrack();
                }
                else if (e.code === 'ArrowRight') {
                    player.nextTrack();
                }
                else if(e.code === 'Space') {
                    const searchBar = document.getElementById('search');
                    if (!searchBar || searchBar !== document.activeElement)
                        player.togglePlay();
                }
            });

            shuffleButton.onclick = function() {
                const currentShuffle = shuffleButton.style.opacity === '1';
                setUsersPlayback(token, !currentShuffle, device_id);
            };
        });
    
        // Not Ready
        player.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID has gone offline', device_id);
        });
    
        player.addListener('initialization_error', ({ message }) => {
            console.error(message);
        });
    
        player.addListener('authentication_error', ({ message }) => {
            console.error(message);
        });
    
        player.addListener('account_error', ({ message }) => {
            console.error(message);
        });

        // update the current track when needed
        player.addListener('player_state_changed', ({ track_window: { current_track }, shuffle, paused, duration, position }) => {
            // console.log('there was a change', state);
            const stateTrack = current_track;
            const storedTrack = JSON.parse(localStorage.getItem('current_song'));
            document.getElementById('playButton').src = paused ? playBtn : pauseBtn;

            shuffleButton.style.opacity = shuffle ? '1' : '.25';
            
            if (stateTrack && storedTrack && stateTrack.id !== storedTrack.id) {
                localStorage.setItem('current_song', JSON.stringify(stateTrack));
                const imageURL = stateTrack.album.images[0].url;
                console.log(MENUS);

                const songNumber = document.getElementById('song-number');
                drawNowPlayingMenu({ track_window: { current_track: stateTrack }});
                drawNowPlayingScrub({ duration, position });

                if (songNumber) {
                    console.log(current_track);

                    getCurrentlyPlaying(token).then(c => {
                        getAlbumById(c.item.album.id, token).then(a => {
                            const trackIndex = a.tracks.items.findIndex((t) => t.uri === current_track.uri);
                            songNumber.innerHTML = `${trackIndex + 1} of ${a.tracks.items.length}`;
                        })
                    });
                }

                // get the palette
                createPalette(imageURL, 10, 16).then(r => { 
                    // console.log(r);

                    // our bg is first in the list
                    const bgColor = r[0];
                    document.body.style.background = `rgb(${bgColor[0]},${bgColor[1]},${bgColor[2]})`;

                    // for each of the blobs pull a random color
                    blobs.forEach(b => {
                        const randomColor = r[getRandomInt(1,r.length)];
                        //console.log(randomColor);
                        b.style.background = `rgb(${randomColor[0]},${randomColor[1]},${randomColor[2]})`;
                    })                
                });
            }
        });

        // scrub in the song
        document.addEventListener('scrub_song', async (e) => {
            await player.getCurrentState().then(async (state) => {
                await player.seek(state.duration * e.detail);
                player.resume();
            });
        });

        // pause the song when scrubbing
        document.addEventListener('scrub_song_pause', async () => {
            player.pause();
        });

        const drawNowPlayingMenu = (playState) => {
            // console.log(playState);
            const currentPlaying = playState.track_window.current_track;
            document.getElementById('song-title').innerHTML = currentPlaying.name;
            document.getElementById('artist').innerHTML = currentPlaying.artists[0].name;
            document.getElementById('album').innerHTML = currentPlaying.album.name;

            const songNumber = document.getElementById('song-number');
            getCurrentlyPlaying(token).then(c => {
                getAlbumById(c.item.album.id, token).then(a => {
                    const trackIndex = a.tracks.items.findIndex((t) => t.uri === currentPlaying.uri) + 1;
                    songNumber.innerHTML = `${trackIndex} of ${a.tracks.items.length}`;
                })
            });
        }

        const drawNowPlayingScrub = (playState) => {
            const scrubBar = document.getElementById('scrub-bar');

            // get vals from player
            const duration = playState.duration / 1000;
            const currentTime = playState.position / 1000;
            const percent = currentTime / duration;

            // set the timers vals
            document.getElementById('player-time').innerHTML = createTimeString(duration, currentTime);
            scrubBar.style.width = `${percent * 100}%`;
        };

        document.addEventListener('show_now_playing', () => {
            // we need click listeners
            console.log('creating now playing events');
            document.getElementById('album').onclick = (e) => {
                console.log(e.target.textContent);
                document.dispatchEvent(new CustomEvent('go_to_item', { detail : { album: e.target.textContent }}));
            };

            document.getElementById('artist').onclick = (e) => {
                console.log(e.target.textContent);
                document.dispatchEvent(new CustomEvent('go_to_item', { detail : { artist: e.target.textContent }}));
            };
            
            // draw elements
            player.getCurrentState().then(playState => drawNowPlayingMenu(playState));
        });
    
        // toggle player
        document.getElementById('playButton').onclick = function() {
            player.togglePlay();
        };

        // get the state every second to update the player
        const getSpotifyPlayerState = () => {
            setTimeout(async () => {
                const scrubBar = document.getElementById('scrub-bar');
                if (scrubBar) {
                    try {
                        player.getCurrentState().then(playState => {
                            if (!playState.paused) {
                                drawNowPlayingScrub(playState);
                            }
                        });
                    }
                    catch(e) {
                        console.error('there was an issue seeking', e);
                    }
                    
                }
                getSpotifyPlayerState();
            }, 1000);
        };

        getSpotifyPlayerState();
        player.connect();
    }
}

async function changeSpofityPlayerById(token, deviceId) {

    const data = {
        device_ids: [deviceId]
    };

    await fetch(`https://api.spotify.com/v1/me/player`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
}

// get all the user's albums from spotify
export async function getUsersAlbumsSpotify(token) {
    var fullAlbumList = [];
    var offset = 0;
    var limit = 50;
    
    try {
        do {
            const apiEndpoint = `https://api.spotify.com/v1/me/albums?limit=${limit}&offset=${offset}`;
            const res = await fetch(apiEndpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => response.json());
            fullAlbumList = fullAlbumList.concat(res.items);
            offset+= limit;
        } while(fullAlbumList.length % limit === 0)
    } 
    catch(e) {
        console.error(e);
    }
    return fullAlbumList;
}

export async function getProfileData(accessToken) {
    try {
        const profData = await fetch(`https://api.spotify.com/v1/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(response => response.json())
        return profData;
    }
    catch(e) {
        console.error('There was an issue getting users profile data', e);
    }
}

export async function getAlbumById(albumId, accessToken) {
    try {
        return fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        }).then(r => r.json());
    }
    catch(e) {
        console.log('Error getting album by Id', e);
    }
}

export function getCurrentlyPlaying(accessToken) {
    try {
        return fetch(`https://api.spotify.com/v1/me/player/currently-playing`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        }).then(r => r.json());
    }
    catch(e) {
        console.log('Error getting album by Id', e);
    }
}

export async function setUsersPlayback(accessToken, state, deviceId) {
    try {
        await fetch(`https://api.spotify.com/v1/me/player/shuffle?state=${state}&device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });
    }
    catch(e) {
        console.error('Failed to set users shuffle', e);
    }    
}