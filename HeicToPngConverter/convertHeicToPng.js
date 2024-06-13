const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const heicConvert = require('heic-convert');

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

// Dynamically import inquirer and prompt the user for source and destination paths
(async () => {
    const inquirer = await import('inquirer');

    inquirer.default.prompt([
        {
            type: 'input',
            name: 'sourceFolder',
            message: 'Enter the path to the source folder containing HEIC files:',
            default: path.join(__dirname, 'source')
        },
        {
            type: 'input',
            name: 'destFolder',
            message: 'Enter the path to the destination folder for PNG files:',
            default: path.join(__dirname, 'dist')
        }
    ]).then(answers => {
        const sourceFolder = answers.sourceFolder;
        const destFolder = answers.destFolder;

        // Ensure the destination folder exists
        if (!fs.existsSync(destFolder)) {
            fs.mkdirSync(destFolder, { recursive: true });
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
    });
})();
