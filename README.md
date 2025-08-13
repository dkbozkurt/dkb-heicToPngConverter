# dkb-heicToPngConverter
<!-- Conversion script which converts '.heic' files, to '.png' files without quality compression -->

<p align="center">
<img src="./Img/heic.png" alt="heic" width="120" height="120"/>
<img src="./Img/right-arrow.png" alt="arrow" width="120" height="120"/>
<img src="./Img/png.png" alt="png" width="120" height="120"/>
<img src="./Img/jpg.png" alt="jpg" width="120" height="120"/>

</p>

## Description

The HEIC to Image Converter is a Node.js application designed to batch convert HEIC (High-Efficiency Image Coding) files to PNG or JPG files. This tool is particularly useful for users who need to handle images from Apple devices, as HEIC is the default format for photos on iOS. It supports nested folders, ignores non-HEIC files, and ensures no overwritten files by automatically adding a suffix to duplicate filenames.

## Getting Started

### Dependencies

* `sharp` : A high-performance image processing library.
* `heic-convert` : A library to decode HEIC files using libheif.
* `cli-progress` : A library to display progress bars in the terminal.

### Installation
1. Clone the Repository

``` bash
git clone https://github.com/dkbozkurt/dkb-heicToPngConverter.git
cd heicToPngConverter
```

2. Install Dependencies

```bash
npm install
```

3. Project Structure
Ensure you have the following structure:

```bash
heic-to-png-converter/
├── source/         # Folder containing source .heic files
├── dist/           # Folder where converted files will be saved
├── convertHeicToPng.js  # The main conversion script
└── package.json    # Project configuration and dependencies
```

### Usage

You can now choose the export type and optionally pass custom source and destination paths.
```bash
npm run convert:png [SOURCE_PATH] [DIST_PATH]
npm run convert:jpg [SOURCE_PATH] [DIST_PATH]
```
<b>Rules for paths:</b>

1. If no source is provided → source = ./source, dist = ./dist.

2. If only source is provided → dist defaults to the same folder as the source.

3. If both source and dest are provided → use the provided paths.

## Example

If you have a file <b>image1.heic</b> in the source folder, running the script will create a <b>image1.png</b> (or .jpg) file in the dist folder. If a file with the same name already exists, the script will create <b>image1_1.png</b> (or .jpg).

## Notes
* Ensure the source and dist folders are in the same directory as the convertHeicToPng.js script, unless specifying custom paths.
* The conversion process may take some time depending on the number and size of .heic files.
* Test '.heic' files can be found under <b>/heicToPngConverter/test/</b>.
* Supported formats are PNG and JPG only.

## Authors

Contributors names and contact info

* Dogukan Kaan Bozkurt [@dkbozkurt](https://github.com/dkbozkurt)

## Version History

* 0.1
    * Initial Release
* 0.2
    * Added progress bar functionality and improved error handling.
* 0.3
    * Added JPG export option, recursive folder scanning, file overwrite protection, and flexible source/dest paths.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.