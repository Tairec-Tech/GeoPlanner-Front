@echo off
echo Iniciando GeoPlanner en modo desarrollo...
echo.

echo [1/3] Verificando dependencias del frontend...
cd GeoPlanner-Front
if not exist node_modules (
    echo Instalando dependencias del frontend...
    npm install
)

echo [2/3] Verificando dependencias del backend...
cd ..\Geoplanner-Back
if not exist venv (
    echo Creando entorno virtual para el backend...
    python -m venv venv
)
call venv\Scripts\activate
if not exist requirements.txt (
    echo Error: No se encontró requirements.txt en el backend
    pause
    exit /b 1
)
pip install -r requirements.txt

echo [3/3] Iniciando servidores...
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000
echo.
echo Presiona Ctrl+C para detener ambos servidores
echo.

start "GeoPlanner Frontend" cmd /k "cd GeoPlanner-Front && npm run dev"
start "GeoPlanner Backend" cmd /k "cd Geoplanner-Back && venv\Scripts\activate && python run.py"

echo Servidores iniciados correctamente!
pause
