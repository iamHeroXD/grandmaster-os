import os
from PIL import Image, ImageDraw

def create_grandmaster_icon():
    size = 256
    # Create RGBA canvas
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Outer rounded badge background
    pad = 8
    draw.rounded_rectangle(
        [pad, pad, size - pad, size - pad],
        radius=48,
        fill=(19, 21, 23, 255),
        outline=(78, 124, 89, 255),
        width=6
    )

    # Inner decorative glow circle
    draw.ellipse([24, 24, size - 24, size - 24], outline=(98, 153, 110, 100), width=3)

    # Grandmaster Crown Silhouette in Gold
    # Crown coordinates
    crown_pts = [
        (48, 175),   # bottom-left
        (208, 175),  # bottom-right
        (190, 95),   # right spike
        (155, 125),  # right inner valley
        (128, 65),   # center highest spike
        (101, 125),  # left inner valley
        (66, 95),    # left spike
    ]
    draw.polygon(crown_pts, fill=(218, 165, 32, 255), outline=(255, 215, 0, 255))

    # Crown base band in emerald
    draw.rounded_rectangle([44, 170, 212, 195], radius=6, fill=(57, 92, 66, 255), outline=(255, 215, 0, 255), width=3)

    # Crown jewels (Pearls/Diamonds)
    jewels = [(66, 95), (128, 65), (190, 95)]
    for jx, jy in jewels:
        draw.ellipse([jx - 9, jy - 9, jx + 9, jy + 9], fill=(255, 255, 255, 255), outline=(194, 155, 56, 255), width=2)

    # Center jewel on the crown band
    draw.polygon([(128, 172), (138, 182), (128, 193), (118, 182)], fill=(255, 255, 255, 255))
    draw.ellipse([75, 178, 87, 188], fill=(98, 153, 110, 255), outline=(255, 215, 0, 255), width=1)
    draw.ellipse([169, 178, 181, 188], fill=(98, 153, 110, 255), outline=(255, 215, 0, 255), width=1)

    # Knight Head inside center of crown (Chess emblem)
    knight_pts = [
        (128, 88),
        (148, 105),
        (142, 145),
        (114, 145),
        (112, 120),
        (120, 105)
    ]
    draw.polygon(knight_pts, fill=(255, 255, 255, 240), outline=(26, 29, 32, 255), width=2)
    # Knight eye
    draw.ellipse([124, 110, 128, 114], fill=(19, 21, 23, 255))

    # Save PNG versions
    public_dir = os.path.join(os.path.dirname(__file__), '..', 'public')
    root_dir = os.path.join(os.path.dirname(__file__), '..')

    png_path = os.path.join(public_dir, 'icon.png')
    img.save(png_path, format='PNG')
    img.save(os.path.join(root_dir, 'icon.png'), format='PNG')

    # Save multi-res ICO
    ico_path_public = os.path.join(public_dir, 'icon.ico')
    ico_path_root = os.path.join(root_dir, 'icon.ico')

    img.save(
        ico_path_public,
        format='ICO',
        sizes=[(256, 256), (64, 64), (48, 48), (32, 32), (16, 16)]
    )
    img.save(
        ico_path_root,
        format='ICO',
        sizes=[(256, 256), (64, 64), (48, 48), (32, 32), (16, 16)]
    )

    print(f"Successfully generated {ico_path_root} and {ico_path_public}")

if __name__ == '__main__':
    create_grandmaster_icon()
