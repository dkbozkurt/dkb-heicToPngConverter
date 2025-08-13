const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const heicConvert = require('heic-convert');
const cliProgress = require('cli-progress');

// Get format from command line args
const exportFormat = (process.argv[2] || 'png').toLowerCase();
if (!['png', 'jpg', 'jpeg'].includes(exportFormat)) {
    console.error('Invalid format! Please choose either "png" or "jpg".');
    process.exit(1);
}

const sourceFolder = path.join(__dirname, 'source');
const destFolder = path.join(__dirname, 'dist');

// Ensure the destination folder exists
if (!fs.existsSync(destFolder)) {
    fs.mkdirSync(destFolder, { recursive: true });
}

// Function to convert HEIC to PNG or JPG
async function convertHeic(sourcePath, destPath) {
    try {
        const inputBuffer = fs.readFileSync(sourcePath);
        const outputBuffer = await heicConvert({
            buffer: inputBuffer,
            format: exportFormat.toUpperCase() === 'JPG' ? 'JPEG' : exportFormat.toUpperCase(),
            quality: 1
        });

        await sharp(outputBuffer)
            .toFormat(exportFormat === 'jpg' ? 'jpeg' : exportFormat)
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

    for (const file of heicFiles) {
        const sourcePath = path.join(sourceFolder, file);
        const destPath = path.join(destFolder, path.basename(file, path.extname(file)) + `.${exportFormat}`);

        try {
            await convertHeic(sourcePath, destPath);
        } catch (err) {
            console.error(`Error converting file ${sourcePath}:`, err);
        }

        convertedFiles++;
        progressBar.update(convertedFiles);
    }

    progressBar.stop();

    console.log('All files converted successfully.');
    console.log(`Total files processed: ${convertedFiles}`);
});