@echo off
setlocal enabledelayedexpansion

:: ==============================================
:: HEIC to JPG Batch Converter using ImageMagick
:: ==============================================

echo.
echo ========================================
echo    HEIC to JPG Batch Converter
echo ========================================
echo.

:: Check if ImageMagick is installed
magick -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: ImageMagick is not installed or not in PATH
    echo Please install ImageMagick from: https://imagemagick.org/script/download.php
    pause
    exit /b 1
)

:: Get source folder
if "%~1"=="" (
    echo Usage: %~nx0 "C:\path\to\folder" [output_folder]
    echo.
    echo Examples:
    echo   %~nx0 "C:\Users\John\Pictures"
    echo   %~nx0 "C:\Users\John\Pictures" "C:\Users\John\Converted"
    echo   %~nx0 "." 
    echo.
    set /p SOURCE_FOLDER="Enter source folder path (or press Enter for current folder): "
    if "!SOURCE_FOLDER!"=="" set SOURCE_FOLDER=.
) else (
    set SOURCE_FOLDER=%~1
)

:: Get output folder
if "%~2"=="" (
    set OUTPUT_FOLDER=!SOURCE_FOLDER!\converted_jpg
) else (
    set OUTPUT_FOLDER=%~2
)

:: Resolve full paths
for %%i in ("!SOURCE_FOLDER!") do set SOURCE_FOLDER=%%~fi
for %%i in ("!OUTPUT_FOLDER!") do set OUTPUT_FOLDER=%%~fi

echo Source folder: !SOURCE_FOLDER!
echo Output folder: !OUTPUT_FOLDER!
echo.

:: Check if source folder exists
if not exist "!SOURCE_FOLDER!" (
    echo ERROR: Source folder does not exist: !SOURCE_FOLDER!
    pause
    exit /b 1
)

:: Create output folder with better error handling
if not exist "!OUTPUT_FOLDER!" (
    echo Creating output folder...
    mkdir "!OUTPUT_FOLDER!" 2>nul
    if !errorlevel! neq 0 (
        echo ERROR: Cannot create output folder: !OUTPUT_FOLDER!
        echo Make sure you have write permissions and the path is valid.
        echo Parent directories must exist or be creatable.
        pause
        exit /b 1
    )
    echo ✓ Output folder created successfully
) else (
    echo ✓ Output folder already exists
)

:: Ask for recursive search
echo.
set /p RECURSIVE="Search subfolders too? (y/N): "
if /i "!RECURSIVE!"=="y" (
    set SEARCH_OPTION=/s
    echo Will search recursively in all subfolders
) else (
    set SEARCH_OPTION=
    echo Will search only in the main folder
)

:: Initialize naming preference (will be set on first conflict)
set NAMING_PREFERENCE=

echo.
echo Starting conversion...
echo ----------------------------------------

:: Initialize counters
set CONVERTED=0
set FAILED=0
set TOTAL_FOUND=0

:: Find and convert HEIC files (case-insensitive, no duplicates)
if defined SEARCH_OPTION (
    for /f "delims=" %%f in ('dir "!SOURCE_FOLDER!\*.heic" /b /s 2^>nul ^& dir "!SOURCE_FOLDER!\*.HEIC" /b /s 2^>nul ^| sort /u') do (
        set /a TOTAL_FOUND+=1
        call :convert_file "%%f"
    )
) else (
    for /f "delims=" %%f in ('dir "!SOURCE_FOLDER!\*.heic" /b 2^>nul ^& dir "!SOURCE_FOLDER!\*.HEIC" /b 2^>nul ^| sort /u') do (
        set /a TOTAL_FOUND+=1
        call :convert_file "!SOURCE_FOLDER!\%%f"
    )
)

echo.
echo ========================================
echo           CONVERSION SUMMARY
echo ========================================
echo Successfully converted: !CONVERTED! files
echo Failed conversions:     !FAILED! files
echo Total HEIC files found:  !TOTAL_FOUND! files
echo.
echo Output folder: !OUTPUT_FOLDER!
echo ========================================

if !FAILED! gtr 0 (
    echo.
    echo NOTE: Some files failed to convert.
    echo Check the error messages above for details.
)

echo.
pause
exit /b 0

:: Function to convert individual file
:convert_file
set FILE_PATH=%~1
set FILE_NAME=%~n1
set FILE_DIR=%~dp1

:: Calculate relative path for maintaining folder structure
call set REL_PATH=%%FILE_DIR:!SOURCE_FOLDER!\=%%
if "!REL_PATH!"=="!FILE_DIR!" set REL_PATH=

:: Create output directory structure
set OUT_DIR=!OUTPUT_FOLDER!\!REL_PATH!
if not exist "!OUT_DIR!" mkdir "!OUT_DIR!" 2>nul

:: Set output file path - always overwrite, no conflict handling
set OUTPUT_FILE=!OUT_DIR!!FILE_NAME!.jpg

echo [CONVERTING] !FILE_NAME!.heic
echo   From: !FILE_PATH!
echo   To:   !OUTPUT_FILE!

:: Convert file
magick "!FILE_PATH!" -quality 90 "!OUTPUT_FILE!" 2>nul

:: Check if conversion was successful
if exist "!OUTPUT_FILE!" (
    :: Verify file size is reasonable (not empty)
    for %%a in ("!OUTPUT_FILE!") do (
        if %%~za gtr 1000 (
            echo   [SUCCESS] Converted ^(%%~za bytes^)
            set /a CONVERTED+=1
        ) else (
            echo   [FAILED] Output file too small - possibly corrupted
            del "!OUTPUT_FILE!" 2>nul
            set /a FAILED+=1
        )
    )
) else (
    echo   [FAILED] Conversion failed
    set /a FAILED+=1
)

echo.
goto :eof