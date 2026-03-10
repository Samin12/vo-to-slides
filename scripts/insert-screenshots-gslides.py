#!/usr/bin/env python3
"""
Insert screenshots directly into a Google Slides presentation.

Takes screenshots of URLs via Playwright and inserts them as full-bleed
slides into an existing Google Slides deck using the Slides API.

Usage:
    # Insert a single URL as a slide
    python3 scripts/insert-screenshots-gslides.py PRESENTATION_ID --url "https://example.com"

    # Insert multiple URLs
    python3 scripts/insert-screenshots-gslides.py PRESENTATION_ID \
        --url "https://docs.anthropic.com" \
        --url "https://github.com/anthropics/claude-code"

    # Insert from spec.json (all screenshot_url slides)
    python3 scripts/insert-screenshots-gslides.py PRESENTATION_ID --spec spec.json

    # Insert at a specific position
    python3 scripts/insert-screenshots-gslides.py PRESENTATION_ID --url "https://example.com" --at 5

    # Insert a local image file
    python3 scripts/insert-screenshots-gslides.py PRESENTATION_ID --file assets/demo.png

Requires:
    - pip install playwright && playwright install chromium
    - gcloud auth (for Drive/Slides API access)
    - Google Slides API enabled on your GCP project
"""

import json
import sys
import os
import re
import argparse
import subprocess
import urllib.request
import urllib.error


GCP_PROJECT = "950161675544"  # quota project for API calls


