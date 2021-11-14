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

    getAlbums() {
        return this.allData 
            .map(i => {return { name: i.album.name, uri: i.album.uri }})
            .sort((a, b) => (`${a.name.toLowerCase()}`.localeCompare(b.name.toLowerCase())))
    }

    getSongs() {
        return this.allData
            .reduce((acc, curr) => { return acc.concat(curr.album.tracks.items)}, [])
            .sort((a, b) => (`${a.name}`.localeCompare(b.name)))
    }

    getArtists() {
        return this.allData
            .map(i => i.album.artists[0])
            .filter((artist, index, self) =>
                index === self.findIndex(t => (t.name === artist.name))
            )
            .sort((a, b) => (`${a.name.toLowerCase()}`.localeCompare(b.name.toLowerCase())));
    }

    getAccessToken() {
        return this.accessToken;
    }

    getAlbumsForArtist(artistName) {
        return this.allData
            .filter(x => x.album.artists[0].name === artistName)
            .sort((a, b) => (`${a.album.name}`.localeCompare(b.album.name)))
            .map(a => a.album);
    }

    getTracksForAlbum(albumURI) {
        return this.allData
            .filter(x => x.album.uri === albumURI)[0].album.tracks.items;    
    }

    findAlbumBySongID(songURI) {
        const { album: { uri }} = this.allData.find(album => {
            return album.album.tracks.items.find(track => track.uri === songURI);
        });
        return uri;
    }
}