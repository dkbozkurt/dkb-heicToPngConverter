const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const heicConvert = require('heic-convert');
const cliProgress = require('cli-progress');

const exportFormat = process.argv[2] === 'jpg' ? 'jpg' : 'png';

// Determine source and destination folders
const sourceFolder = process.argv[3] ? path.resolve(process.argv[3]) : path.join(__dirname, 'source');
const destFolder = process.argv[4]
    ? path.resolve(process.argv[4])
    : (sourceFolder === path.join(__dirname, 'source') ? path.join(__dirname, 'dist') : sourceFolder);

// Ensure the destination folder exists
if (!fs.existsSync(destFolder)) {
    fs.mkdirSync(destFolder, { recursive: true });
}

// Function to get all HEIC files recursively
function getHeicFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir, { withFileTypes: true });
    list.forEach(file => {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            results = results.concat(getHeicFiles(fullPath));
        } else if (path.extname(file.name).toLowerCase() === '.heic') {
            results.push(fullPath);
        }
    });
    return results;
}

// Function to ensure unique filename in destination folder
function getUniqueDestPath(destFolder, fileName, format) {
    let baseName = path.basename(fileName, path.extname(fileName));
    let finalPath = path.join(destFolder, `${baseName}.${format}`);
    let counter = 1;

    while (fs.existsSync(finalPath)) {
        finalPath = path.join(destFolder, `${baseName}_${counter}.${format}`);
        counter++;
    }

    return finalPath;
}

// Convert HEIC to PNG or JPG
async function convertHeic(sourcePath, destPath) {
    try {
        const inputBuffer = fs.readFileSync(sourcePath);

        // Decode HEIC to a usable format
        const outputBuffer = await heicConvert({
            buffer: inputBuffer,
            format: exportFormat === 'jpg' ? 'JPEG' : 'PNG',
            quality: 1
        });

        await sharp(outputBuffer)
            .toFile(destPath);

        console.log(`Converted: ${sourcePath} -> ${destPath}`);
    } catch (error) {
        console.error(`Error converting file ${sourcePath}:`, error);
    }
}

// Main function
(async () => {
    const heicFiles = getHeicFiles(sourceFolder);

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
        const destPath = getUniqueDestPath(destFolder, path.basename(file), exportFormat);
        await convertHeic(file, destPath);
        convertedFiles++;
        progressBar.update(convertedFiles);
    }

    progressBar.stop();
    console.log('All files converted successfully.');
    console.log(`Total files processed: ${convertedFiles}`);
})();
