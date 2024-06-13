from PIL import Image
import os

def convert_heic_to_png(input_folder, output_folder):
    # Create the output folder if it doesn't exist
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # Loop through all files in the input folder
    for filename in os.listdir(input_folder):
        if filename.endswith(".heic"):
            # Open the HEIC file
            heic_path = os.path.join(input_folder, filename)
            image = Image.open(heic_path)

            # Generate the output filename with the .png extension
            png_filename = os.path.splitext(filename)[0] + ".png"
            png_path = os.path.join(output_folder, png_filename)

            # Save the image as PNG
            image.save(png_path, "PNG")
            print(f"Converted {filename} to {png_filename}")

if __name__ == "__main__":
    # input_folder = input("Enter the path to the folder containing .heic files: ")
    # output_folder = input("Enter the path to the folder where you want to save the .png files: ")
    input_folder = "source"
    output_folder = "dist"

    convert_heic_to_png(input_folder, output_folder)