import { SEARCH_BOX } from '../templates.js';

export class SpotifyData {

    constructor(spotifyApiRes, accessToken) {
        this.allData = spotifyApiRes;
        this.accessToken = accessToken;
    }

    setAllData(data) {
        this.allData = data;
    }

    setAccessToken(accessToken) {
        this.accessToken = accessToken;
    }

    getAllData() {
        return this.allData;
    }

    getAblums() {
        const albumData = this.allData 
            .map(i => i.album.name)
            .sort((a, b) => (`${a.toLowerCase()}`.localeCompare(b.toLowerCase())))
            .map(a => `<p class="menu-item album-item">${a}</p>`);
        albumData.unshift(SEARCH_BOX);
        return albumData;
    }

    getSongs() {
        console.log(this.allData);
        const songData = this.allData
            .reduce((acc, curr) => { return acc.concat(curr.album.tracks.items)}, [])
            .sort((a, b) => (`${a.name}`.localeCompare(b.name)))
            .map(s => `<p id="${s.uri}" class="song-item">${s.name}</p>`);
        songData.unshift(SEARCH_BOX);
        return songData;
    }

    getArtists() {
        const artistData = [...new Set(this.allData
            .map(i => i.album.artists[0].name))]
            .sort((a, b) => (`${a.toLowerCase()}`.localeCompare(b.toLowerCase())))
            .map(a => `<p class="menu-item artist-item">${a}</p>`);
        artistData.unshift(SEARCH_BOX);
        return artistData;
    }

    getAccessToken() {
        return this.accessToken;
    }

    getAlbumsForArtist(artistName) {
        return this.allData
            .filter(x => x.album.artists[0].name === artistName)
            .sort((a, b) => (`${a.album.name}`.localeCompare(b.album.name)))
            .map(a => `<p class="menu-item album-item">${a.album.name}</p>`);
    }

    getTracksForAlbum(albumName) {
        return this.allData
            .filter(x => x.album.name === albumName)[0].album.tracks.items
            .map(s => `<p id="${s.uri}" class="song-item">${s.name}</p>`);
    }
}