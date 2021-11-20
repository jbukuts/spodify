

const albumArt = document.getElementById('album-art');
albumArt.onclick = () => {
    console.log('MOVE ALBUM!');
    document.getElementById('screen').style.pointerEvents = 'none';
    albumArt.style.top = "calc(50vh - 150px - 400px)";
    albumArt.style.pointerEvents = "none";
    if (albumArt.style.zIndex === "1") {
        new Promise(resolve => setTimeout(resolve, 250)).then(() => {
            albumArt.style.zIndex = "0";
            albumArt.style.top = "calc(50vh - 150px - 100px)";
            albumArt.style.pointerEvents = "all";
            document.getElementById('screen').style.opacity = '1';
            document.getElementById('screen').style.pointerEvents = 'all';
        });
    }
    else {
        new Promise(resolve => setTimeout(resolve, 250)).then(() => {
            albumArt.style.zIndex = "1";
            albumArt.style.top = "calc(50vh - 150px)";
            albumArt.style.pointerEvents = "all";
            document.getElementById('screen').style.opacity = '0';
        });
    }    
}