def get_access_token():
    result = subprocess.run(
        ["gcloud", "auth", "print-access-token"],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print("Error: gcloud auth failed. Run: gcloud auth login", file=sys.stderr)
        sys.exit(1)
    return result.stdout.strip()


def slugify(url):
    slug = re.sub(r'https?://', '', url)
    slug = re.sub(r'[^a-zA-Z0-9]+', '-', slug)
    return slug.strip('-')[:80]


def take_screenshot(url, output_path, width=1920, height=1080, selector=None, delay=2000):
    """Capture a screenshot using Playwright."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Error: playwright not installed.", file=sys.stderr)
        print("Run: pip install playwright && playwright install chromium", file=sys.stderr)
        sys.exit(1)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": width, "height": height})

        print(f"  Loading {url}...")
        page.goto(url, wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(delay)

        if selector:
            el = page.query_selector(selector)
            if el:
                el.screenshot(path=output_path)
            else:
                print(f"  Warning: selector '{selector}' not found, capturing viewport")
                page.screenshot(path=output_path)
        else:
            page.screenshot(path=output_path)

        browser.close()

    print(f"  Captured: {output_path}")
    return output_path


def upload_to_drive(filepath, token):
    """Upload image to Google Drive and make it publicly readable. Returns the URL."""
    filename = os.path.basename(filepath)

    boundary = "===vo2slides==="
    metadata = json.dumps({"name": filename, "mimeType": "image/png"}).encode()

    with open(filepath, "rb") as f:
        file_data = f.read()

    body = (
        f"--{boundary}\r\n"
        f"Content-Type: application/json; charset=UTF-8\r\n\r\n"
    ).encode() + metadata + (
        f"\r\n--{boundary}\r\n"
        f"Content-Type: image/png\r\n\r\n"
    ).encode() + file_data + f"\r\n--{boundary}--\r\n".encode()

    req = urllib.request.Request(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
        data=body, method="POST"
    )
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Content-Type", f"multipart/related; boundary={boundary}")

    resp = urllib.request.urlopen(req)
    file_id = json.loads(resp.read().decode())["id"]

    # Make public
    perm_req = urllib.request.Request(
        f"https://www.googleapis.com/drive/v3/files/{file_id}/permissions",
        data=json.dumps({"role": "reader", "type": "anyone"}).encode(),
        method="POST"
    )
    perm_req.add_header("Authorization", f"Bearer {token}")
    perm_req.add_header("Content-Type", "application/json")
    urllib.request.urlopen(perm_req)

    return f"https://drive.google.com/uc?id={file_id}", file_id


def get_slide_count(pres_id, token):
    """Get the current number of slides in the presentation."""
    req = urllib.request.Request(
        f"https://slides.googleapis.com/v1/presentations/{pres_id}?fields=slides.objectId,layouts(objectId,layoutProperties.name)",
    )
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("x-goog-user-project", GCP_PROJECT)

    resp = urllib.request.urlopen(req)
    data = json.loads(resp.read().decode())
    slides = data.get("slides", [])
    layouts = data.get("layouts", [])
    layout_id = layouts[0]["objectId"] if layouts else None
    return len(slides), layout_id


def insert_slide(pres_id, image_url, slide_id, index, layout_id, token, notes=None):
    """Insert a slide with a full-bleed image into the presentation."""
    requests = [
        {
            "createSlide": {
                "objectId": slide_id,
                "insertionIndex": index,
                **({"slideLayoutReference": {"layoutId": layout_id}} if layout_id else {}),
            }
        },
        {
            "createImage": {
                "objectId": f"img_{slide_id}",
                "url": image_url,
                "elementProperties": {
                    "pageObjectId": slide_id,
                    "size": {
                        "width": {"magnitude": 9144000, "unit": "EMU"},   # 10 inches
                        "height": {"magnitude": 5143500, "unit": "EMU"},  # 5.625 inches (16:9)
                    },
                    "transform": {
                        "scaleX": 1, "scaleY": 1,
                        "translateX": 0, "translateY": 0,
                        "unit": "EMU",
                    },
                },
            }
        },
    ]

    if notes:
        requests.append({
            "insertText": {
                "objectId": f"{slide_id}_notes",
                "text": notes,
            }
        })

    body = json.dumps({"requests": requests}).encode()
    req = urllib.request.Request(
        f"https://slides.googleapis.com/v1/presentations/{pres_id}:batchUpdate",
        data=body, method="POST"
    )
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Content-Type", "application/json")
    req.add_header("x-goog-user-project", GCP_PROJECT)

    try:
        resp = urllib.request.urlopen(req)
        data = json.loads(resp.read().decode())
        return True
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"  Error inserting slide: {error_body}", file=sys.stderr)
        return False


def main():
    parser = argparse.ArgumentParser(description="Insert screenshots into Google Slides")
    parser.add_argument("presentation_id", help="Google Slides presentation ID")
    parser.add_argument("--url", action="append", help="URL(s) to screenshot and insert")
    parser.add_argument("--file", action="append", help="Local image file(s) to insert")
    parser.add_argument("--spec", help="spec.json to scan for screenshot_url slides")
    parser.add_argument("--at", type=int, default=-1, help="Insert at this slide index (-1 = append)")
    parser.add_argument("--width", type=int, default=1920, help="Screenshot viewport width")
    parser.add_argument("--height", type=int, default=1080, help="Screenshot viewport height")

    args = parser.parse_args()
    pres_id = args.presentation_id
    token = get_access_token()

    # Collect all images to insert
    images = []  # list of (filepath, notes)

    # From --url flags
    if args.url:
        for url in args.url:
            slug = slugify(url)
            filepath = f"assets/screenshot-{slug}.png"
            print(f"Capturing: {url}")
            take_screenshot(url, filepath, args.width, args.height)
            images.append((filepath, f"Screenshot: {url}"))

    # From --file flags
    if args.file:
        for f in args.file:
            if os.path.exists(f):
                images.append((f, f"Image: {os.path.basename(f)}"))
            else:
                print(f"Warning: file not found: {f}", file=sys.stderr)

    # From --spec
    if args.spec:
        with open(args.spec) as f:
            spec = json.load(f)
        for slide in spec.get("slides", []):
            data = slide.get("data", {})
            url = data.get("screenshot_url")
            if url:
                slug = slugify(url)
                filepath = f"assets/screenshot-{slug}.png"
                print(f"Capturing: {url}")
                take_screenshot(
                    url, filepath, args.width, args.height,
                    selector=data.get("screenshot_selector"),
                    delay=data.get("screenshot_delay", 2000),
                )
                images.append((filepath, slide.get("vo", f"Screenshot: {url}")))

    if not images:
        print("No images to insert. Use --url, --file, or --spec.")
        sys.exit(1)

    # Get current slide count and layout
    slide_count, layout_id = get_slide_count(pres_id, token)
    insert_at = args.at if args.at >= 0 else slide_count
    print(f"\nPresentation has {slide_count} slides. Inserting at index {insert_at}.\n")

    # Upload and insert each image
    for i, (filepath, notes) in enumerate(images):
        print(f"[{i+1}/{len(images)}] Uploading {os.path.basename(filepath)}...")
        image_url, file_id = upload_to_drive(filepath, token)

        slide_id = f"auto_screenshot_{insert_at + i}_{i}"
        ok = insert_slide(pres_id, image_url, slide_id, insert_at + i, layout_id, token)
        if ok:
            print(f"  Inserted as slide {insert_at + i + 1}")
        else:
            print(f"  Failed to insert")

    print(f"\nDone! View: https://docs.google.com/presentation/d/{pres_id}/edit")


if __name__ == "__main__":
    main()
