//Other specifications here
//Node js filesystem
const fs = require("fs");
//Path required for some things...
const path = require('path');
//Dialog, for file explorer, .remote at the end if not in main
const { dialog } = require("electron").remote;

//When the user clicks on the button...
document.getElementById("smallButton").addEventListener(
  "click",
  () => {
    //Options that can configure the file explorer window
    //The "let" keyword makes it so that the variable has a limited scope and expires
    let options = {
      //Changes the label on the title bar
      title: "Load File",

      //The default file explorer path that is opened, kinda bugged but watev
      //defaultPath: "~/Desktop",

      //The final open file button in the file explorer
      buttonLabel: "Open File",

      //Filters file types!
      filters: [{ name: "Images", extensions: ["jpeg", "jpg", "png"] }],

      //Other "features" of the dialog, some that seem useful are
      //"openFile", which allows files to be selected,
      //"openDirectory", which allows for directories to be selected,
      //"multiSelections", which allows for multiple paths to be selected,
      //"showHiddenFiles", which shows hidden files during selection
      //More can be found at "https://www.electronjs.org/docs/api/dialog#dialogshowopendialogbrowserwindow-options"
      properties: ["openFile"],
    };
    //Show window popup dialog
    //Retreve string of file, that is a image file type
    var filePath = dialog.showOpenDialogSync(options);

    //If a file was actually retrieved
    if(filePath!=undefined){
        //We need to display some information about the file
        updateFileInfo(filePath);
        //Then read the actual image (is jpg different from png????)
        readFile();
    }
   //finally, you can also add a browserWindow as a parameter to showOpenDialog(), which attaches to a parent window and makes it modal
   //Basically, think of a custom file explorer (i think)
   //You would have to define a window earlier tho, like so:
   //WIN = new BrowserWindow({width: 800, height: 600})
   //And the browserWindow has a lot of options

   //A lot of code / explanation was learned from this helpful article: "https://www.brainbell.com/javascript/show-open-dialog.html"
  },
  false
);
// False at the end, something about events only called on bubbling up case... false by default idk

function updateFileInfo(filePath){
    //Get actual string 
    var fileName = filePath[0];

    //Get & set file name
    var ddName = path.basename(fileName);
    document.getElementById("dd_name").innerHTML = ddName;

    //Set path string
    document.getElementById("dd_path").innerHTML = fileName;

    //Image dimensions hard to do lol, requires dependencies, which we're trying to write ourselves
    
    //Size of file
    var fileStats = fs.statSync(fileName);
    var fileSizeInMB = roundTo(fileStats.size/1000000, 100);
    document.getElementById("dd_size").innerHTML = fileSizeInMB + " MB";

    //Type of file
    document.getElementById("dd_fileType").innerHTML = ddName.split(".").pop();

    //Time file was last modified
    document.getElementById("dd_lastModified").innerHTML = fileStats.mtime;
}

function readFile(){
    console.log("Read file will come later!");
}

function roundTo(num, place){
    var temp = num*place;
    temp = Math.round(temp)/place;
    return temp;
}