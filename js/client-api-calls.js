import conf from './conf/conf.json' assert { type: "json" };

// changes the current player to the param passed
export async function changeSpotifyPlayerById(accessToken, deviceId) {

    const data = {
        device_ids: [deviceId]
    };

    await fetch(`${conf.baseAPIURL}/me/player`, {
        method: 'PUT',
        headers: {
            ...conf.apiHeaders,
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(data)
    });
}

// get all the user's albums from spotify
export async function getUsersAlbumsSpotify(accessToken) {
    var fullAlbumList = [];
    var offset = 0;
    var limit = 50;
    
    try {
        // we perform a loop while the length of the data
        do {
            // make the call and get the data
            const apiEndpoint = `${conf.baseAPIURL}/me/albums?limit=${limit}&offset=${offset}`;
            const res = await fetch(apiEndpoint, {
                method: 'GET',
                headers: {
                    ...conf.apiHeaders,
                    'Authorization': `Bearer ${accessToken}`
                }
            })
            .then(response => response.json());

            // if theres an undefined in the list we need to go again
            // for this offset :(
            if (!res.items.includes(undefined)) {
                fullAlbumList = fullAlbumList.concat(res.items);
                offset+= limit;
            }
        } while(fullAlbumList.length % limit === 0)
    } 
    catch(e) {
        console.error(e);
    }
    return fullAlbumList;
}

// gets the users profile data
export async function getProfileData(accessToken) {
    try {
        return fetch(`${conf.baseAPIURL}/me`, {
            method: 'GET',
            headers: {
                ...conf.apiHeaders,
                'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(response => response.json());
    }
    catch(e) {
        console.error('There was an issue getting users profile data', e);
    }
}

// get the album based on the id passed
export async function getAlbumById(albumId, accessToken) {
    try {
        return fetch(`${conf.baseAPIURL}/albums/${albumId}`, {
            method: 'GET',
            headers: {
                ...conf.apiHeaders,
                'Authorization': `Bearer ${accessToken}`
            }
        }).then(r => r.json());
    }
    catch(e) {
        console.log('Error getting album by Id', e);
    }
}

// gets the currently playing song for the user
export function getCurrentlyPlaying(accessToken) {
    try {
        return fetch(`${conf.baseAPIURL}/me/player/currently-playing`, {
            method: 'GET',
            headers: {
                ...conf.apiHeaders,
                'Authorization': `Bearer ${accessToken}`
            }
        }).then(r => r.json());
    }
    catch(e) {
        console.log('Error getting album by Id', e);
    }
}

// change the users shuffle setting
export async function setUsersPlaybackShuffle(accessToken, state) {
    try {
        return fetch(`${conf.baseAPIURL}/me/player/shuffle?state=${state}`, {
            method: 'PUT',
            headers: {
                ...conf.apiHeaders,
                'Authorization': `Bearer ${accessToken}`
            }
        });
    }
    catch(e) {
        console.error('Failed to set users shuffle', e);
    }    
}

// change the users repeat mode setting
export async function setUsersRepeatMode(accessToken, mode) {
    try {
        return fetch(`${conf.baseAPIURL}/me/player/repeat?state=${mode}`, {
            method: 'PUT',
            headers: {
                ...conf.apiHeaders,
                'Authorization': `Bearer ${accessToken}`
            }
        });
    }
    catch(e) {
        console.error('Failed to set users repeat mode', e);
    }    
}