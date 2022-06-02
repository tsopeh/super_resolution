#!/usr/bin/env bash

original_file_path="$1"
model_name=${2:-"realesrgan-x4plus"}

tmp_folder_path="./.tmp"
filename=$(basename -- "$original_file_path")
extension="${filename##*.}"

file_hash=($(basename "$original_file_path")_$(md5sum "$original_file_path"))

echo "file name $filename"
echo "file ext $extension"

project_path="$tmp_folder_path/$file_hash"
rm -rf "$project_path"
mkdir "$project_path"

result_path="$project_path/result"
mkdir "$result_path"

echo "Determining processing strategy."
if [[ ($extension == "mp4") || $extension == "mov" ]]; then
  echo "Processing a video."

  tmp_frames_path="$project_path/tmp_frames"
  out_frames_path="$project_path/out_frames"
  mkdir "$tmp_frames_path"
  mkdir "$out_frames_path"

  ffmpeg -hide_banner -nostats -loglevel error -i "$original_file_path" -qscale:v 1 -qmin 1 -qmax 1 -vsync passthrough "$tmp_frames_path/frame%08d.jpg"

  # TODO: Look into threading and tta for `realesrgan-ncnn-vulkan`. Use `--help`.
  #  Look into the second ffmpeg that errors for videos without audio.

  ./src/scripts/realesrgan-ncnn-vulkan-20220424-ubuntu/realesrgan-ncnn-vulkan -i "$tmp_frames_path" -o "$out_frames_path" -n "$model_name" -s 4 -f jpg 2>"$result_path/all_output.txt"

  ffmpeg -hide_banner -nostats -loglevel error -i "$out_frames_path/frame%08d.jpg" -i "$original_file_path" -map 0:v:0 -map 1:a:0 -c:a copy -c:v libx264 -r 23.98 -pix_fmt yuv420p "$result_path/output_with_audio.mp4"

elif [[ ($extension == "jpg") || $extension == "png" ]]; then
  echo "Processing an image."
  ./src/scripts/realesrgan-ncnn-vulkan-20220424-ubuntu/realesrgan-ncnn-vulkan -i "$original_file_path" -o "$result_path/output.png" -n "$model_name" -s 4 2>"$result_path/all_output.txt"
fi
