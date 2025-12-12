Tesseract Lambda Layer build instructions

Overview

This folder contains a Dockerfile and helper script to produce a Lambda Layer ZIP that includes:
- the Tesseract native binary (copied into /opt/bin)
- the Python packages `pillow` and `pytesseract` installed into /opt/python

You will need Docker and the AWS CLI available locally to build and publish the layer.

Build steps (local machine)

1. From this directory, build and create the layer ZIP:

```bash
cd scripts/build_tesseract_layer
./build_layer.sh
```

This will produce `output/tesseract-layer.zip`.

2. Publish the layer to AWS (example):

```bash
aws lambda publish-layer-version \
  --layer-name tesseract-layer \
  --description "Tesseract + pytesseract + Pillow for Lambda" \
  --zip-file fileb://output/tesseract-layer.zip \
  --compatible-runtimes python3.8 python3.9 python3.10
```

The publish command returns JSON containing the `LayerVersionArn`.

3. Attach the layer to your Lambda

- Console: Go to Lambda > Layers > find the layer > Add to function. Or, for your function, add the layer from the "Layers" section.
- CloudFormation/Amplify: Add the returned layer ARN to the function's CloudFormation template under `Properties.Layers` and run `amplify push`.

Important notes

- The Dockerfile uses `amazonlinux:2` and installs tesseract via yum. The resulting tesseract binary will be placed under `/opt/bin/tesseract` in the layer, which maps to `/opt/bin/tesseract` at runtime.
- Our Lambda handler code will prefer `/opt/bin/tesseract` automatically (it will set `pytesseract.pytesseract.tesseract_cmd` if pytesseract is present). If you use a different path, update the handler accordingly.
- If you prefer containers over layers, I can provide a Lambda Dockerfile variant.

Security

- Verify the content of the produced ZIP before publishing. Only the intended binaries and site-packages should be present.

If you want, I can also prepare a CloudFormation snippet to insert the layer ARN into the Amplify function resource and push it for you (you will still need to publish the layer from your machine or CI).