// Canvas
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
ctx.imageSmoothingEnabled = false;
// Other specifications here
// Node js filesystem
const fs = require('fs');
// Path required for some things...
const path = require('path');
// Dialog, for file explorer, .remote at the end if not in main
const { ipcRenderer } = require('electron');
// Loaded filepath
let filePath;
// Actual loaded image
let loadedImage;
// Some document stuff to store

interface ElectronFile extends File {
  path: string
}

const pixelationOptions = {
  'slider container': document.getElementById('sliderContainer')!, // 0
  'pixelation slider': document.getElementById('pixelationSlider') as HTMLInputElement, // 1
  'box': document.getElementById('box')!, // 2
  'crop': document.getElementById('cropCheck') as HTMLInputElement, // 3
  'resolution input': document.getElementById('resInput') as HTMLInputElement, // 4
};

let pixelation;
let cropped;
let useCustomResolution = false;
let outWidth;
let outHeight;
let algo = 'avg';

// Function that takes in the dimensions of two images as parameters,
// scales one to the other by using aspect ratios,
// then returns the dimensions of the scaled image along with dx dy
// values needed to center that image
function getResizedDimensions(ufwidth, ufheight, fwidth, fheight) {
  let dwidth;
  let dheight;
  let scale;
  // To figure out which way we scale the image, we need to compare the two aspect ratios
  const ufratio = ufwidth / ufheight;
  const fratio = fwidth / fheight;
  // If height of unfitted is greater than height of unfitted
  if (fratio < ufratio) {
    // If width of fitted is greater than width of unfitted
    // Scale width of unfitted
    dwidth = fwidth;
    // Figure out scale of which we have increased ufwidth by
    scale = fwidth / ufwidth;
    // Multiply ufheight to account
    dheight = ufheight * scale;
  } else {
    // Scale ufheight of image
    dheight = fheight;
    // Figure out scale of which we have inreased ufheight by
    scale = fheight / ufheight;
    // Apply that to ufwidth as well
    dwidth = ufwidth * scale;
  }
  // Find the offset dx and dy needed to center image
  const dx = (fwidth - dwidth) / 2;
  const dy = (fheight - dheight) / 2;

  return [dwidth, dheight, dx, dy];
}

// Scrapped in favor of css implementation!
// function renderImage() {
//   if (loadedImage === undefined) {
//     return;
//   }
//   let resultImageWidth;
//   let resultImageHeight;
//   let scale;
//   // To figure out which way we scale the image, we need to compare the two aspect ratios
//   const canvasRatio = width / height;
//   const imageRatio = loadedImage.naturalWidth / loadedImage.naturalHeight;
//   // If height of canvas is greater than height of image
//   if (canvasRatio < imageRatio) {
//     // If width of canvas is greater than width of image
//     // Scale width of image
//     resultImageWidth = width;
//     // Figure out scale
//     scale = width / loadedImage.naturalWidth;
//     // Multiply height to account
//     resultImageHeight = loadedImage.naturalHeight * scale;
//   } else {
//     // Scale height of image
//     resultImageHeight = height;
//     // Figure out scale
//     scale = height / loadedImage.naturalHeight;
//     // Multiply width to account
//     resultImageWidth = loadedImage.naturalWidth * scale;
//   }
//   // Find the offset dx and dy needed to center image
//   const dx = (width - resultImageWidth) / 2;
//   const dy = (height - resultImageHeight) / 2;
//   ctx.drawImage(loadedImage, dx, dy, resultImageWidth, resultImageHeight);
// }
// function render() {
//   // Clear canvas
//   ctx.clearRect(0, 0, width, height);
//   // Render current loaded image in canvas
//   renderImage();
// }

// function resizeCanvas() {
//   const con = document.getElementById('container');
//   canvas.width = con.offsetWidth;
//   width = canvas.width;
//   canvas.height = con.offsetHeight;
//   height = canvas.height;
// }

function roundTo(num, place) {
  let temp = num * place;
  temp = Math.round(temp) / place;
  return temp;
}

