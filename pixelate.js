// let width;
// let height;
// Canvas
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
// Other specifications here
// Node js filesystem
const fs = require('fs');
// Path required for some things...
const path = require('path');
const { contextBridge } = require('electron');
// Dialog, for file explorer, .remote at the end if not in main
const { dialog } = require('electron').remote;
// Loaded filepath
let filePath;
// Actual loaded image
let loadedImage;
// Actual modified verson of said loaded image
let unloadedImage;
// Some document stuff to store
// 0 container, 1 slider, 2 box
const sliderElements = [
  document.getElementById('sliderContainer'),
  document.getElementById('pixelationSlider'),
  document.getElementById('box'),
];
let pixelation = 17;

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

// function getFileType(someFilePath) {
//   return path.basename(someFilePath[0]).split('.').pop();
// }

function updateFileInfo() {
  // Get actual file path as string
  const fileName = filePath[0];

  // Get & set file name
  const ddName = path.basename(fileName);
  document.getElementById('dd_name').innerHTML = ddName;

  // Set path string
  document.getElementById('dd_path').innerHTML = fileName;

  // Image dimensions can be gathered from image
  const ddDimensions = `${loadedImage.naturalWidth} x ${loadedImage.naturalHeight}`;
  document.getElementById('dd_dimensions').innerHTML = ddDimensions;

  // Size of file
  const fileStats = fs.statSync(fileName);
  const fileSizeInMB = roundTo(fileStats.size / 1000000, 100);
  // `${fileSizeInMB} MB` is known as a 'template literal'. Template literals allow for
  // concatenating strings and increase readability!
  // They're really amazing, as long as you have `` along with ${}, you can embed
  // Pretty much anything in there tbh
  // Some definitions:
  // Template: preset format
  // Literal: value written as exactly as it's meant to be interpreted
  // Interpolation: The insertion of something of a different nature into something else
  document.getElementById('dd_size').innerHTML = `${fileSizeInMB} MB`;

  // Type of file
  document.getElementById('dd_fileType').innerHTML = ddName.split('.').pop();

  // Time file was last modified
  document.getElementById('dd_lastModified').innerHTML = fileStats.mtime;
}

// Takes the canvas and turns it into an image
function exportImage() {
  unloadedImage = new Image();
  unloadedImage.onload = function onDisplayImage() {
    // Now we need to resize this image to fit the container???
    // resizeImage();
    unloadedImage.setAttribute('id', 'panelImage');
    // 2.5. Remove the previous pic!
    document.getElementById('panelImage').remove();
    // Add it to the darn docccc!!!
    document.getElementById('container').appendChild(unloadedImage);
  };
  // Match output source to image
  // let fileType;
  // switch (getFileType(filePath)) {
  //   case 'png':
  //     fileType = 'png';
  //     break;
  //   case 'jpg':
  //     fileType = 'jpg';
  //     break;
  //   case 'jpeg':
  //     fileType = 'jpeg';
  //     break;
  //   default:
  //     console.log('Sorry, a program error occured');
  //     return;
  // }
  // --Export to image file!~
  // unloadedImage.src = canvas.toDataURL(`image/${fileType}`);

  // Since we are pixelating the file, a png makes 1000 times
  // more sense lol
  unloadedImage.src = canvas.toDataURL('image/png');
}

function drawImageToCanvas() {
  // Set canvas size to, of course, match image size (entire
  // point of this conversion to images)
  canvas.height = loadedImage.naturalHeight;
  canvas.width = loadedImage.naturalWidth;
  ctx.drawImage(loadedImage, 0, 0);
}

