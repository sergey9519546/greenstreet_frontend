import requests
import urllib.parse
import os

images = {
    "office_collab.png": "Premium commercial corporate portrait, medium shot. A female fintech analyst of East Asian descent in her early 30s, with her hair in a sleek ponytail and neat bangs, wearing a sophisticated dark green silk blouse. She is seated at a minimalist charcoal oak desk in a high-end corporate office. She is looking at her modern silver laptop screen and smiling with confidence. On the desk rests a clean glass of water, a slim black stylus, and a small ceramic pot with a vibrant green succulent. The background features a textured dark teal accent wall with vertical wooden slats, illuminated by warm, indirect LED uplighting. Soft, cinematic side-lighting from a large window casts soft shadows. Shot on a professional medium format camera, 85mm f/1.2 lens, wide open, creating an ultra-smooth, creamy background bokeh and shallow depth of field. High-end editorial corporate photography.",
    
    "commercial_building.png": "High-end commercial editorial flat lay photograph captured from a direct overhead angle. Two real estate finance professionals—a male mortgage broker in a crisp linen shirt and a female investor in smart-casual business wear—are collaborating at a circular white quartz table. Scattered across the table are architectural floor plans, architectural blueprints of a modern apartment complex, a sleek modern laptop displaying a real estate financial underwriting model with clean pistachio-green and white charts, a matte black ceramic cup of pour-over coffee, a brass mechanical pencil, and physical leather-bound folders with printed mortgage amortization graphs. The floor beneath is polished dark charcoal concrete with subtle industrial texture. The composition is highly structured, geometric, and minimalist. Natural daylight streams from the side, casting soft, diffused shadows, accented by warm ambient studio lighting. Shallow depth of field focusing sharply on the paper blueprints and laptop screen. Exceptional detail, clean lines, professional corporate aesthetic with subtle dark teal and muted cream tones.",
    
    "residential_townhouse.png": "Atmospheric, cinematic photograph of a male commercial real estate broker working in a modern study at night. The broker, a man in his late 30s wearing a high-quality knit burgundy crewneck sweater, is leaning over a warm wooden desk, writing calculations with a matte black pen in a structured notebook. He has an approachable, focused expression and a slight smile. An open laptop next to him shows a clean, modern software dashboard with financial charts and lender matching results. A sleek tablet displaying a mortgage rate comparison, wireless headphones, and a simple ceramic mug of tea are arranged neatly on the desk. The background is a sophisticated library room with bookshelves, warm accent lighting, and potted fiddle-leaf fig plants, under a deep dark teal tone. Shot on 50mm f/1.4 lens, cinematic high-contrast lighting, soft shadows, warm highlights, photorealistic texture.",
    
    "financial_dashboard.png": "Professional corporate editorial photograph of a female loan officer in a tailored dark grey blazer and a male property developer reviewing a mortgage rate sheet on an open laptop. They are sitting side-by-side at a large, polished walnut desk. On the desk are neatly stacked printouts of DSCR underwriting calculations, a clean layout of spreadsheets with green headers, and a minimalist ceramic coffee cup. The background is a clean, modern minimalist office space with dark wood paneling and a soft, warm backlight. Clear, professional, and bright studio lighting that highlights details in skin texture, fabric, and paper. Composition is shot from a slight angle, focus is sharp on their engaged faces and the laptop screen, conveying trust, collaboration, and data-driven financial decision-making. 85mm f/1.8 lens.",
    
    "feature_fallback_1.png": "Editorial photograph of a team of three real estate finance underwriters collaborating around a modern glass-top conference table. A woman in a dark teal business suit is standing, holding a tablet and explaining key loan metrics to two colleagues who are sitting and looking up at her, engaged. On the table are sleek laptops, minimalist notebooks, and water glasses. The background is a luxury corporate conference room with floor-to-ceiling glass walls overlooking a modern cityscape at twilight, with warm internal overhead spotlighting. High-contrast, clean corporate aesthetic, shot on a 35mm f/2.0 lens for a wider environmental portrait. Sharp details, professional business environment, cinematic color grading with rich teals and warm amber accents.",
    
    "feature_fallback_2.png": "Macro, close-up photograph of a hand with a finger pointing to a sleek, modern interactive financial screen. The screen displays a complex mortgage interest rate yield curve, line graphs, and bar charts in vibrant neon emerald green, bright pistachio, and white data points against a dark teal background. The screen is sharp with crisp typography, showing numbers like '6.125%' and '+3.25%'. The finger is just about to touch the screen, creating a subtle reflection. The room is dimly lit, with the screen as the primary light source casting a soft cool glow on the hand. Shot on a 90mm macro lens with a shallow depth of field, highlighting the graphic detail on the screen and the texture of the finger. Futuristic, high-end quantitative finance visualization, clean and sophisticated.",
    
    "why-systems-break-down.png": "A minimalist, abstract 3D digital illustration representing structural system failure and data fragmentation. The composition features a sequence of glossy geometric cubes and pipelines rendered in dark teal and charcoal grey. Several pipelines are cracked, with glowing neon pistachio-green and electric blue liquid light leaking out from the fractures. The background is a clean, dark gradient transition from deep teal to black. The aesthetic is clean, high-end, and technical, resembling a premium corporate technology deck. Soft global illumination, sharp metallic reflections, and subtle light glows, creating a sense of sophisticated machinery or data flow breaking down under stress.",
    
    "rated-number-one.png": "A premium, abstract 3D digital graphic representing corporate success and top-tier customer ratings. In the center is a glossy, minimalist 3D shield emblem in dark teal, with a bright neon pistachio-green checkmark symbol glowing on its surface. Surrounding the emblem are five floating, semi-transparent glass stars that catch the light, and a stylized bar chart in the background rising upwards from left to right. The background is a clean, dark teal studio backdrop with soft, dramatic spotlights casting subtle shadows. High-end, clean, and professional design with realistic glass refraction and metallic gold accents on the edges.",
    
    "dscr-rate-sheet.png": "A clean, abstract 3D render of financial interest rate tiers and pricing cards. A deck of three stylized, floating paper-like cards in dark teal and soft pistachio-green are stacked overlapping each other. The front-most card displays a bold, clean typography percentage of '6.125%' in bright white, with a subtle line chart representing rate movement below it. The background is a minimalist, dark teal gradient with soft atmospheric fog and warm side lighting that highlights the edges of the cards. The composition is clean, sophisticated, and modern, representing premium mortgage rate sheets."
}

out_dir = "public/img/resources"
os.makedirs(out_dir, exist_ok=True)

seed = 42

for name, prompt in images.items():
    print(f"Generating {name}...")
    encoded_prompt = urllib.parse.quote(prompt)
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?model=flux&width=1280&height=720&nologo=true&seed={seed}&enhance=true"
    
    try:
        r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
        if r.status_code == 200:
            with open(os.path.join(out_dir, name), 'wb') as f:
                f.write(r.content)
            print(f"  Success: {name}")
        else:
            print(f"  Failed: {r.status_code}")
    except Exception as e:
        print(f"  Error: {str(e)}")

print("Done!")