// Resize canvas function
function resizeCanvas(someWidth, someHeight) {
  if (canvas.width === someWidth && canvas.height === someHeight) {
    return;
  }
  canvas.width = someWidth;
  canvas.height = someHeight;
}

// function getFileType(someFilePath) {
//   return path.basename(someFilePath[0]).split('.').pop();
// }

function updateFileInfo() {
  // Get actual file path as string

  // Get & set file name
  const ddName = path.basename(filePath);
  document.getElementById('dd_name')!.innerHTML = ddName;

  // Set path string
  document.getElementById('dd_path')!.innerHTML = filePath;

  // Image dimensions can be gathered from image
  document.getElementById(
    'dd_dimensions',
  )!.innerHTML = `${loadedImage.naturalWidth} x ${loadedImage.naturalHeight}`;

  // Size of file
  // `${fileSizeInMB} MB` is known as a 'template literal'. Template literals allow for
  // concatenating strings and increase readability!
  // They're really amazing, as long as you have `` along with ${}, you can embed
  // Pretty much anything in there tbh
  // Some definitions:
  // Template: preset format
  // Literal: value written as exactly as it's meant to be interpreted
  // Interpolation: The insertion of something of a different nature into something else
  const fileStats = fs.statSync(filePath);
  document.getElementById('dd_size')!.innerHTML = `${roundTo(
    fileStats.size / 1000000,
    100,
  )} MB`;

  // Type of file
  document.getElementById('dd_fileType')!.innerHTML = ddName.split('.').pop();

  // Time file was last modified
  document.getElementById('dd_lastModified')!.innerHTML = fileStats.mtime;
}

function exportImage(currentCanvas, saveFilePath) {
  // OK THIS TOOK 5 HOURS TO SEARCH BECAUSE I WAS TOO STUPID
  // TO JUST CONSOLE.LOG(IMG.TODATAURL('IMAGE/PNG')) AND REALIZE
  // THAT A PNG IMAGE IS JUST A BASE64 STRING AND THAT YOU
  // GOTTA REMOVE THE FILLER AND THEN YOU CAN USE IT AS DATA
  // HAHHAHAHAHAHAHAHAHAHHAh
  const data = currentCanvas
    .toDataURL('image/png')
    .replace('data:image/png;base64,', '');
  // console.log(unloadedImage.src);
  // console.log(data);
  // Apparently 'new Buffer' is deprecated
  const imageBuffer = Buffer.from(data, 'base64');
  fs.writeFileSync(saveFilePath, imageBuffer);
  // Write the darn file
  // const a = document.createElement('a');
  // a.href = canvas.toDataURL('image/jpg');
  // a.download = 'zerozerozero.jpg';
  // a.click();
}

function drawImageToCanvas() {
  // Set canvas size to, of course, match image size (entire
  // point of this conversion to images)
  canvas.height = loadedImage.naturalHeight;
  canvas.width = loadedImage.naturalWidth;
  switch (cropped) {
    case true: {
      const twidth = canvas.width;
      const theight = canvas.height;
      ctx.drawImage(
        loadedImage,
        0,
        0,
        twidth - (twidth % pixelation),
        theight - (theight % pixelation),
      );
      break;
    }
    case false: {
      ctx.drawImage(loadedImage, 0, 0);
      break;
    }
    default: {
      break;
    }
  }
}

