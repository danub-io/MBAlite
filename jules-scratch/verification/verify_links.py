
import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Get the absolute path to the HTML file
        html_file_path = os.path.abspath('index.html')

        # Go to the local HTML file
        await page.goto(f'file://{html_file_path}')

        # Set a larger viewport to capture the full page width
        await page.set_viewport_size({"width": 1920, "height": 1080})

        # Scroll to the publications section
        await page.evaluate("document.getElementById('autor').scrollIntoView()")

        # Take a screenshot of the publications section
        await page.screenshot(path="jules-scratch/verification/verification.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
