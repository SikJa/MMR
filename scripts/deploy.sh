#!/bin/bash
# Script de deploy para MMR SaaS

echo "🚀 Iniciando deploy de MMR SaaS..."

# Verificar que estamos en la rama correcta
BRANCH=$(git branch --show-current)
echo "📍 Rama actual: $BRANCH"

if [ "$BRANCH" != "main" ]; then
    echo "⚠️  No estás en la rama main. ¿Continuar? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        echo "❌ Deploy cancelado"
        exit 1
    fi
fi

# Verificar archivos necesarios
echo "🔍 Verificando archivos necesarios..."

required_files=(
    "requirements.txt"
    "render.yaml"
    "Procfile"
    "runtime.txt"
    "app/app.py"
    "app/config.py"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Archivo faltante: $file"
        exit 1
    fi
done

echo "✅ Todos los archivos necesarios están presentes"

# Verificar que .env no esté en el repo
if [ -f ".env" ]; then
    if git ls-files --error-unmatch .env > /dev/null 2>&1; then
        echo "❌ PELIGRO: .env está en el repositorio. Elimínalo antes de continuar."
        exit 1
    fi
fi

# Actualizar requirements.txt
echo "📦 Actualizando requirements.txt..."
pip freeze > requirements.txt

# Agregar cambios a git
echo "📝 Agregando cambios a git..."
git add .

# Verificar si hay cambios
if git diff --staged --quiet; then
    echo "ℹ️  No hay cambios para commitear"
else
    echo "💾 Commiteando cambios..."
    git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Push a GitHub
echo "🔄 Subiendo a GitHub..."
git push origin $BRANCH

echo "✅ Deploy completado!"
echo "🌐 Tu aplicación se desplegará automáticamente en Render"
echo "📊 Puedes monitorear el progreso en: https://dashboard.render.com"