import { getRandomInt } from './helper.js';

let last = 0;
let changeSpeed = 1500;
let rAF;
const blobs = [...document.getElementsByClassName("blob")];
const min = 0;
const max = 1000000;

function render(now) {
    if (!last || now - last >= changeSpeed) {
      last = now;
      blobs.forEach(blob => {
        blob.style.borderTopLeftRadius = `${getRandomInt(min, max)}px ${getRandomInt(min, max)}px`;
        blob.style.borderTopRightRadius = `${getRandomInt(min, max)}px ${getRandomInt(min, max)}px`;
        blob.style.borderBottomLeftRadius = `${getRandomInt(min, max)}px ${getRandomInt(min, max)}px`;
        blob.style.borderBottomRightRadius = `${getRandomInt(min, max)}px ${getRandomInt(min, max)}px`;
      });
    }
    rAF = requestAnimationFrame(render);
}

render(last);