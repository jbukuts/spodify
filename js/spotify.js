import { createPalette } from './palette/palette.js';
import { getRandomInt, createTimeString } from './common/helper.js';
import { mouseDownScrub, mouseUpScrub, scrubSong } from './scrub.js';
import conf from './conf/conf.json' assert { type: "json" };
import { 
    changeSpotifyPlayerById, 
    getAlbumById, 
    getCurrentlyPlaying, 
    setUsersPlaybackShuffle, 
    setUsersRepeatMode,
    getSongLyrics
} from './common/client-api-calls.js';
import { MENUS } from './templates.js';

Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};

const blobs = [...document.getElementsByClassName("blob")];
const shuffleButton = document.getElementById('shuffleButton');
const repeatButton = document.getElementById('repeatButton');
const repeatOptions = ['off','context','track'];
const volumeChange = .025;
var currentVolume = .1;

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
            changeSpotifyPlayerById(token, device_id).then(() => {
                player.getCurrentState().then(playState => {
                    drawTheBlobs(playState);
                })
            });

            // volume control listeners
            document.addEventListener('keydown', (e) => {
                const snakeGame = document.getElementById('snake');
                if (!snakeGame) {
                    if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
                        var volMod = 0;
                        switch (e.code) {
                            case 'ArrowUp':
                                volMod = volumeChange;
                                break;
                            case 'ArrowDown':
                                volMod = -volumeChange;
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
                }
            });

            shuffleButton.onclick = () => {
                player.getCurrentState().then(({ shuffle }) => {
                    setUsersPlaybackShuffle(token, !shuffle, device_id);
                });                
            };

            repeatButton.onclick = () => {
                player.getCurrentState().then(({ repeat_mode }) => {
                    const repeatMode = repeat_mode + 1 > 2 ? 0 : repeat_mode + 1;
                    console.log(repeatOptions[repeatMode]);
                    setUsersRepeatMode(token, repeatOptions[repeatMode], device_id);
                    console.log(repeatMode);
                });
            }
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
        player.addListener('player_state_changed', ({ track_window: { current_track }, shuffle, repeat_mode, paused, duration, position }) => {
            // console.log('there was a change', state);
            const stateTrack = current_track;
            const storedTrack = JSON.parse(localStorage.getItem('current_song'));
            document.getElementById('playButton').src = `./assets/icons/${paused ? 'play' : 'pause'}.svg`;

            const repeatModes = ['Off','All', 'One'];
            const shuffleMenuItem = document.getElementById('shuffle-option');
            const nextRepeatMode = repeat_mode + 1 > repeatModes.length - 1 ? 0 : repeat_mode + 1;
            if (shuffleMenuItem) {
                const repeatMenuItem = document.getElementById('repeat-option');
                shuffleMenuItem.innerHTML = `Shuffle ${shuffle ? 'On' : 'Off'}`;
                repeatMenuItem.innerHTML = `Repeat ${repeatModes[repeat_mode]}`;
                repeatMenuItem.dataset.next =  nextRepeatMode;
                shuffleMenuItem.dataset.next =  !shuffle;
            }

            MENUS.settings[2] = `<p class="justify-text cursor-hover" data-next=${!shuffle} id="shuffle-option">Shuffle ${shuffle ? 'On' : 'Off'}</p>`;
            MENUS.settings[3] = `<p class="justify-text cursor-hover" data-next=${nextRepeatMode} id="repeat-option">Repeat ${repeatModes[repeat_mode]}</p>`;

            // TODO: Remove this functionality
            shuffleButton.style.opacity = shuffle ? '1' : '.25';
            repeatButton.style.opacity = repeat_mode > 0 ? '1' : '.25';
            repeatButton.style.background = repeat_mode === 2 ? 'red' : 'white';
            
            if (stateTrack && storedTrack && stateTrack.id !== storedTrack.id) {
                localStorage.setItem('current_song', JSON.stringify(stateTrack));

                // change the lyrics
                getSongLyrics(stateTrack.name, stateTrack.artists[0].name).then(r => {
                    console.log(r)
                    MENUS.lyrics = r.lyrics.map(line => {
                        return `<p>${line}</p>`;
                    });
                    console.log(MENUS.lyrics);
                });

                const pages = Array.from(document.getElementsByClassName('lines'));
                pages.forEach(p => {
                    // if there is a songlist
                    if (p.firstChild.classList && p.firstChild.classList.contains('song-item')) {
                        // lets see if the icon for now playing is present
                        const songsListDOM = [...p.children];
                        const songIndex = songsListDOM.findIndex(s => s.classList.contains('currently-playing'));
                        const newPlayingIndex = songsListDOM.findIndex(s => 
                            s.dataset.uri === stateTrack.uri || 
                            (stateTrack.linked_from.uri && s.dataset.uri === stateTrack.linked_from.uri)
                        );
                        console.log(newPlayingIndex, stateTrack)
                        if (songIndex > -1) {
                            songsListDOM[songIndex].classList.remove('currently-playing');
                            songsListDOM[songIndex].children[0].remove();
                        }
                        if (newPlayingIndex > -1) {
                            const speakerIcon = document.createElement('i');
                            speakerIcon.classList.add('fas');
                            speakerIcon.classList.add('fa-volume-up');

                            songsListDOM[newPlayingIndex].appendChild(speakerIcon);
                            songsListDOM[newPlayingIndex].classList.add('currently-playing');
                        }
                    }
                })

                const songNumber = document.getElementById('song-number');
                if (songNumber) {
                    drawNowPlayingMenu({ track_window: { current_track: stateTrack }});
                    drawNowPlayingScrub({ duration, position });

                    // set the track counter
                    getCurrentlyPlaying(token).then(c => {
                        getAlbumById(c.item.album.id, token).then(a => {
                            const trackIndex = a.tracks.items.findIndex((t) => {
                                return t.uri === current_track.uri || 
                                (current_track.linked_from.uri && t.uri === current_track.linked_from.uri)});
                            songNumber.innerHTML = `${trackIndex + 1} of ${a.tracks.items.length}`;
                        })
                    });

                    
                }
                drawTheBlobs({ track_window: { current_track }});
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

        document.addEventListener('show_now_playing', () => {
            const scrub = document.getElementById('scrub');
            scrub.addEventListener("mousedown", (e) => mouseDownScrub(e, scrub));
            scrub.addEventListener("mouseup", (e) => mouseUpScrub(e));
            scrub.addEventListener("mouseleave", (e) => mouseUpScrub(e));
            scrub.addEventListener("mousemove", (e) => scrubSong(e, scrub));
            
            
            // we need click listeners
            console.log('creating now playing events');
            document.getElementById('album').onclick = (e) => {
                console.log(e.target.dataset.uri);
                document.dispatchEvent(new CustomEvent('go_to_item', { 
                    detail : { 
                        album: e.target.dataset.uri, 
                        heading: e.target.textContent
                    }
                }));
            };

            document.getElementById('artist').onclick = (e) => {
                console.log(e.target.textContent);
                document.dispatchEvent(new CustomEvent('go_to_item', { 
                    detail : { 
                        artist: e.target.textContent, 
                        heading: e.target.textContent
                    }
                }));
            };

            document.getElementById('song-title').onclick = (e) => {
                console.log(e.target.textContent);
                document.dispatchEvent(new CustomEvent('show_lyrics'));
            };
            
            // draw elements
            player.getCurrentState().then(playState => {
                drawNowPlayingMenu(playState);
                drawNowPlayingScrub(playState);
            });
        });
    
        // toggle player
        document.getElementById('playButton').onclick = function() {
            player.togglePlay();
        };

        // draw the now playing menu based on current playstate 
        const drawNowPlayingMenu = (playState) => {
            const currentPlaying = playState.track_window.current_track;
            document.getElementById('song-title').innerHTML = currentPlaying.name;
            document.getElementById('artist').innerHTML = currentPlaying.artists[0].name;
            document.getElementById('album').innerHTML = currentPlaying.album.name;
            
            const songNumber = document.getElementById('song-number');
            getCurrentlyPlaying(token).then(c => {
                document.getElementById('album').dataset.uri = c.item.album.uri;
                getAlbumById(c.item.album.id, token).then(a => {
                    const trackIndex = a.tracks.items.findIndex((t) => {
                        return t.uri === currentPlaying.uri || 
                        (currentPlaying.linked_from.uri && t.uri === currentPlaying.linked_from.uri)}) + 1;
                    songNumber.innerHTML = `${trackIndex} of ${a.tracks.items.length}`;
                })
            });
        };

        // draw the scrub based on current playstate
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

        // create the palette and change the background
        const drawTheBlobs = (playState) => {
            const imageURL = playState.track_window.current_track.album.images[0].url;
            // get the palette

            document.getElementById('album-art').style.opacity = '1';
            createPalette(imageURL, 10, 16).then(r => { 
                console.log(r);
                document.getElementById('album-art').src = imageURL;

                // our bg is first in the list
                const bgColor = r[0];

                // get the contrasting color for my name
                const luminanceVal = (bgColor[0] * 0.2126 + bgColor[1] * 0.7152 + bgColor[1] * 0.0722) / 255;
                document.getElementById('my-name').style.color = 
                    `hsl(0, 0%, calc((${luminanceVal} - ${.5}) * -10000000%))`;
                document.body.style.background = `rgb(${bgColor[0]},${bgColor[1]},${bgColor[2]})`;

                // handle single color palettes
                if (r.length === 1) {
                    r = [r[0],r[0]];
                }

                // for each of the blobs pull a random color
                blobs.forEach(b => {
                    const randomColor = r[getRandomInt(1,r.length)];
                    //console.log(randomColor);
                    b.style.background = `rgb(${randomColor[0]},${randomColor[1]},${randomColor[2]})`;
                })                
            });
        }

        // get the state every second to update the players scrub bar
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
