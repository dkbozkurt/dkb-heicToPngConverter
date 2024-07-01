const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const heicConvert = require('heic-convert');

// Define the source and destination folders
const sourceFolder = path.join(__dirname, 'source');
const destFolder = path.join(__dirname, 'dist');

// Ensure the destination folder exists
if (!fs.existsSync(destFolder)) {
    fs.mkdirSync(destFolder, { recursive: true });
}

// Function to convert HEIC to PNG
async function convertHeicToPng(sourcePath, destPath) {
    try {
        const inputBuffer = fs.readFileSync(sourcePath);
        const outputBuffer = await heicConvert({
            buffer: inputBuffer, // the HEIC file buffer
            format: 'PNG',       // output format
            quality: 1           // the jpeg compression quality, between 0 and 1
        });

        await sharp(outputBuffer)
            .toFile(destPath);
        
        console.log(`Converted: ${sourcePath} -> ${destPath}`);
    } catch (error) {
        console.error(`Error converting file ${sourcePath}:`, error);
    }
}

// Read the source folder and process each file
fs.readdir(sourceFolder, (err, files) => {
    if (err) {
        console.error('Error reading source folder:', err);
        return;
    }

    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        if (ext === '.heic') {
            const sourcePath = path.join(sourceFolder, file);
            const destPath = path.join(destFolder, path.basename(file, ext) + '.png');
            convertHeicToPng(sourcePath, destPath);
        }
    });
});