// Here is the actual smart coding happening
function pixelateImage() {
  if (pixelation === 1) {
    return;
  }

  const width = loadedImage.naturalWidth;
  const height = loadedImage.naturalHeight;

  // Width of the final canvas
  let desiredWidth = width;
  let desiredHeight = height;

  // Get rgb data of every single pixel in the image, .data removes some other info
  const imgData = ctx.getImageData(0, 0, width, height);

  // Decide on which algorithm we are using
  switch (algo) {
    case 'top': {
      // If we're using the cropped algorithm
      // All we have to do is recognize the color of the topleft pixel
      switch (cropped) {
        case true: {
          const overflowX = width % pixelation;
          const overflowY = height % pixelation;
          desiredWidth = width - overflowX;
          desiredHeight = height - overflowY;
          // Target each corner of each "pixelation x pixelation"
          for (let y = 0; y < desiredHeight; y += pixelation) {
            for (let x = 0; x < desiredWidth; x += pixelation) {
              // Record the rgb values of the topleft pixel
              const tp = (y * width + x) * 4;
              const topR = imgData.data[tp];
              const topG = imgData.data[tp + 1];
              const topB = imgData.data[tp + 2];
              // Now loop through the sample area square and replace the
              // rgb values with the topleft pixel
              for (let sampleY = 0; sampleY < pixelation; sampleY += 1) {
                for (let sampleX = 0; sampleX < pixelation; sampleX += 1) {
                  // Now we're looking for the arrayLocation of each value of each pixel
                  const pixelX = x + sampleX;
                  const pixelY = y + sampleY;
                  const p = (pixelY * width + pixelX) * 4;
                  imgData.data[p] = topR;
                  imgData.data[p + 1] = topG;
                  imgData.data[p + 2] = topB;
                }
              }
            }
          }
          break;
        }
        case false: {
          // In the case of false all we have to do is account for the borders
          // very simple
          for (let y = 0; y < height; y += pixelation) {
            for (let x = 0; x < width; x += pixelation) {
              // Record the rgb values of the topleft pixel
              const tp = (y * width + x) * 4;
              const topR = imgData.data[tp];
              const topG = imgData.data[tp + 1];
              const topB = imgData.data[tp + 2];
              // Now loop through the sample area square and replace the
              // rgb values with the topleft pixel
              for (let sampleY = 0; sampleY < pixelation; sampleY += 1) {
                for (let sampleX = 0; sampleX < pixelation; sampleX += 1) {
                  // Now we're looking for the arrayLocation of each value of each pixel
                  const pixelX = x + sampleX;
                  const pixelY = y + sampleY;
                  // Here we just break off if we're out of bounds
                  if (pixelX >= width || pixelY >= height) {
                    break;
                  }
                  const p = (pixelY * width + pixelX) * 4;
                  imgData.data[p] = topR;
                  imgData.data[p + 1] = topG;
                  imgData.data[p + 2] = topB;
                }
              }
            }
          }
          break;
        }
        default: {
          break;
        }
      }
      break;
    }
    case 'avg': {
      // Decide on which algorithm we are using
      switch (cropped) {
        case true: {
          const pixelationArea = pixelation * pixelation;
          const overflowX = width % pixelation;
          const overflowY = height % pixelation;
          desiredWidth = width - overflowX;
          desiredHeight = height - overflowY;
          // Try to get the corners of each "pixelation x pixelation"
          for (let y = 0; y < desiredHeight; y += pixelation) {
            for (let x = 0; x < desiredWidth; x += pixelation) {
              // Let's define the average values that we'll use later
              let totalR = 0;
              let totalG = 0;
              let totalB = 0;
              const processedPixels: number[] = [];
              // Now we're looking for each pixel
              for (let sampleY = 0; sampleY < pixelation; sampleY += 1) {
                for (let sampleX = 0; sampleX < pixelation; sampleX += 1) {
                  // Now we're looking for the arrayLocation of each value of each pixel
                  const pixelX = x + sampleX;
                  const pixelY = y + sampleY;
                  // if (pixelX >= width || pixelY >= height) {
                  //   break;
                  // }
                  const p = (pixelY * width + pixelX) * 4;
                  totalR += imgData.data[p];
                  totalG += imgData.data[p + 1];
                  totalB += imgData.data[p + 2];
                  processedPixels.push(p);
                }
              }
              const averageR = totalR / pixelationArea;
              const averageG = totalG / pixelationArea;
              const averageB = totalB / pixelationArea;
              // console.log('the averages are', averageR, averageG, averageB);
              for (let i = 0; i < processedPixels.length; i += 1) {
                const p = processedPixels[i];
                imgData.data[p] = averageR;
                imgData.data[p + 1] = averageG;
                imgData.data[p + 2] = averageB;
              }
            }
          }
          break;
        }
        case false: {
          // Try to get the corners of each "pixelation x pixelation"
          for (let y = 0; y < height; y += pixelation) {
            for (let x = 0; x < width; x += pixelation) {
              // Let's define the average values that we'll use later
              let totalR = 0;
              let totalG = 0;
              let totalB = 0;
              const processedPixels: number[] = [];
              // Now we're looking for each pixel
              for (let sampleY = 0; sampleY < pixelation; sampleY += 1) {
                for (let sampleX = 0; sampleX < pixelation; sampleX += 1) {
                  // Now we're looking for the arrayLocation of each value of each pixel
                  const pixelX = x + sampleX;
                  const pixelY = y + sampleY;
                  if (pixelX >= width || pixelY >= height) {
                    break;
                  }
                  const p = (pixelY * width + pixelX) * 4;
                  totalR += imgData.data[p];
                  totalG += imgData.data[p + 1];
                  totalB += imgData.data[p + 2];
                  processedPixels.push(p);
                }
              }
              const l = processedPixels.length;
              const averageR = totalR / l;
              const averageG = totalG / l;
              const averageB = totalB / l;
              for (let i = 0; i < l; i += 1) {
                const p = processedPixels[i];
                imgData.data[p] = averageR;
                imgData.data[p + 1] = averageG;
                imgData.data[p + 2] = averageB;
              }
            }
          }
          break;
        }
        default: {
          break;
        }
      }
      break;
    }
    default: {
      break;
    }
  }
  resizeCanvas(desiredWidth, desiredHeight);
  ctx.putImageData(imgData, 0, 0);
}

