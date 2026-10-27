import os
from PIL import Image

src_img_path = r"C:/Users/Rohan/.gemini/antigravity/brain/2d702f1e-6679-4719-b914-56e00e81bdea/.user_uploaded/media_1793128622889_5c299a6c.png"
project_dir = r"f:/Work/chess"
public_dir = os.path.join(project_dir, "public")

if not os.path.exists(src_img_path):
    print("Source image not found:", src_img_path)
    exit(1)

# Open image and ensure RGBA
img = Image.open(src_img_path).convert("RGBA")

# Crop or square resize cleanly
width, height = img.size
max_dim = max(width, height)
# Create clean square image with transparent padding if needed
square_img = Image.new("RGBA", (max_dim, max_dim), (0, 0, 0, 0))
offset_x = (max_dim - width) // 2
offset_y = (max_dim - height) // 2
square_img.paste(img, (offset_x, offset_y), img)

# Save high-res master PNG (512x512)
master_png = square_img.resize((512, 512), Image.Resampling.LANCZOS)
master_png.save(os.path.join(project_dir, "icon.png"), format="PNG")
master_png.save(os.path.join(public_dir, "icon.png"), format="PNG")
master_png.save(os.path.join(public_dir, "logo.png"), format="PNG")

# Save multi-res Windows .ico file
ico_sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
master_png.save(
    os.path.join(project_dir, "icon.ico"),
    format="ICO",
    sizes=ico_sizes
)
master_png.save(
    os.path.join(public_dir, "icon.ico"),
    format="ICO",
    sizes=ico_sizes
)

print("Successfully converted user icon to icon.png and icon.ico in project and public directories!")
