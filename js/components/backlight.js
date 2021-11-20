
const root = document.documentElement;

document.getElementById('backlight').onclick = (e) => {
    const currentColor = getComputedStyle(root).getPropertyValue('--backlight');
    console.log(currentColor);
    root.style.setProperty('--backlight', currentColor === 'white' ? 'clear' : 'white');
};