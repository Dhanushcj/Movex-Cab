const { Jimp } = require('jimp');
const path = require('path');

async function processIcons() {
  try {
    const iconPath = path.join(__dirname, 'assets', 'Frame 3.png');
    console.log('Loading image:', iconPath);
    const image = await Jimp.read(iconPath);
    
    // Create adaptive icon (Android)
    const adaptiveLogo = image.clone();
    adaptiveLogo.resize({ w: 650 });
    
    const adaptiveIcon = new Jimp({ width: 1024, height: 1024, color: 0x00000000 });
    adaptiveIcon.composite(adaptiveLogo, (1024 - 650)/2, (1024 - adaptiveLogo.bitmap.height)/2);
    
    await adaptiveIcon.write(path.join(__dirname, 'assets', 'adaptive-icon.png'));
    console.log('Created adaptive-icon.png');
    
    // Create standard icon (iOS / Fallback)
    const stdLogo = image.clone();
    stdLogo.resize({ w: 920 });
    
    const stdIcon = new Jimp({ width: 1024, height: 1024, color: 0x00000000 });
    stdIcon.composite(stdLogo, (1024 - 920)/2, (1024 - stdLogo.bitmap.height)/2);
    
    await stdIcon.write(path.join(__dirname, 'assets', 'app-icon.png'));
    console.log('Created app-icon.png');

    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  }
}
processIcons();