// Traverse a [pixelation]x[pixelation] array of the entire [width]x[height]
// Average these values, draw a full rect in its place
// Takes in an image and returns the average color of the image
// as an rgb string.
function getAverageColor() {
  const width = loadedImage.naturalWidth;
  const height = loadedImage.naturalHeight;
  const imgData = ctx.getImageData(0, 0, width, height);
  const imgLen = imgData.data.length;

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  // Loop through every pixel
  for (let i = 0; i < imgLen; i += 4) {
    // Add the rgb values
    totalR += imgData.data[i];
    totalG += imgData.data[i + 1];
    totalB += imgData.data[i + 2];
  }

  const pixels = width * height;

  const averageR = totalR / pixels;
  const averageG = totalG / pixels;
  const averageB = totalB / pixels;

  const averageColor = `rgb(${averageR}, ${averageG}, ${averageB})`;
  return averageColor;
}

function loadDrawAndExportImage() {
  // 1. Create the canvas element (doing it globally for now)
  // canvas = document.createElement('mainPanel');
  // 2. Load the image in html to do other things with it!
  loadedImage = new Image();
  loadedImage.onload = function onloadImage() {
    // 2.5.5 We need to update the file info here
    // as we're literally removing the image right after
    updateFileInfo();
    // 2.5. Remove the previous pic!
    // document.getElementById('panelImage').remove();
    // 3. First we should draw the contents of the image
    // onto a canvas
    drawImageToCanvas();

    // 4. Modify the canvas as needed!
    pixelateImage();
  };
  loadedImage.src = filePath;
}
// When the user clicks on the save file button, open a dialog
// and save the current image
document.getElementById('largeButton')!.addEventListener('click', async () => {
  const options = {
    title: 'Save File',
    buttonLabel: 'Save File',
    filters: [
      {
        name: 'Portable Network Graphics',
        extensions: ['png'],
      },
    ],
    properties: ['showOverwriteConfirm', 'createDirectory'],
  };
  // Change filters accordingly
  // (Kinda useless cause we know we're gonna use PNG for pixel art)
  /*
  switch (getFileType(filePath)) {
    case 'png':
      options.filters = [
        {
          name: 'Portable Network Graphics',
          extensions: ['png'],
        },
      ];
      break;
    case 'jpg':
      options.filters = [
        {
          name: 'Joint Photographic Group',
          extensions: ['jpg'],
        },
      ];
      break;
    case 'jpeg':
      options.filters = [
        {
          name: 'Joint Photographic Experts Group',
          extensions: ['jpeg'],
        },
      ];
      break;
    default:
      console.log('Sorry, a program error occured');
      return;
  }
  */

  // Retrieve the file path to save something to
  const saveFilePath = await ipcRenderer.invoke("showSaveDialogSync", options);
  
  // If a valid file path was actually named
  if (saveFilePath !== undefined) {
    // If the desired resolution is not default, we'll have to draw a new canvas and resize it
    if (useCustomResolution) {
      // First make sure that the output canvas size is good
      const tcanvas = document.createElement('canvas') as HTMLCanvasElement;
      const tctx = tcanvas.getContext('2d') as CanvasRenderingContext2D;
      tcanvas.width = outWidth;
      tcanvas.height = outHeight;
      // Now we can draw the dominant color as the background

      tctx.beginPath();
      tctx.fillStyle = `${getAverageColor()}`;
      tctx.fillRect(0, 0, outWidth, outHeight);
      tctx.closePath();

      const [dwidth, dheight, dx, dy] = getResizedDimensions(
        canvas.width,
        canvas.height,
        tcanvas.width,
        tcanvas.height,
      );
      tctx.drawImage(
        canvas,
        0,
        0,
        canvas.width,
        canvas.height,
        dx,
        dy,
        dwidth,
        dheight,
      );
      exportImage(tcanvas, saveFilePath);
    } else {
      exportImage(canvas, saveFilePath);
    }
  }
});

