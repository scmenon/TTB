# TTB REST API Documentation

## Overview
The TTB Image Checker REST API accepts TTB alcohol label approval form submissions, validates the label image, stores it in S3, and returns the S3 location along with submission details.

## API Endpoint
- **Base URL**: `https://6o7i7j573g.execute-api.us-east-1.amazonaws.com/dev`
- **Path**: `/images`
- **Method**: `POST`
- **Content-Type**: `application/json`

## Request Body

The API expects a JSON payload with the following fields:

```json
{
  "brandName": "string (required)",
  "productClass": "string (required)",
  "abv": "number (required) - 0 to 100",
  "netContents": "string (optional) - e.g., '750 mL'",
  "manufacturerName": "string (optional)",
  "manufacturerAddress": "string (optional)",
  "warnings": "string (optional)",
  "labelImage": "string (required) - Base64 encoded image"
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `brandName` | string | Yes | The brand name of the alcohol product (e.g., "Old Tom Distillery") |
| `productClass` | string | Yes | Product type/class (e.g., "Kentucky Straight Bourbon Whiskey", "IPA") |
| `abv` | number | Yes | Alcohol by volume percentage (0-100) |
| `netContents` | string | No | Volume of the product (e.g., "750 mL", "12 fl oz") |
| `manufacturerName` | string | No | Name of the manufacturer or bottler |
| `manufacturerAddress` | string | No | Address of the manufacturer or bottler |
| `warnings` | string | No | Health warnings or notices |
| `labelImage` | string | Yes | Base64 encoded image of the label |

### Image Requirements
- **Format**: JPEG, PNG, or GIF
- **Max Size**: 10 MB
- **Encoding**: Base64 (without data URI prefix)

## Response Format

### Success Response (200 OK)
```json
{
  "submissionId": "a1b2c3d4",
  "submissionDate": "2025-12-04T14:30:00.000000",
  "status": "submitted",
  "formData": {
    "brandName": "Old Tom Distillery",
    "productClass": "Kentucky Straight Bourbon Whiskey",
    "abv": 45.0,
    "netContents": "750 mL",
    "manufacturerName": "ABC Distillery LLC",
    "manufacturerAddress": "123 Main St, Louisville, KY 40202",
    "warnings": "Government Health Warning..."
  },
  "imageInfo": {
    "s3Location": "s3://amplify-ttb-storage-us-east-1/ttb-labels/20251204_143000_a1b2c3d4_Old_Tom_Distillery.jpeg",
    "s3Key": "ttb-labels/20251204_143000_a1b2c3d4_Old_Tom_Distillery.jpeg",
    "format": "JPEG",
    "width": 1200,
    "height": 1600,
    "sizeBytes": 524288
  },
  "checks": {
    "is_valid_format": true,
    "is_square": false,
    "max_size_ok": true,
    "dimensions": "1200x1600",
    "file_size_mb": 0.5
  }
}
```

### Error Response (400/500)
```json
{
  "error": "Description of the error"
}
```

## Common Error Messages

| Status | Error | Cause |
|--------|-------|-------|
| 400 | Missing required fields | One or more required fields are missing |
| 400 | Invalid image format | Image is not JPEG, PNG, or GIF |
| 400 | Image must be less than 10MB | Uploaded image exceeds size limit |
| 500 | Failed to upload image to S3 | S3 upload failed |
| 500 | Internal server error | Unexpected server error |

## Example Request (JavaScript/Fetch)

```javascript
// Convert file to base64
const file = document.getElementById('labelImage').files[0];
const reader = new FileReader();

reader.onloadend = async () => {
  const base64Image = reader.result.split(',')[1]; // Remove data:image/... prefix
  
  const payload = {
    brandName: "Old Tom Distillery",
    productClass: "Kentucky Straight Bourbon Whiskey",
    abv: 45,
    netContents: "750 mL",
    manufacturerName: "ABC Distillery LLC",
    manufacturerAddress: "123 Main St, Louisville, KY 40202",
    warnings: "Government Health Warning",
    labelImage: base64Image
  };

  const response = await fetch(
    'https://6o7i7j573g.execute-api.us-east-1.amazonaws.com/dev/images',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  const result = await response.json();
  console.log('Submission Result:', result);
  
  if (response.ok) {
    console.log('Image stored at:', result.imageInfo.s3Location);
  }
};

reader.readAsDataURL(file);
```

## Backend Implementation

### Lambda Function Details
- **Runtime**: Python 3.13
- **Handler**: `index.lambda_handler`
- **Dependencies**: 
  - `boto3` - AWS SDK for Python
  - `Pillow` - Image processing library

### Image Processing
1. Image is base64 decoded
2. Image format and dimensions are validated
3. Image is validated using PIL (Pillow)
4. Image is stored in S3 with metadata
5. Submission data is returned with S3 location

### S3 Storage
- **Bucket**: Auto-detected from environment (Amplify storage bucket)
- **Path Structure**: `ttb-labels/{timestamp}_{fileId}_{brandName}.{extension}`
- **Metadata**: Stored with brand name, product class, and ABV in S3 object metadata

## Deployment Instructions

### Prerequisites
- AWS CLI configured with appropriate credentials
- AWS Amplify CLI installed

### Deploy Backend Changes
```bash
# 1. Build and push backend changes
amplify push

# 2. Verify API is deployed
amplify status

# 3. Get API endpoint
amplify api describe
```

### Environment Variables (Lambda)
The Lambda function automatically detects:
- `AWS_STACK_NAME` - CloudFormation stack name
- `AWS_REGION` - AWS region
- `STORAGE_BUCKET_NAME` - (optional) S3 bucket name

## Rate Limiting & Quotas
Currently no rate limiting is implemented. Consider adding for production:
- Request rate limits (per IP/user)
- Submission quotas (per user/time period)
- Payload size limits

## Security Considerations
1. **CORS**: Currently allows all origins (`Access-Control-Allow-Origin: *`)
   - Restrict in production to specific domains
2. **S3 Permissions**: Lambda has broad S3 access
   - Restrict to specific bucket/path in production
3. **Input Validation**: Basic validation implemented
   - Add additional validation for malicious input
4. **Image Validation**: Checks file format and size
   - Consider scanning for malware in production

## Future Enhancements
1. Add image OCR to verify label contains required text
2. Implement AI-based label compliance checking
3. Add authentication/authorization
4. Implement request signing for security
5. Add database storage for submission history
6. Add email notifications for submissions
7. Implement status tracking and workflow

## Support
For issues or questions, refer to:
- AWS Amplify Documentation: https://docs.amplify.aws
- Lambda Python Guide: https://docs.aws.amazon.com/lambda/latest/dg/python-handler.html
- Boto3 S3 Documentation: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3.html
