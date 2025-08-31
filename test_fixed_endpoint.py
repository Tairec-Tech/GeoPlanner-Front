#!/usr/bin/env python3
"""
Script de prueba para verificar que el endpoint /posts/my-inscriptions funciona después de la corrección
"""

import requests
import json

# Configuración
BASE_URL = "http://127.0.0.1:8000"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjY0MDRiNS05MjljLTRjYzItODM4OS02MWJjZWU5OTU0MDciLCJleHAiOjE3NTY1OTY0MTB9.TfJHzKOIncwOwGTt7kENuTxnYv5wU6hM239iy5xLDp8"

def test_my_inscriptions_fixed():
    """Prueba el endpoint /posts/my-inscriptions después de la corrección"""
    
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {TOKEN}"
    }
    
    try:
        print("🔍 Probando endpoint /posts/my-inscriptions (CORREGIDO)...")
        print(f"URL: {BASE_URL}/posts/my-inscriptions")
        
        response = requests.get(f"{BASE_URL}/posts/my-inscriptions", headers=headers)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Éxito! Endpoint funciona correctamente")
            print(f"📊 Inscripciones encontradas: {len(data)}")
            
            if data:
                print("\n📋 Detalles de la primera inscripción:")
                inscription = data[0]
                print(f"   🆔 ID: {inscription['id']}")
                print(f"   👤 Usuario: {inscription['id_usuario']}")
                print(f"   📝 Publicación: {inscription['id_publicacion']}")
                print(f"   📅 Fecha: {inscription['fecha_inscripcion']}")
                print(f"   🎯 Estado: {inscription['estado_asistencia']}")
                
                if 'publicacion' in inscription:
                    pub = inscription['publicacion']
                    print(f"   📄 Texto: {pub['texto'][:50]}...")
                    print(f"   🏷️  Tipo: {pub['tipo']}")
                    print(f"   🔒 Privacidad: {pub['privacidad']}")
                    
                    if 'autor' in pub:
                        autor = pub['autor']
                        print(f"   👨‍💼 Autor: {autor['nombre']} {autor['apellido']}")
                        print(f"   🆔 Username: @{autor['username']}")
                        print(f"   📸 Foto: {autor['foto_perfil'] or 'Sin foto'}")
            else:
                print("ℹ️  No hay inscripciones para mostrar")
        else:
            print("❌ Error! Respuesta:")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Error de conexión: No se pudo conectar al servidor")
        print("Asegúrate de que el servidor esté ejecutándose en http://127.0.0.1:8000")
    except Exception as e:
        print(f"❌ Error inesperado: {str(e)}")

def test_qr_generation():
    """Prueba la generación de QR después de la corrección"""
    
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {TOKEN}"
    }
    
    try:
        print("\n🔍 Probando generación de QR...")
        
        # Obtener inscripciones
        response = requests.get(f"{BASE_URL}/posts/my-inscriptions", headers=headers)
        
        if response.status_code == 200:
            inscriptions = response.json()
            
            if inscriptions:
                inscription = inscriptions[0]
                event_id = inscription["id_publicacion"]
                user_id = inscription["id_usuario"]
                
                print(f"🎯 Generando QR para evento: {event_id}")
                
                # Generar QR
                qr_response = requests.post(
                    f"{BASE_URL}/qr-attendance/generate-qr/{event_id}/{user_id}",
                    headers=headers
                )
                
                print(f"QR Status Code: {qr_response.status_code}")
                
                if qr_response.status_code == 200:
                    qr_data = qr_response.json()
                    print("✅ QR generado exitosamente!")
                    print(f"📱 QR Data: {qr_data['qr_code_data'][:100]}...")
                    print(f"🖼️  QR Image Base64: {qr_data['qr_image_base64'][:50]}...")
                    print(f"🆔 Inscription ID: {qr_data['inscription_id']}")
                else:
                    print("❌ Error generando QR:")
                    print(qr_response.text)
            else:
                print("⚠️  No hay inscripciones para generar QR")
        else:
            print("❌ Error obteniendo inscripciones para QR")
            
    except Exception as e:
        print(f"❌ Error inesperado en QR: {str(e)}")

if __name__ == "__main__":
    print("🚀 Iniciando pruebas del endpoint corregido...")
    print("=" * 60)
    
    test_my_inscriptions_fixed()
    test_qr_generation()
    
    print("\n" + "=" * 60)
    print("🏁 Pruebas completadas")
