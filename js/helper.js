
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