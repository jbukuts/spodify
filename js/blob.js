let last = 0;
let changeSpeed = 1500;
let rAF;
const blobs = [...document.getElementsByClassName("blob")];


const random = () => {
    return Math.floor((Math.random() * 1000000));
};

console.log('BLOB TIME', blobs);
function render(now) {
    if (!last || now - last >= changeSpeed) {
      last = now;
      blobs.forEach(blob => {
        blob.style.borderTopLeftRadius = `${random()}px ${random()}px`;
        blob.style.borderTopRightRadius = `${random()}px ${random()}px`;
        blob.style.borderBottomLeftRadius = `${random()}px ${random()}px`;
        blob.style.borderBottomRightRadius = `${random()}px ${random()}px`;
      });
    }
    rAF = requestAnimationFrame(render);
}

render(last);