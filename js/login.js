// log the user in and get their  access token
function login(callback) {
    var CLIENT_ID = '0981792b5bc94457a102687309d0beb6';
    var REDIRECT_URI = 'https://jbukuts.com/spodify/proxy.html';

    var url = getLoginURL([
        'user-read-email',
        'user-library-read',
        'streaming',
        'user-read-private',
        'user-modify-playback-state',
        'user-read-currently-playing',
        'user-read-playback-state'
    ], REDIRECT_URI, CLIENT_ID);
    
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


function getLoginURL(scopes, redirectURL, clientId) {
    return 'https://accounts.spotify.com/authorize?client_id=' + CLIENT_ID +
      '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
      '&scope=' + encodeURIComponent(scopes.join(' ')) +
      '&response_type=token';
}
