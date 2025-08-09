#!/bin/bash

# 🚀 Script de Despliegue Automático - Portfolio Angular
# Autor: JeeP_
# Fecha: Enero 2025

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes coloreados
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner
echo -e "${BLUE}"
echo "╔══════════════════════════════════════╗"
echo "║       PORTFOLIO DEPLOYMENT TOOL      ║"
echo "║              by JeeP_                ║"
echo "╚══════════════════════════════════════╝"
echo -e "${NC}"

# Verificar si estamos en el directorio correcto
if [ ! -f "angular.json" ]; then
    print_error "No se encontró angular.json. Asegúrate de estar en el directorio del proyecto."
    exit 1
fi

print_status "Verificando estado del repositorio..."

# Verificar si hay cambios sin commitear
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Hay cambios sin commitear."
    
    read -p "¿Deseas hacer commit de los cambios? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Agregando archivos..."
        git add .
        
        read -p "Ingresa el mensaje de commit: " commit_message
        if [ -z "$commit_message" ]; then
            commit_message="Update portfolio - $(date '+%Y-%m-%d %H:%M')"
        fi
        
        print_status "Haciendo commit: $commit_message"
        git commit -m "$commit_message"
        
        print_status "Subiendo cambios a master..."
        git push origin master
        print_success "Cambios subidos a master"
    else
        print_warning "Continuando sin hacer commit..."
    fi
fi

# Asegurarse de estar en master
current_branch=$(git branch --show-current)
if [ "$current_branch" != "master" ]; then
    print_status "Cambiando a rama master..."
    git checkout master
fi

print_status "Limpiando builds anteriores..."
if [ -d "dist" ]; then
    rm -rf dist/
    print_success "Directorio dist/ eliminado"
fi

print_status "Construyendo para producción..."
ng build --configuration production

if [ $? -ne 0 ]; then
    print_error "Error en el build. Revisa los errores de Angular."
    exit 1
fi

print_success "Build completado exitosamente"

# Verificar que el directorio de build existe
if [ ! -d "dist/portafolio/browser" ]; then
    print_error "No se encontró el directorio de build: dist/portafolio/browser"
    exit 1
fi

print_status "Verificando base href..."
index_file="dist/portafolio/browser/index.html"

if [ -f "$index_file" ]; then
    current_base_href=$(grep -o '<base href="[^"]*"' "$index_file" | sed 's/<base href="//; s/"//')
    print_status "Base href actual: $current_base_href"
    
    if [ "$current_base_href" != "/portfolio/" ]; then
        print_warning "Base href incorrecto. Corrigiendo..."
        
        # Crear backup
        cp "$index_file" "$index_file.backup"
        
        # Corregir base href
        sed -i 's|<base href="[^"]*"|<base href="/portfolio/"|' "$index_file"
        
        new_base_href=$(grep -o '<base href="[^"]*"' "$index_file" | sed 's/<base href="//; s/"//')
        print_success "Base href corregido a: $new_base_href"
    else
        print_success "Base href correcto"
    fi
else
    print_error "No se encontró index.html en el build"
    exit 1
fi

print_status "Desplegando a GitHub Pages..."
npx angular-cli-ghpages --dir=dist/portafolio/browser --no-silent

if [ $? -eq 0 ]; then
    print_success "¡Despliegue completado exitosamente!"
    echo
    print_status "Tu portfolio está disponible en:"
    echo -e "${GREEN}🌐 https://jeep12.github.io/portfolio${NC}"
    echo
    print_status "Recomendaciones post-despliegue:"
    echo "  1. Visita el sitio para verificar que todo funciona"
    echo "  2. Verifica la consola del navegador para errores 404"
    echo "  3. Prueba la navegación entre páginas"
    echo "  4. Verifica que las imágenes cargan correctamente"
else
    print_error "Error durante el despliegue"
    exit 1
fi

# Limpiar archivos temporales
if [ -f "$index_file.backup" ]; then
    rm "$index_file.backup"
fi

print_success "¡Proceso completado! 🎉"
