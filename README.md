# Pixelate

## Development

Clone repository, install dependencies, then run the app

```shell
git clone https://github.com/SpicyRicecaker/Pixelate.git
bun install
bun start
```

## Rant

An app that pixelates an image

Windows x64 download!:
https://github.com/SpicyRicecaker/Pixelate/releases/download/1.0.0/Pixelate.Setup.1.0.0.exe
  
The built-in resources of a web browser along with html, css, and javascript have have blown me away with their capabilities. There were so many different ways to code similar functions and so much documentation on the matter that at times I suffered from decision paralysis. 

But that's enough about web development, I want to talk about the process of making pixelate.

In the beginning, I struggled to understand the electron api, wasn't using nodejs, and did not know that I didn't have eslint activated. 
It took me a long time to read files with the system dialog of electron, a long time to setup eslint, and a long time to write files with nodejs.

The next challenge was probably making a layout with css grids, but after watching a few tutorials and learning about the versatility of grid-templates, the layout was completed in the blink of an eye. I don't think I'll ever want to touch java swing again. 

Finally, after the long html and css styling struggle, I was finally able to use javascript to write out the pixelating algorithm, and mess around with the canvas and exporting of images.

Some things that I could probably work on next time if I was working on electron is seperating node modules from the source code, so the size of the repository is smaller, and worrying less about the layout and instead just focusing on creating content.

Overall, it's been really fun using web dev tools to build a native app using electron, and I've learned so so much in the process of doing so.

Cheers, 
Andy Li

P.S. I need to learn markdown so these git readmes and releases look better lol
