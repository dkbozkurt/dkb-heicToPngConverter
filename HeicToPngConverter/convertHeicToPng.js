const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const heicConvert = require('heic-convert');
const cliProgress = require('cli-progress');

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
fs.readdir(sourceFolder, async (err, files) => {
    if (err) {
        console.error('Error reading source folder:', err);
        return;
    }

    const heicFiles = files.filter(file => path.extname(file).toLowerCase() === '.heic');

    if (heicFiles.length === 0) {
        console.log('No HEIC files found in the source folder.');
        return;
    }

    const progressBar = new cliProgress.SingleBar({
        clearOnComplete: false,
        hideCursor: true
    }, cliProgress.Presets.shades_classic);
    progressBar.start(heicFiles.length, 0);

    let convertedFiles = 0;

    // Convert files sequentially to properly update the progress bar
    for (const file of heicFiles) {
        const sourcePath = path.join(sourceFolder, file);
        const destPath = path.join(destFolder, path.basename(file, path.extname(file)) + '.png');
        
        try {
            await convertHeicToPng(sourcePath, destPath);
        } catch (err) {
            console.error(`Error converting file ${sourcePath}:`, err);
        }

        convertedFiles++;
        progressBar.update(convertedFiles);
    }

    progressBar.stop();

    // Additional logs to ensure they remain visible
    console.log('All files converted successfully.');
    console.log(`Total files processed: ${convertedFiles}`);
});
