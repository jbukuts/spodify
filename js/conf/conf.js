const version = '0.3';
const redirectPath = '/proxy.html';
const apiHeaders = {
    "Content-Type": "application/json",
    "Accept": "application/json"
};

export const conf = {
    dev: {
        version,
        redirectPath,
        baseAPIURL: "https://api.spotify.com/v1",
        personAPIURL: "https://api.jbukuts.com/api",
        apiHeaders
    },
    prod: {
        version,
        redirectPath: "/proxy.html",
        baseAPIURL: "https://api.spotify.com/v1",
        personAPIURL: "https://api.jbukuts.com/api",
        apiHeaders
    }
};

export const spotifyPermissions = [
    "user-read-email",
    "user-library-read",
    "streaming",
    "user-read-private",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "user-read-playback-state",
    "user-read-recently-played"
];

export const env = 'dev';