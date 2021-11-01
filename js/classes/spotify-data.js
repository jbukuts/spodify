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

    getAblums() {
        return this.allData 
            .map(i => i.album.name)
            .sort((a, b) => (`${a.toLowerCase()}`.localeCompare(b.toLowerCase())))
            .map(a => `<p class="menu-item album-item">${a}</p>`);
    }

    getSongs() {
        console.log(this.allData);
        return this.allData
            .reduce((acc, curr) => { return acc.concat(curr.album.tracks.items)}, [])
            .sort((a, b) => (`${a.name}`.localeCompare(b.name)))
            .map(s => `<p id="${s.uri}" class="song-item">${s.name}</p>`);
    }

    getArtists() {
        return [...new Set(this.allData
            .map(i => i.album.artists[0].name))]
            .sort()
            .map(a => `<p class="menu-item artist-item">${a}</p>`);
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