// Here is the actual smart coding happening
function pixelateImage() {
  const width = loadedImage.naturalWidth;
  const height = loadedImage.naturalHeight;

  // Get rgb data of every single pixel in the image, .data removes some other info
  const imgData = ctx.getImageData(0, 0, width, height);

  const pixelationArea = pixelation * pixelation;
  const pMax = height * width * 4;

  // IMPORTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANT
  // const actualTotalPixels = width * height;
  // let totalPixels = 0;

  // Try to get the corners of each "pixelation x pixelation"
  for (let y = 0; y < height; y += pixelation) {
    for (let x = 0; x < width; x += pixelation) {
      // Let's define the average values that we'll use later
      let totalR = 0;
      let totalG = 0;
      let totalB = 0;
      // Now we're looking for each pixel
      for (let sampleY = 0; sampleY < pixelation; sampleY += 1) {
        for (let sampleX = 0; sampleX < pixelation; sampleX += 1) {
          // Now we're looking for the arrayLocation of each value of each pixel
          const pixelX = x + sampleX;
          const pixelY = y + sampleY;
          const p = (pixelY * width + pixelX) * 4;
          if (p >= pMax) {
            break;
          }
          totalR += imgData.data[p];
          totalG += imgData.data[p + 1];
          totalB += imgData.data[p + 2];
        }
      }
      const averageR = totalR / pixelationArea;
      const averageG = totalG / pixelationArea;
      const averageB = totalB / pixelationArea;
      // console.log('the averages are', averageR, averageG, averageB);
      for (let sampleY = 0; sampleY < pixelation; sampleY += 1) {
        for (let sampleX = 0; sampleX < pixelation; sampleX += 1) {
          // Now we're looking for the arrayLocation of each value of each pixel
          const pixelX = x + sampleX;
          const pixelY = y + sampleY;
          const p = (pixelY * width + pixelX) * 4;
          if (p >= pMax) {
            break;
          }
          imgData.data[p] = averageR;
          imgData.data[p + 1] = averageG;
          imgData.data[p + 2] = averageB;
        }
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);
  // Traverse a [pixelation]x[pixelation] array of the entire [width]x[height]
  // Average these values, draw a full rect in its place
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
    // 5. Export the image from the canvas!
    exportImage();
  };
  loadedImage.src = filePath;
}
// When the user clicks on the save file button, open a dialog
// and save the current image
document.getElementById('largeButton').addEventListener('click', () => {
  if (unloadedImage === undefined) {
    return;
  }
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
  const saveFilePath = dialog.showSaveDialogSync(options);
  // If a valid file path was actually named
  if (saveFilePath !== undefined) {
    // OK THIS TOOK 5 HOURS TO SEARCH BECAUSE I WAS TOO STUPID
    // TO JUST CONSOLE.LOG(IMG.TODATAURL('IMAGE/PNG')) AND REALIZE
    // THAT A PNG IMAGE IS JUST A BASE64 STRING AND THAT YOU
    // GOTTA REMOVE THE FILLER AND THEN YOU CAN USE IT AS DATA
    // HAHHAHAHAHAHAHAHAHAHHAh
    const data = unloadedImage.src.replace('data:image/png;base64,', '');
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
});

// When the user clicks on the load file button, open a dialog
// and load the image
document.getElementById('smallButton').addEventListener(
  'click',
  () => {
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
    filePath = dialog.showOpenDialogSync(options);

    // If a file was actually retrieved
    if (filePath !== undefined) {
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

    // A lot of code / explanation was learned from this helpful article: "https://www.brainbell.com/javascript/show-open-dialog.html"
  },
  false,
);
// False at the end, something about events only called on bubbling up case... false by default idk
function updateSlider() {
  sliderElements[1].style.width = sliderElements[0].offsetHeight * 0.8;
}

window.addEventListener('resize', () => {
  updateSlider();
});

sliderElements[1].addEventListener('input', function updateValue() {
  pixelation = Number(this.value);
  this.style.background = `linear-gradient(to right, #ffd966 0%, #ffd966 ${pixelation}%, #fff ${pixelation}%, white 100%)`;
  sliderElements[2].innerHTML = pixelation;
});

sliderElements[1].addEventListener('change', () => {
  if (filePath === undefined) {
    return;
  }
  // 3. First we should draw the contents of the image
  // onto a canvas
  drawImageToCanvas();
  // 4. Modify the canvas as needed!
  pixelateImage();
  // 5. Export the image from the canvas!
  exportImage();
});

function init() {
  updateSlider();
}

init();
