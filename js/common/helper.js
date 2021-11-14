
// create page from array of strings
export function createPageFromArray(objArr) {
    let div = document.createElement("div")
    div.classList.add('lines');
    div.innerHTML = objArr.reduce((p,c) => p + c, '');
    return div;
}

export function createGradient(rgbArr) {
    const stringColors = rgbArr.map(c => {
        return `rgba(${c.reduce((acc,curr) => `${acc}${curr},`, '')} 1)`
    });
    return `linear-gradient(270deg ${stringColors.reduce((acc,curr) => `${acc},${curr}`, '')})`;
}

//The maximum is exclusive and the minimum is inclusive
export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

export function createTimeString(duration, currentTime) {

    // current time
    const curMin = Math.floor(currentTime / 60);
    const curSec = Math.floor(currentTime - curMin * 60);
    const currStr = `${curMin}:${String(curSec).padStart(2,'0')}`;

    // time left
    const lefMin = Math.floor((duration - currentTime) / 60);
    const lefSec = Math.floor((duration - currentTime) - lefMin * 60);
    const lefStr = `-${lefMin}:${String(lefSec).padStart(2,'0')}`;

    return `${currStr} ${lefStr}`;
}


export function createHTMLFromInput(data, classNames) {
    return data.map(s => `<p data-uri="${s.uri}" class="${classNames.reduce((a,c) => `${a} ${c}`, '')}">${s.name}</p>`);
}