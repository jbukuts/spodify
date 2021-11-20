Number.prototype.between = function(a, b) {
    var min = Math.min.apply(Math, [a, b]),
      max = Math.max.apply(Math, [a, b]);
    return this > min && this < max;
};

var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');

// creates a color palette from the input url
export function createPalette(imgURL, size = 10, downScaleAmount = 0) {
    return new Promise(resolve => {
        var img = new Image;
        img.onload = function(){
            // set the image to the canvas
            canvas.height = img.height;
            canvas.width = img.width;
            ctx.drawImage(img,0,0);
            //document.body.append(canvas);

            // get pixel data from the image
            var pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data
                .filter((_e, i) => (i+1) % 4 !== 0);
            
            // arrange into a proper array of rgb vals
            const rgbData = [];
            for (var i =0; i<pixelData.length; i+=3) {
                rgbData.push(pixelData.slice(i,i+3));         
            }

            const scaledRGB = downScaleAmount !== 0 ? 
                downscaleRGBVals(rgbData, canvas.width, downScaleAmount) : 
                rgbData;
            
            //const imgData = new ImageData(createImageData(scaledRGB), img.width / downScaleAmount);
            //ctx.putImageData(imgData, 0, 0);
            
            // bin the array in a 3 x 3 x 3 map
            let binArray = [];
            for (var a = 0; a < 255; a+= 85) {
                for (var b = 0; b < 255; b+= 85) {
                    for (var c = 0; c < 255; c+= 85) {
                        const aDelta = a+85;
                        const bDetla = b+85;
                        const cDelta = c+85;

                        const bin = scaledRGB.filter((x,i) => 
                            x[0].between(a, aDelta) &&
                                x[1].between(b, bDetla) &&
                                x[2].between(c, cDelta)

                        );
                        binArray.push(bin);
                    }
                }
            }

            // sort the bins by most prevelant
            binArray.sort((a,b) => {
                return b.length - a.length
            });

            // splice the lower values
            binArray.splice(size, binArray.length - size);

            // average all values into a single one
            const simpled = binArray.map(x => {
                return sumRGBArray(x);
            });
            
            // finally resolve        
            resolve(simpled.filter(x => x[0])); 
        };
        img.crossOrigin = "Anonymous";
        img.src = imgURL;
    });
}

function downscaleRGBVals(rgbData, width, pixelSize = 4) {
    let scaled = [];
    for (var a=0; a < rgbData.length; a+=pixelSize*width) {
        for (var i=0; i< width; i+=pixelSize) {
            const p = rgbData
                .slice(i+a,i+a+pixelSize)
                .concat(rgbData.slice(i+a+width,i+a+width+pixelSize));
            scaled.push(sumRGBArray(p));
        }
    }
    console.log(scaled.length, rgbData.length / (pixelSize * pixelSize));
    return scaled;
}

function sumRGBArray(rgbData) {
    const single = rgbData.reduce((acc, curr) => {
        acc[0] = acc[0] + curr[0];
        acc[1] = acc[1] + curr[1];
        acc[2] = acc[2] + curr[2];
        return acc;
    }, [0,0,0]);
    return single.map(s => s/rgbData.length);
}