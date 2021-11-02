export async function testAPI(songTitle, artistName) {
    const token = 'zUPEJXXjV3Qs1JoiHZUATiyWkqHDbMbTh3llHDzlb5CjpOmKk2OetdlrXRtkS5sO';
    return fetch(`https://api.genius.com/search?access_token=${token}&q=${songTitle} ${artistName}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    }).then(r => r.json());
}

export async function testMusicMatch() {
    return fetch(`http://api.musixmatch.com/ws/1.1/track.lyrics.get?apikey=019e8ab04d8e50cb6c95126cbdc81922&track_id=15953433&`, {
        method: 'GET',
        mode: 'no-cors'
    });
}