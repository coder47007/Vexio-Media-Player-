import { Jimp } from "jimp";

async function main() {
  try {
    const image = await Jimp.read("assets/icon.png");
    
    // We want to turn #fce7d2 (252, 231, 210) into transparent
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const red   = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue  = this.bitmap.data[idx + 2];
      
      // If color matches #fce7d2 exactly or very closely
      if (Math.abs(red - 252) <= 5 && Math.abs(green - 231) <= 5 && Math.abs(blue - 210) <= 5) {
        this.bitmap.data[idx + 3] = 0; // Set alpha to 0
      }
    });
    
    await image.write("assets/icon.png");
    console.log("Background removed!");
  } catch (error) {
    console.error("Error processing icon:", error);
  }
}

main();
