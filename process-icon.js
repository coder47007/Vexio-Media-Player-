import { Jimp } from "jimp";

async function main() {
  try {
    const image = await Jimp.read("assets/icon.png");
    
    // Create new background
    const bg = new Jimp({ width: 1024, height: 1024, color: "#fce7d2" });
    
    // Scale image to fit within 650x650
    image.scaleToFit({ w: 650, h: 650 });
    
    // Composite
    const x = Math.floor((1024 - image.bitmap.width) / 2);
    const y = Math.floor((1024 - image.bitmap.height) / 2);
    
    bg.composite(image, x, y);
    
    await bg.write("assets/icon.png");
    console.log("Icon resized and background added!");
  } catch (error) {
    console.error("Error processing icon:", error);
  }
}

main();
