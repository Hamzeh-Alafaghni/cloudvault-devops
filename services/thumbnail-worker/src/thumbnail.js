import Jimp from 'jimp';

// Resize an image buffer down to a 256px-wide PNG thumbnail (aspect preserved).
export async function makeThumbnail(buffer, width = 256) {
  const image = await Jimp.read(buffer);
  image.resize(width, Jimp.AUTO);
  return image.getBufferAsync(Jimp.MIME_PNG);
}
