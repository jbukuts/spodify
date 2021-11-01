
Number.prototype.between = function(a, b) {
    var min = Math.min.apply(Math, [a, b]),
      max = Math.max.apply(Math, [a, b]);
    return this > min && this < max;
};

var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');

export function getPalette(imageURL, paletteLength) {
    return new Promise(resolve => {
        var img = new Image;
        img.onload = function(){
            canvas.height = img.height;
            canvas.width = img.width;
            ctx.drawImage(img,0,0);

            // get pixels from image
            // this will be a list with no seperation
            // remove the opacity vals
            var pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data
                .filter((e, i) => (i+1) % 4 !== 0);
            
            // turn into array of rgb vals
            const rgbData = [];
            for (var i =0; i<pixelData.length; i+=3) {
                rgbData.push(pixelData.slice(i,i+3));         
            }

            // bin all vals into histogram
            // of 3 x 3 x 3 by rgb values
            let binArray = [];
            for (var a = 0; a < 255; a+= 85) {
                for (var b = 0; b < 255; b+= 85) {
                    for (var c = 0; c < 255; c+= 85) {
                        const aDelta = a+85;
                        const bDetla = b+85;
                        const cDelta = c+85;

                        const bin = rgbData.filter(x => {
                            return  x[0].between(a, aDelta) &&
                                x[1].between(b, bDetla) &&
                                x[2].between(c, cDelta)
                        });
                        binArray.push(bin);
                    }
                }
            }

            // sort the bins by their length descending
            binArray.sort((a,b) => {
                return b.length - a.length
            });

            // splice the lower values
            binArray.splice(10, binArray.length - 1);

            // average all values into a single one
            const simpled = binArray.map(x => {
                const single = x.reduce((acc, curr) => {
                    acc[0] = acc[0] + curr[0];
                    acc[1] = acc[1] + curr[1];
                    acc[2] = acc[2] + curr[2];
                    return acc;
                }, [0,0,0]);
                return single.map(s => s/x.length);
            });
            
            // finally resolve        
            resolve(simpled.filter(x => x[0])); 
        };
        img.crossOrigin = "Anonymous";
        img.src = imageURL;

    });
    


}