// When the user clicks on the load file button, open a dialog
// and load the image
document.getElementById('smallButton')!.addEventListener(
  'click',
  async () => {
    // Options that can configure the file explorer window
    // The "let" keyword makes it so that the variable has a limited scope and expires
    const options = {
      // Changes the label on the title bar
      title: 'Load File',

      // The default file explorer path that is opened, kinda bugged but watev
      // defaultPath: "~/Desktop",

      // The final open file button in the file explorer
      buttonLabel: 'Open File',

      // Filters file types!
      filters: [{ name: 'Images', extensions: ['jpeg', 'jpg', 'png'] }],

      // Other "features" of the dialog, some that seem useful are
      // "openFile", which allows files to be selected,
      // "openDirectory", which allows for directories to be selected,
      // "multiSelections", which allows for multiple paths to be selected,
      // "showHiddenFiles", which shows hidden files during selection
      // More can be found at "https://www.electronjs.org/docs/api/dialog#dialogshowopendialogbrowserwindow-options"
      properties: ['openFile'],
    };
    // Show window popup dialog
    // Retreve string of file, that is a image file type
    const tFilePath = await ipcRenderer.invoke("showOpenDialogSync", options);

    // If a file was actually retrieved
    if (tFilePath !== undefined) {
      [filePath] = tFilePath;
      // Load the image onto the window (so that it can be loaded
      // Onto the canvas)
      // Draw it on an invisible canvas (so that the pixels on the
      // canvas can be manipulated)
      // Export the image to the html (making sure to resize the
      // image appropriately on resize!)
      loadDrawAndExportImage();
    }
    // finally, you can also add a browserWindow as a parameter to showOpenDialog()
    // which attaches to a parent window and makes it modal
    // Basically, think of a custom file explorer (i think)
    // You would have to define a window earlier tho, like so:
    // WIN = new BrowserWindow({width: 800, height: 600})
    // And the browserWindow has a lot of options

    // A lot of code / explanation was learned from this helpful article: "https://www.brainbell.com/javascript/show-open-dgialog.html"
  },
  false,
);
// False at the end, something about events only called on bubbling up case... false by default idk
function updateSliderSize() {
  pixelationOptions['pixelation slider'].style.width = `${pixelationOptions['slider container'].offsetHeight * 0.8}`;
}

window.addEventListener('resize', () => {
  updateSliderSize();
});

