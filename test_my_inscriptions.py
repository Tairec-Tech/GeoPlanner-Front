#!/usr/bin/env python3
"""
Script de prueba para verificar el endpoint /posts/my-inscriptions
"""

import requests
import json

# Configuración
BASE_URL = "http://127.0.0.1:8000"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjY0MDRiNS05MjljLTRjYzItODM4OS02MWJjZWU5OTU0MDciLCJleHAiOjE3NTY1OTY0MTB9.TfJHzKOIncwOwGTt7kENuTxnYv5wU6hM239iy5xLDp8"

def test_my_inscriptions():
    """Prueba el endpoint /posts/my-inscriptions"""
    
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {TOKEN}"
    }
    
    try:
        print("🔍 Probando endpoint /posts/my-inscriptions...")
        print(f"URL: {BASE_URL}/posts/my-inscriptions")
        print(f"Headers: {headers}")
        
        response = requests.get(f"{BASE_URL}/posts/my-inscriptions", headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Éxito! Respuesta:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
        else:
            print("❌ Error! Respuesta:")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Error de conexión: No se pudo conectar al servidor")
        print("Asegúrate de que el servidor esté ejecutándose en http://127.0.0.1:8000")
    except Exception as e:
        print(f"❌ Error inesperado: {str(e)}")

def test_other_endpoints():
    """Prueba otros endpoints para verificar que el servidor funciona"""
    
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {TOKEN}"
    }
    
    try:
        print("\n🔍 Probando endpoint raíz...")
        response = requests.get(f"{BASE_URL}/", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        print("\n🔍 Probando endpoint /posts/...")
        response = requests.get(f"{BASE_URL}/posts/", headers=headers)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Posts encontrados: {len(data)}")
        else:
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("🚀 Iniciando pruebas del endpoint my-inscriptions...")
    print("=" * 50)
    
    test_other_endpoints()
    test_my_inscriptions()
    
    print("\n" + "=" * 50)
    print("🏁 Pruebas completadas")
