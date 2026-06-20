import fitz
doc = fitz.open("/tmp/hispaniola.pdf")
print("pages:", doc.page_count)
# slides are 16:9; render at 1920 wide
for i, page in enumerate(doc, 1):
    r = page.rect
    zoom = 1920.0 / r.width
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom))
    out = f"video/slides/slide-{i:02d}.png"
    pix.save(out)
    if i==1: print(f"slide1 size: {pix.width}x{pix.height}")
print("done")
