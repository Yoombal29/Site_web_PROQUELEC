1. Cerveau Expert (Cœur de l'IA & Chat)
Port : 8002 | Modèle : Phi-3.5 + LoRA Proquelec

powershell
$env:IPEX_XPU_MEMORY_POOL_LIMIT="0.75"; $env:PYTORCH_XPU_ALLOC_CONF="max_split_size_mb:32"; .\.venv_arc\Scripts\python.exe server.py

2. Vision Cortex (Analyse d'images/photos)
Port : 8003 | Modèle : Moondream2 (Optimisé XPU)

powershell
$env:IPEX_XPU_MEMORY_POOL_LIMIT="0.75"; .\.venv_arc\Scripts\python.exe server_vision.py

3. Image Cortex (Génération de schémas techniques)
$env:IPEX_XPU_MEMORY_POOL_LIMIT="0.75"; .\.venv_arc\Scripts\python.exe server_image_sdxl.py