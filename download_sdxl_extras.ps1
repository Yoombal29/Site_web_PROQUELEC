$token = "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"
$base_dir = "haystack_backend\.cache\sdxl-turbo"

# 1. Text Encoder 1 (FP16) - ~685 MB
Write-Host "📥 Téléchargement Text Encoder 1 (FP16)..."
$dest = "$base_dir\text_encoder\model.fp16.safetensors"
New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
& curl.exe -L -C - -H "Authorization: Bearer $token" -o $dest "https://huggingface.co/stabilityai/sdxl-turbo/resolve/main/text_encoder/model.fp16.safetensors"

# 2. Text Encoder 2 (FP16) - ~1.39 GB
Write-Host "📥 Téléchargement Text Encoder 2 (FP16)..."
$dest = "$base_dir\text_encoder_2\model.fp16.safetensors"
New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
& curl.exe -L -C - -H "Authorization: Bearer $token" -o $dest "https://huggingface.co/stabilityai/sdxl-turbo/resolve/main/text_encoder_2/model.fp16.safetensors"

# 3. VAE (FP16) - ~167 MB
Write-Host "📥 Téléchargement VAE (FP16)..."
$dest = "$base_dir\vae\diffusion_pytorch_model.fp16.safetensors"
New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
& curl.exe -L -C - -H "Authorization: Bearer $token" -o $dest "https://huggingface.co/stabilityai/sdxl-turbo/resolve/main/vae/diffusion_pytorch_model.fp16.safetensors"

Write-Host "✅ Tous les composants SDXL sont prêts !"
