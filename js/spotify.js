import { createPalette } from './palette/palette.js';
import { getRandomInt, createTimeString } from './helper.js';

Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};

const blobs = [...document.getElementsByClassName("blob")];

var currentVolume = .1;

const pauseBtn = `<polygon fill="black" points="0,0 0,26 8,26 8,0"></polygon><polygon fill="black" points="16,0 16,26 24,26 24,0"></polygon>`;
const playBtn = `<polygon fill="black" points="0,0 0,28 26,14"></polygon>`;


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
        player.addListener('player_state_changed', (state) => {
            //console.log(state.track_window);
            const stateTrack = state.track_window.current_track;
            const storedTrack = JSON.parse(localStorage.getItem('current_song'));
            document.getElementById('playButton').innerHTML = state.paused ? playBtn : pauseBtn;
            
            if (stateTrack && storedTrack && stateTrack.id !== storedTrack.id) {
                localStorage.setItem('current_song', JSON.stringify(stateTrack));
                const imageURL = stateTrack.album.images[0].url;
                //console.log(imageURL);

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

        const drawToNowPlaying = async () => {
            const scrubBar = document.getElementById('scrub-bar');
            const playState = await player.getCurrentState();
            const currentPlaying = playState.track_window.current_track;
            document.getElementById('song-title').innerHTML = currentPlaying.name;
            document.getElementById('artist').innerHTML = currentPlaying.artists[0].name;
            document.getElementById('album').innerHTML = currentPlaying.album.name;

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
            drawToNowPlaying();
        });
    
        // toggle player
        document.getElementById('playButton').onclick = function() {
          player.togglePlay();
        };

        // get the state every second to update the player
        const getSpotifyPlayerState = (player) => {
            setTimeout(async () => {

                const scrubBar = document.getElementById('scrub-bar');
                if (scrubBar) {
                    try {
                        const playState = await player.getCurrentState();
                        const currentPlaying = playState.track_window.current_track;

                        document.getElementById('song-title').innerHTML = currentPlaying.name;
                        document.getElementById('artist').innerHTML = currentPlaying.artists[0].name;
                        document.getElementById('album').innerHTML = currentPlaying.album.name;

                        if (!playState.paused) {
                            drawToNowPlaying();
                        }
                    }
                    catch(e) {
                        console.error('there was an issue seeking', e);
                    }
                    
                }
                getSpotifyPlayerState(player);
            }, 1000);
        };

        getSpotifyPlayerState(player);
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