pixelationOptions['pixelation slider'].addEventListener('input', function updatePixelation() {
  pixelation = Number(this.value);
  this.style.background = `linear-gradient(to right, #ffd966 0%, #ffd966 ${pixelation}%, #fff ${pixelation}%, white 100%)`;
  pixelationOptions['box'].innerHTML = pixelation;
  justExportImage();
});

function justExportImage() {
  if (filePath === undefined) {
    return;
  }
  // 3. First we should draw the contents of the image
  // onto a canvas
  drawImageToCanvas();
  // 4. Modify the canvas as needed!
  pixelateImage();
}

// Adding an event triggered when value of slider is changed
pixelationOptions['pixelation slider'].addEventListener('change', () => {
  // justExportImage();
});

// Adding an event triggered when the value of checkbox is changed
pixelationOptions['crop'].addEventListener('change', function updateCropped() {
  cropped = this.checked;
  justExportImage();
});

// Takes a 'resolution' string, returns the width and height of the string
// or undefined if the string is invalid
function parseResolution(resString) {
  if (/^\d+[xX]\d+$/.test(resString)) {
    const t = resString.split(/[xX]/);
    if (Number(t[0]) > 0 && Number(t[1]) > 0) {
      return t;
    }
  }
  return undefined;
}

// Validate if we can use the custom resolution on resolution input
pixelationOptions['resolution input'].addEventListener('input', function updateResUse() {
  const res = parseResolution(this.value);
  if (res === undefined) {
    useCustomResolution = false;
    // this.style.backgroundColor = '#f4cccc';
    this.style.color = '#cc0000';
  } else {
    useCustomResolution = true;
    this.style.backgroundColor = 'white';
    this.style.color = '#2b2b2b';
    [outWidth, outHeight] = res;
  }
});

// Updates the value of algo to match that of the selected radio
// option and redraws the image based off of that
function updateAlgo(radio) {
  algo = radio.value;
  justExportImage();
}

// Action listeners to buttons. Apparently you can't define
// a function inside a for loop that references variables
// of a greater scope because of some weird events happening...
// so I defined update algo in another function and used an
// arrow function to call to it since that's how you can pass
// parameters in
const radios = document.forms['algoForm'].elements.algo;
for (let z = 0; z < radios.length; z += 1) {
  radios[z].addEventListener('change', () => updateAlgo(radios[z]));
}

document.getElementById('loadFile')!.addEventListener('drop', (event: DragEvent) => {
  // Required to override default browser behavior on file drop
  // (i.e.) open new tab
  event.preventDefault();
  event.stopPropagation();

  // Regex matching our accepted extensions
  const acceptedExtensions = /image\/(jpg|jpeg|png)/i;
  // Loop through the file paths of all files added
  const files = event.dataTransfer!.files;
  for (let i = 0; i < files.length; i++) {
    document.getElementById('loadFile')!.style.borderColor = '#434343';
    // Test if the file extension matches
    if (acceptedExtensions.test(files[i].type)) {
      // If we're dropping a different file from the image we already have
      if (filePath !== ((files[i] as ElectronFile).path)) {
        // Update file path
        filePath = (files[i] as ElectronFile).path;
        // Export it!
        loadDrawAndExportImage();
        break;
      }
    }
  }
});

const loadFile = document.getElementById('loadFile')!;
loadFile.addEventListener('dragover', (event) => {
  // Required to actually process a drop
  event.preventDefault();
  event.stopPropagation();
});
loadFile.addEventListener('dragenter', () => {
  loadFile.style.borderColor = '#0071e3';
});
loadFile.addEventListener('dragleave', () => {
 loadFile.style.borderColor = '#434343';
});

function init() {
  // Set slider size to be proportional to window
  updateSliderSize();
  // Initialize value of slider to be 1 and set everything equal to it
  pixelation = 1;
  pixelationOptions['pixelation slider'].value = pixelation;
  pixelationOptions['box'].innerHTML = pixelation;
  // Initialize value of checkbox
  cropped = pixelationOptions['crop'].checked;
}

init();
