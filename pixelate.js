let width;
let height;
// Canvas
const canvas = document.getElementById('mainPanel');
const ctx = canvas.getContext('2d');
// Other specifications here
// Node js filesystem
const fs = require('fs');
// Path required for some things...
const path = require('path');
// Dialog, for file explorer, .remote at the end if not in main
const { dialog } = require('electron').remote;

function resizeCanvas() {
  const con = document.getElementById('container');
  canvas.width = con.offsetWidth;
  width = canvas.width;
  canvas.height = con.offsetHeight;
  height = canvas.height;
  console.log(width);
  console.log(canvas.width);
  console.log(document.getElementById('container').offsetWidth);
}

function init() {
  // Resize the canvas to the desired width and height
  resizeCanvas();
  // Just some debug for now!
  ctx.beginPath();
  ctx.strokeStyle = 'blue';
  ctx.fillRect(0, 0, 200, 100);
  ctx.closePath();
}

function roundTo(num, place) {
  let temp = num * place;
  temp = Math.round(temp) / place;
  return temp;
}

function updateFileInfo(filePath) {
  // Get actual string
  const fileName = filePath[0];

  // Get & set file name
  const ddName = path.basename(fileName);
  document.getElementById('dd_name').innerHTML = ddName;

  // Set path string
  document.getElementById('dd_path').innerHTML = fileName;

  // Image dimensions hard to do lol, requires dependencies, which we're trying to write ourselves

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

function readFile() {
  console.log('Read file will come later!');
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
    const filePath = dialog.showOpenDialogSync(options);

    // If a file was actually retrieved
    if (filePath !== undefined) {
      // We need to display some information about the file
      updateFileInfo(filePath);
      // Then read the actual image (is jpg different from png????)
      readFile();
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
init();

function onResize() {
  resizeCanvas();
}

window.addEventListener('resize', onResize);
