let width;
let height;
// Canvas
const canvas = document.getElementById('mainPanel');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
// Other specifications here
// Node js filesystem
const fs = require('fs');
// Path required for some things...
const path = require('path');
// Dialog, for file explorer, .remote at the end if not in main
const { dialog } = require('electron').remote;
// Loaded filepath
let filePath;
// Actual loaded image
let loadedImage;

function renderImage() {
  if (loadedImage === undefined) {
    return;
  }
  let resultImageWidth;
  let resultImageHeight;
  let scale;
  // To figure out which way we scale the image, we need to compare the two aspect ratios
  const canvasRatio = width / height;
  const imageRatio = loadedImage.naturalWidth / loadedImage.naturalHeight;
  // If height of canvas is greater than height of image
  if (canvasRatio < imageRatio) {
    // If width of canvas is greater than width of image
    // Scale width of image
    resultImageWidth = width;
    // Figure out scale
    scale = width / loadedImage.naturalWidth;
    // Multiply height to account
    resultImageHeight = loadedImage.naturalHeight * scale;
  } else {
    // Scale height of image
    resultImageHeight = height;
    // Figure out scale
    scale = height / loadedImage.naturalHeight;
    // Multiply width to account
    resultImageWidth = loadedImage.naturalWidth * scale;
  }
  // Find the offset dx and dy needed to center image
  const dx = (width - resultImageWidth) / 2;
  const dy = (height - resultImageHeight) / 2;
  ctx.drawImage(loadedImage, dx, dy, resultImageWidth, resultImageHeight);
}
function render() {
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  // Render current loaded image in canvas
  renderImage();
}

function resizeCanvas() {
  const con = document.getElementById('container');
  canvas.width = con.offsetWidth;
  width = canvas.width;
  canvas.height = con.offsetHeight;
  height = canvas.height;
}

function roundTo(num, place) {
  let temp = num * place;
  temp = Math.round(temp) / place;
  return temp;
}

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

function loadImage() {
  if (filePath === undefined) {
    return;
  }
  // Creating the canvas element
  // canvas = document.createElement('mainPanel');
  // Load the html image (I wonder if you can also load it exclusively in javascript)
  loadedImage = new Image();
  loadedImage.onload = function onloadImage() {
    // We have to resize image size to canvas width or height
    render();
    // Display some information about the file
    updateFileInfo();
  };
  loadedImage.src = filePath;
}

function readFile() {
  // Our program must fulfill these steps:
  // 1. We must first be able to resize the image to a desired desktop resolution
  // 2. We then must pixelate it by a certain amount
  // 3. We then must be able to save the image
  // Because we are actually processing the image through pixelation, we can't
  // actually just directly show the image through html
  // Safer is to just draw the pixels of an image on canvas.
  // So, let's use a canvas?
}

// When the user clicks on the button...
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
      // Read the actual image (must account for jpg png diff????)
      readFile();
      // Update the loaded image
      loadImage();
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

function onResize() {
  resizeCanvas();
  render();
}

window.addEventListener('resize', onResize);

function init() {
  // The initial loading of the image into the canvas
  loadImage();
  // Resize the canvas to the desired width and height
  resizeCanvas();
  // Drars the image
  render();
}

init();
