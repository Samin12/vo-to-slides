#!/usr/bin/env python3
"""
Screenshot Capture for VO-to-Slides

Scans a slide spec JSON for slides with `screenshot_url` fields,
captures each URL using Playwright, and saves to assets/.

Usage:
    python3 scripts/capture-screenshots.py spec.json

The script modifies spec.json in-place, replacing screenshot_url entries
with reference_image slides pointing to the captured assets.

Requires: pip install playwright && playwright install chromium
"""

import json
import sys
import os
import re
import argparse


def slugify(url):
    """Turn a URL into a safe filename."""
    slug = re.sub(r'https?://', '', url)
    slug = re.sub(r'[^a-zA-Z0-9]+', '-', slug)
    slug = slug.strip('-')[:80]
    return slug


def capture_screenshots(spec_path, width=1920, height=1080, full_page=False):
    """Scan spec for screenshot_url fields and capture them."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Error: playwright not installed.", file=sys.stderr)
        print("Run: pip install playwright && playwright install chromium", file=sys.stderr)
        sys.exit(1)

    with open(spec_path) as f:
        spec = json.load(f)

    # Collect all screenshot URLs from the spec
    captures = []
    for i, slide in enumerate(spec.get("slides", [])):
        data = slide.get("data", {})
        url = data.get("screenshot_url")
        if url:
            slug = slugify(url)
            filename = f"assets/screenshot-{slug}.png"
            captures.append({
                "index": i,
                "url": url,
                "filename": filename,
                "selector": data.get("screenshot_selector"),  # optional CSS selector
                "delay": data.get("screenshot_delay", 2000),  # ms to wait
                "full_page": data.get("screenshot_full_page", full_page),
            })

    if not captures:
        print("No screenshot_url fields found in spec.")
        return spec

    print(f"Found {len(captures)} screenshot(s) to capture.\n")

    # Ensure assets directory exists
    spec_dir = os.path.dirname(os.path.abspath(spec_path))
    assets_dir = os.path.join(spec_dir, "assets")
    os.makedirs(assets_dir, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": width, "height": height})

        for cap in captures:
            output_path = os.path.join(spec_dir, cap["filename"])
            print(f"[{cap['index']}] {cap['url']}")
            print(f"     → {cap['filename']}")

            try:
                page.goto(cap["url"], wait_until="networkidle", timeout=30000)
                page.wait_for_timeout(cap["delay"])

                if cap["selector"]:
                    # Screenshot a specific element
                    el = page.query_selector(cap["selector"])
                    if el:
                        el.screenshot(path=output_path)
                        print(f"     ✓ Captured element: {cap['selector']}")
                    else:
                        print(f"     ! Selector not found, capturing full page")
                        page.screenshot(path=output_path, full_page=cap["full_page"])
                else:
                    page.screenshot(path=output_path, full_page=cap["full_page"])
                    print(f"     ✓ Captured")

                # Update the spec slide to reference_image
                slide = spec["slides"][cap["index"]]
                vo = slide.get("vo", "")
                slide["type"] = "reference_image"
                slide["data"] = {"image": cap["filename"]}
                slide["vo"] = vo

                # Track in assets list
                if "assets" not in spec:
                    spec["assets"] = []
                if cap["filename"] not in spec["assets"]:
                    spec["assets"].append(cap["filename"])

            except Exception as e:
                print(f"     ✗ Failed: {e}")

        browser.close()

    # Write updated spec back
    with open(spec_path, "w") as f:
        json.dump(spec, f, indent=2)

    print(f"\nDone. Updated {spec_path} with {len(captures)} screenshot(s).")
    return spec


def main():
    parser = argparse.ArgumentParser(description="Capture screenshots for slide spec")
    parser.add_argument("spec", help="Path to spec.json")
    parser.add_argument("--width", type=int, default=1920, help="Viewport width (default: 1920)")
    parser.add_argument("--height", type=int, default=1080, help="Viewport height (default: 1080)")
    parser.add_argument("--full-page", action="store_true", help="Capture full scrollable page")

    args = parser.parse_args()
    capture_screenshots(args.spec, args.width, args.height, args.full_page)


if __name__ == "__main__":
    main()
