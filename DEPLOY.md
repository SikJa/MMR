# 🚀 GUÍA DE DEPLOY - MMR SaaS

## 📋 ARCHIVOS CREADOS PARA DEPLOY

### ✅ Archivos de Configuración
- `requirements.txt` - Dependencias Python
- `render.yaml` - Configuración de Render
- `Procfile` - Comando de inicio
- `runtime.txt` - Versión de Python
- `.gitignore` - Archivos a ignorar
- `.env.example` - Plantilla de variables de entorno

### ✅ Configuración de Aplicación
- `app/config.py` - Configuraciones por entorno
- `scripts/init_db.py` - Inicialización de BD
- `scripts/deploy.sh` - Script de deploy
- `Dockerfile` - Para contenedores (opcional)

## 🚀 PASOS PARA DEPLOY

### 1. Preparar Repositorio Git
```bash
# Inicializar git (si no está inicializado)
git init

# Agregar archivos
git add .
git commit -m "Initial commit for Render deploy"

# Crear repositorio en GitHub y conectar
git remote add origin https://github.com/tu-usuario/mmr-saas.git
git push -u origin main
```

### 2. Configurar Render
1. Ve a [render.com](https://render.com) y crea una cuenta
2. Conecta tu cuenta de GitHub
3. Click "New +" → "Web Service"
4. Selecciona tu repositorio `mmr-saas`
5. Render detectará automáticamente `render.yaml`

### 3. Variables de Entorno en Render
En el dashboard de Render, agrega estas variables:

```bash
# Obligatorias
SECRET_KEY=tu-clave-secreta-super-segura
FLASK_ENV=production

# Opcionales (para funciones avanzadas)
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

### 4. Deploy Automático
- Render detectará cambios en GitHub automáticamente
- Cada push a `main` triggerea un nuevo deploy
- El build toma ~5-10 minutos la primera vez

## 🔧 CONFIGURACIÓN LOCAL

### Desarrollo Local
```bash
# Copiar variables de entorno
cp .env.example .env

# Editar .env con tus valores
# Instalar dependencias
pip install -r requirements.txt

# Ejecutar aplicación
python app/app.py
```

## 📊 MONITOREO

### URLs Importantes
- **Aplicación**: `https://tu-app.onrender.com`
- **Health Check**: `https://tu-app.onrender.com/health`
- **Dashboard**: `https://dashboard.render.com`

### Logs
```bash
# Ver logs en tiempo real desde Render dashboard
# O usar Render CLI:
render logs -s tu-servicio
```

## ⚠️ PROBLEMAS COMUNES

### 1. Build Falla
- Verificar `requirements.txt`
- Revisar logs de build en Render
- Asegurar que Python 3.9 esté especificado

### 2. App No Inicia
- Verificar `Procfile`
- Revisar variables de entorno
- Verificar health check endpoint

### 3. Base de Datos
- Verificar DATABASE_URL en variables de entorno
- Ejecutar script de inicialización si es necesario

### 4. Archivos Estáticos
- Verificar rutas en `app.py`
- Asegurar que archivos estén en git

## 🔄 ACTUALIZACIONES

### Deploy Automático
```bash
# Hacer cambios en código
git add .
git commit -m "Nueva funcionalidad"
git push origin main
# Render redeploya automáticamente
```

### Deploy Manual
```bash
# Usar script incluido
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## 📈 ESCALAMIENTO

### Plan Gratuito → Pro
1. En Render dashboard → Settings
2. Cambiar plan a "Pro" ($7/mes)
3. Configurar auto-scaling si es necesario

### Base de Datos
1. Crear PostgreSQL database en Render
2. Copiar DATABASE_URL a variables de entorno
3. Ejecutar migraciones si es necesario

## 🛡️ SEGURIDAD

### Variables de Entorno
- ✅ SECRET_KEY generada automáticamente
- ✅ .env excluido de git
- ✅ Configuración por entornos

### HTTPS
- ✅ SSL automático en Render
- ✅ Redirección HTTP → HTTPS

## 📞 SOPORTE

Si tienes problemas:
1. Revisar logs en Render dashboard
2. Verificar configuración en `render.yaml`
3. Comprobar variables de entorno
4. Revisar este documento

---

**¡Tu aplicación está lista para producción!** 🎉