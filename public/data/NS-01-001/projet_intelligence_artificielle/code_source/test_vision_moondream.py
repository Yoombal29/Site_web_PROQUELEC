from transformers import AutoModelForCausalLM, AutoTokenizer, GenerationConfig
from transformers.generation import GenerationMixin
from PIL import Image, ImageDraw
import os
import torch
import re

def create_sample_image(path):
    # Create a white background
    img = Image.new('RGB', (300, 300), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    # Draw a red circle
    draw.ellipse([50, 50, 250, 250], fill=(255, 0, 0), outline=(0, 0, 0))
    img.save(path)
    print(f"Sample image created at {path}")

def run_test():
    # Use the local path provided by the user
    model_id = r"C:\Mes Sites Web\Site_web_PROQUELEC-main\haystack_backend\.cache\moondream2"
    
    img_path = "sample_test_image.png"
    if not os.path.exists(img_path):
        create_sample_image(img_path)

    print(f"Loading model from local path: {model_id}...")
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")
    
    # Load configuration and model
    model = AutoModelForCausalLM.from_pretrained(
        model_id, 
        trust_remote_code=True
    ).to(device)
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    
    # Load GenerationConfig explicitly
    try:
        gen_config = GenerationConfig.from_pretrained(model_id)
    except Exception as e:
        print(f"Warning: Could not load GenerationConfig explicitly: {e}")
        # Fallback to model's own config if available
        gen_config = getattr(model, "generation_config", None)

    # Monkey patch text_model if generate is missing
    if hasattr(model, "text_model"):
        if not hasattr(model.text_model, "generate"):
            print("Monkey patching model.text_model with GenerationMixin...")
            model.text_model.__class__ = type(
                model.text_model.__class__.__name__, 
                (GenerationMixin, model.text_model.__class__), 
                {}
            )
        if gen_config:
            model.text_model.generation_config = gen_config
    
    if not hasattr(model, "generate"):
        print("Monkey patching model with GenerationMixin...")
        model.__class__ = type(
            model.__class__.__name__, 
            (GenerationMixin, model.__class__), 
            {}
        )
    if gen_config:
        model.generation_config = gen_config

    print("Opening image...")
    image = Image.open(img_path)
    
    print("Encoding image and generating answer...")
    try:
        if hasattr(model, "answer_question"):
            answer = model.answer_question(
                model.encode_image(image), 
                "Describe this image briefly.", 
                tokenizer
            )
        else:
            enc_image = model.encode_image(image)
            answer = model.generate(
                enc_image, 
                "Describe this image briefly.", 
                tokenizer=tokenizer,
                max_new_tokens=64
            )[0]
        
        print(f"Final Result: {answer}")
        with open("vision_result.txt", "w") as f:
            f.write(answer)
    except Exception as e:
        print(f"Error during inference: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    try:
        run_test()
    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()
