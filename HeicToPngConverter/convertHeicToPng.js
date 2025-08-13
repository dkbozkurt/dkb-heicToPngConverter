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

// Function to recursively get all .heic files
function getHeicFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getHeicFiles(filePath));
        } else if (path.extname(file).toLowerCase() === '.heic') {
            results.push(filePath);
        }
    }
    return results;
}

// Function to generate unique file path if it already exists
function getUniqueFilePath(filePath) {
    let uniquePath = filePath;
    let counter = 1;

    const ext = path.extname(filePath);
    const baseName = path.basename(filePath, ext);
    const dir = path.dirname(filePath);

    while (fs.existsSync(uniquePath)) {
        uniquePath = path.join(dir, `${baseName}_${counter}${ext}`);
        counter++;
    }

    return uniquePath;
}

// Main function
async function main() {
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
        // Preserve folder structure
        const relativePath = path.relative(sourceFolder, file);
        let destPath = path.join(
            destFolder,
            path.dirname(relativePath),
            path.basename(file, path.extname(file)) + `.${exportFormat}`
        );

        // Ensure subfolders exist
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        // Make unique if file already exists
        destPath = getUniqueFilePath(destPath);

        await convertHeic(file, destPath);

        convertedFiles++;
        progressBar.update(convertedFiles);
    }

    progressBar.stop();

    console.log('All files converted successfully.');
    console.log(`Total files processed: ${convertedFiles}`);
}

main();