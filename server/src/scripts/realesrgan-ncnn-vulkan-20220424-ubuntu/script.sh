#!/usr/bin/env bash

src_file_path="$1"
model_name=${2:-"realesrgan-x4plus"}
desired_scale=${3:-"4"}

filename_with_extension=$(basename -- "$src_file_path")
extension="${filename_with_extension##*.}"
filename_without_extension="${filename_with_extension%%.*}"

work_dir_path="$(dirname -- "$(dirname -- "$(realpath -- "$src_file_path")")")"

result_path="$work_dir_path/result"
rm -rf "$result_path"
mkdir "$result_path"

if [[ ($extension == "mp4") || $extension == "mov" ]]; then

  tmp_frames_path="$work_dir_path/tmp_frames"
  rm -rf "$tmp_frames_path"
  mkdir "$tmp_frames_path"
  out_frames_path="$work_dir_path/out_frames"
  rm -rf "$out_frames_path"
  mkdir "$out_frames_path"

  result_file_path="$result_path/$filename_without_extension.mp4"

  ffmpeg -hide_banner -nostats -loglevel error -i "$src_file_path" -qscale:v 1 -qmin 1 -qmax 1 -vsync passthrough "$tmp_frames_path/frame%08d.jpg"
  # TODO: Look into threading and tta for `realesrgan-ncnn-vulkan`. Use `--help`.
  ./src/scripts/realesrgan-ncnn-vulkan-20220424-ubuntu/realesrgan-ncnn-vulkan -i "$tmp_frames_path" -o "$out_frames_path" -n "$model_name" -s $desired_scale -f jpg 2>"$result_path/all_output.txt"
  ffmpeg -hide_banner -nostats -loglevel error -i "$out_frames_path/frame%08d.jpg" -i "$src_file_path" -map 0:v:0 -map 1:a:0? -c:a copy -c:v libx264 -r 23.98 -pix_fmt yuv420p "$result_file_path"
  echo "$result_file_path"

elif [[ ($extension == "jpg") || $extension == "png" ]]; then

  result_file_path="$result_path/$filename_without_extension.png"
  ./src/scripts/realesrgan-ncnn-vulkan-20220424-ubuntu/realesrgan-ncnn-vulkan -i "$src_file_path" -o "$result_file_path" -n "$model_name" -s 4 2>"$result_path/all_output.txt"
  echo "$result_file_path"

fi
