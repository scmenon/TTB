import json
from datetime import datetime
import base64
import io
import logging
import sys

# Prefer packages installed in a Lambda layer at /opt/python over any vendored copies
# placed into /var/task. This helps ensure compiled C-extensions (Pillow) and
# pytesseract from the layer are used instead of a shadowing pure-Python package.
sys.path.insert(0, '/opt/python')

logger = logging.getLogger()
logger.setLevel(logging.INFO)

try:
    from PIL import Image
except Exception:
    Image = None

try:
    import pytesseract
except Exception:
    pytesseract = None

# If pytesseract is available, prefer the Tesseract binary in /opt/bin (Lambda layer path)
if pytesseract is not None:
    try:
        # pytesseract exposes the tesseract_cmd config under pytesseract.pytesseract
        pytesseract.pytesseract.tesseract_cmd = '/opt/bin/tesseract'
    except Exception:
        # ignore if we can't set it (will fallback to PATH)
        pass


def _decode_base64_image(data_url_or_b64: str) -> bytes:
    """Decode a base64 string or data URL to raw bytes."""
    if not data_url_or_b64:
        return b""
    # If it's a data URL, strip the prefix
    if data_url_or_b64.startswith("data:"):
        try:
            _, b64 = data_url_or_b64.split(",", 1)
        except Exception:
            b64 = data_url_or_b64
    else:
        b64 = data_url_or_b64
    # Some callers may URL-encode plus signs; ensure padding
    try:
        return base64.b64decode(b64)
    except Exception:
        # Try replacing spaces with pluses and decode again
        try:
            return base64.b64decode(b64.replace(" ", "+"))
        except Exception:
            return b""


def _extract_text_with_pytesseract(image_bytes: bytes) -> (str, str):
    """Return (text, error). If pytesseract or PIL is not available or tesseract binary missing, return error string."""
    if not image_bytes:
        return "", "no image bytes"
    if Image is None:
        return "", "Pillow (PIL) not available in runtime"
    if pytesseract is None:
        return "", "pytesseract not installed in runtime"

    try:
        img = Image.open(io.BytesIO(image_bytes))
    except Exception as e:
        return "", f"failed to open image: {e}"

    try:
        text = pytesseract.image_to_string(img)
        return text, ""
    except Exception as e:
        # Common failure: tesseract binary not found in PATH
        return "", str(e)


def lambda_handler(event, context):
    """
    Handler that accepts form data with image as base64 parameter.
    Returns a mocked verification response and attempts to extract OCR via pytesseract
    when available. If pytesseract/Tesseract isn't available, the response will include
    a helpful error string in `pytesseractError`.
    """
    try:
        logger.info('EVENT: %s', json.dumps(event, default=str))

        # Parse the request body
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event.get('body', {})

        logger.info('BODY: %s', json.dumps(body, default=str))

        # Debug endpoint: return runtime diagnostics if requested via query string or body
        qsp = event.get('queryStringParameters') or {}
        debug_flag = qsp.get('debug') if isinstance(qsp, dict) else None
        if not debug_flag and isinstance(body, dict):
            debug_flag = body.get('_debug')

        if str(debug_flag).lower() == 'env':
            # Return info about Pillow, pytesseract, and tesseract binary
            import importlib.util, shutil, subprocess
            info = {}
            info['pillow_installed'] = bool(importlib.util.find_spec('PIL'))
            try:
                import PIL
                info['pillow_version'] = getattr(PIL, '__version__', None)
            except Exception as e:
                import traceback
                info['pillow_error'] = str(e)
                info['pillow_import_traceback'] = traceback.format_exc()

            # Try importing the compiled _imaging extension directly to capture its traceback
            try:
                import importlib
                importlib.import_module('PIL._imaging')
                info['pillow__imaging_imported'] = True
            except Exception as e:
                import traceback
                info['pillow__imaging_imported'] = False
                info['pillow__imaging_traceback'] = traceback.format_exc()

            info['pytesseract_installed'] = bool(importlib.util.find_spec('pytesseract'))
            try:
                import pytesseract as _pt
                info['pytesseract_version'] = getattr(_pt, '__version__', None)
            except Exception as e:
                import traceback
                info['pytesseract_error'] = str(e)
                info['pytesseract_import_traceback'] = traceback.format_exc()

            # Check tesseract binary in PATH and /opt/bin
            tpath = shutil.which('tesseract') or shutil.which('/opt/bin/tesseract')
            info['tesseract_path'] = tpath
            if tpath:
                try:
                    p = subprocess.run([tpath, '--version'], capture_output=True, text=True, timeout=5)
                    info['tesseract_version_line'] = p.stdout.splitlines()[0] if p.stdout else ''
                except Exception as e:
                    info['tesseract_error'] = str(e)

            return {'statusCode': 200, 'body': json.dumps(info)}

        # Extract form fields and image
        received = body

        # Build a fieldComparison map where each submitted field (except labelImage) is marked as found
        fields = {}
        extracted_pieces = []

        for k, v in received.items():
            if k == 'labelImage':
                # Skip the image data itself
                continue
            if v:  # Only include non-empty fields
                fields[k] = {
                    'submitted': v,
                    'found_in_image': True
                }
                extracted_pieces.append(str(v))

        # Create a mock extracted text that concatenates submitted values
        extracted_text = ' '.join(extracted_pieces).strip() or 'Mock extracted text'

        # Try to extract OCR text via pytesseract if an image was provided as base64
        pytesseract_text = None
        pytesseract_error = None
        label_image_b64 = received.get('labelImage')
        if label_image_b64:
            image_bytes = _decode_base64_image(label_image_b64)
            ocr_text, ocr_err = _extract_text_with_pytesseract(image_bytes)
            pytesseract_text = ocr_text
            pytesseract_error = ocr_err

        # Build the verification response
        verification_response = {
            'verified': True,
            'extractedText': extracted_text,
            'fieldComparison': fields,
            'pytesseractText': pytesseract_text,
            'pytesseractError': pytesseract_error,
            'timestamp': datetime.utcnow().isoformat()
        }

        return {
            'statusCode': 200,
            'body': json.dumps(verification_response)
        }

    except Exception as e:
        logger.exception('Error in lambda_handler')
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f'Internal server error: {str(e)}'})
        }


def handler(event, context):
    """Shim handler expected by Amplify invoke tooling; delegates to lambda_handler."""
    return lambda_handler(event, context)


