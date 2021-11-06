export async function testAPI(songTitle, artistName) {
    const token = 'zUPEJXXjV3Qs1JoiHZUATiyWkqHDbMbTh3llHDzlb5CjpOmKk2OetdlrXRtkS5sO';
    return fetch(`https://api.genius.com/search?access_token=${token}&q=${songTitle} ${artistName}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    }).then(r => r.json());
}

export async function testReadingPage() {
    const link = 'https://genius.com/Jpegmafia-grimy-waifu-lyrics';
    $.get("middleman.php", {"site":"http://www.google.com"}, function(results){
        console.log(results); // middleman gives Google's HTML to jQuery
    });
}