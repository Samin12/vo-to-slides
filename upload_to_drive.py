#!/usr/bin/env python3
"""Upload a .pptx to Google Drive and convert to Google Slides."""

import subprocess
import json
import sys

def get_access_token():
    result = subprocess.run(
        ["gcloud", "auth", "print-access-token"],
        capture_output=True, text=True
    )
    return result.stdout.strip()

def upload_as_slides(filepath, title):
    token = get_access_token()

    # Step 1: Create metadata with mimeType conversion
    import urllib.request

    # Initiate resumable upload with conversion
    metadata = json.dumps({
        "name": title,
        "mimeType": "application/vnd.google-apps.presentation"
    }).encode()

    # First request: initiate upload
    req = urllib.request.Request(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
        method="POST"
    )
    req.add_header("Authorization", f"Bearer {token}")

    # Build multipart body
    boundary = "===vo2slides==="
    body = (
        f"--{boundary}\r\n"
        f"Content-Type: application/json; charset=UTF-8\r\n\r\n"
        f'{{"name": "{title}", "mimeType": "application/vnd.google-apps.presentation"}}\r\n'
        f"--{boundary}\r\n"
        f"Content-Type: application/vnd.openxmlformats-officedocument.presentationml.presentation\r\n\r\n"
    ).encode()

    with open(filepath, "rb") as f:
        file_data = f.read()

    body += file_data + f"\r\n--{boundary}--\r\n".encode()

    req = urllib.request.Request(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
        data=body,
        method="POST"
    )
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Content-Type", f"multipart/related; boundary={boundary}")

    try:
        resp = urllib.request.urlopen(req)
        result = json.loads(resp.read().decode())
        print(f"Uploaded: {result['name']}")
        print(f"ID: {result['id']}")
        print(f"URL: {result.get('webViewLink', 'https://docs.google.com/presentation/d/' + result['id'])}")
        return result
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"Error {e.code}: {error_body}", file=sys.stderr)

        if e.code == 403 and "insufficientPermissions" in error_body:
            print("\nNeed Drive scope. Run:", file=sys.stderr)
            print("  gcloud auth login --enable-gdrive-access", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    filepath = sys.argv[1] if len(sys.argv) > 1 else "slides.pptx"
    title = sys.argv[2] if len(sys.argv) > 2 else "Claude Does Your Taxes"
    upload_as_slides(filepath, title)
