#!/usr/bin/env bash
set -euo pipefail

# This script builds a Lambda layer zip by running the provided Dockerfile (amazonlinux:2).
# It requires Docker to be installed and the Docker daemon to be running.

# Output path for the created layer zip
OUT_DIR="$(pwd)/output"
mkdir -p "$OUT_DIR"

IMAGE_NAME="tesseract-layer-build"
# Allow overriding target platform (e.g. linux/amd64) via PLATFORM env var
PLATFORM="${PLATFORM:-linux/amd64}"

# Docker image name
IMAGE_NAME="tesseract-layer-build"

# Check for docker availability early and provide actionable guidance if missing
if ! command -v docker >/dev/null 2>&1; then
    cat <<'MSG'
Error: docker command not found. This script builds an Amazon Linux-based layer and requires Docker.

Fix options:
  1) Install Docker Desktop (recommended on macOS):
       brew install --cask docker
     Then open Docker.app and wait until the Docker engine is running.

  2) Use Podman as a Docker-compatible alternative (advanced):
       brew install podman
     Note: podman sometimes requires extra flags and setup; the script currently expects Docker.

  3) Build in CI / EC2: run this script on an Amazon Linux 2 machine (EC2) where yum can install tesseract

Important: Building the layer on macOS without Amazon Linux (i.e., without Docker) will produce native binaries
that are incompatible with AWS Lambda (Amazon Linux). Do not skip Docker unless you build on Amazon Linux.

After installing Docker, re-run this script from the same directory.
MSG
    exit 1
fi


echo "Building Docker image for platform=$PLATFORM..."
# Ensure Docker respects the requested platform when pulling/building images (helps on Apple Silicon)
export DOCKER_DEFAULT_PLATFORM="$PLATFORM"

# Use buildx to target a specific platform so the resulting native binaries match the Lambda architecture.
docker buildx build --platform "$PLATFORM" --load -t "$IMAGE_NAME" .

echo "Running container to assemble /opt into a zip..."
# Run container and zip /opt into the mounted output directory. Pass --platform to ensure the runtime matches the built image.
docker run --rm --platform "$PLATFORM" -v "$OUT_DIR":/output "$IMAGE_NAME" bash -lc "cd /opt && zip -r /output/tesseract-layer.zip ."

echo "Layer zip created: $OUT_DIR/tesseract-layer.zip"

cat <<'MSG'
Next steps:
1) Publish the layer:
   aws lambda publish-layer-version --layer-name tesseract-layer --zip-file fileb://output/tesseract-layer.zip --compatible-runtimes python3.8 python3.9 python3.10

2) Add the resulting layer ARN to your Lambda (via Console or CloudFormation). If you use CloudFormation/Amplify, add the ARN under the function's "Layers" property and run 'amplify push'.
MSG
