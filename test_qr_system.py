#!/usr/bin/env python3
"""
Script de prueba para verificar el sistema de QR
"""

import requests
import json

# Configuración
BASE_URL = "http://127.0.0.1:8000"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjY0MDRiNS05MjljLTRjYzItODM4OS02MWJjZWU5OTU0MDciLCJleHAiOjE3NTY1OTY0MTB9.TfJHzKOIncwOwGTt7kENuTxnYv5wU6hM239iy5xLDp8"

def test_generate_qr():
    """Prueba la generación de QR"""
    
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {TOKEN}"
    }
    
    try:
        print("🔍 Probando generación de QR...")
        
        # Primero obtener las inscripciones del usuario
        response = requests.get(f"{BASE_URL}/posts/my-inscriptions", headers=headers)
        
        if response.status_code == 200:
            inscriptions = response.json()
            print(f"✅ Inscripciones encontradas: {len(inscriptions)}")
            
            if inscriptions:
                # Usar la primera inscripción para generar QR
                inscription = inscriptions[0]
                event_id = inscription["id_publicacion"]
                user_id = inscription["id_usuario"]
                
                print(f"🎯 Generando QR para evento: {event_id}")
                print(f"👤 Usuario: {user_id}")
                
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
            print("❌ Error obteniendo inscripciones:")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Error inesperado: {str(e)}")

def test_qr_verification():
    """Prueba la verificación de QR"""
    
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {TOKEN}"
    }
    
    try:
        print("\n🔍 Probando verificación de QR...")
        
        # Primero generar un QR
        response = requests.get(f"{BASE_URL}/posts/my-inscriptions", headers=headers)
        
        if response.status_code == 200:
            inscriptions = response.json()
            
            if inscriptions:
                inscription = inscriptions[0]
                event_id = inscription["id_publicacion"]
                user_id = inscription["id_usuario"]
                
                # Generar QR
                qr_response = requests.post(
                    f"{BASE_URL}/qr-attendance/generate-qr/{event_id}/{user_id}",
                    headers=headers
                )
                
                if qr_response.status_code == 200:
                    qr_data = qr_response.json()
                    
                    # Verificar QR
                    verification_data = {
                        "qr_data": qr_data["qr_code_data"],
                        "verificador_id": user_id,  # El mismo usuario como verificador
                        "ubicacion_lat": 19.4326,
                        "ubicacion_lng": -99.1332,
                        "notas": "Prueba de verificación"
                    }
                    
                    verify_response = requests.post(
                        f"{BASE_URL}/qr-attendance/verify-qr",
                        headers={"Content-Type": "application/json", "Authorization": f"Bearer {TOKEN}"},
                        json=verification_data
                    )
                    
                    print(f"Verificación Status Code: {verify_response.status_code}")
                    
                    if verify_response.status_code == 200:
                        verify_data = verify_response.json()
                        print("✅ QR verificado exitosamente!")
                        print(f"📊 Resultado: {verify_data}")
                    else:
                        print("❌ Error verificando QR:")
                        print(verify_response.text)
                else:
                    print("❌ No se pudo generar QR para la prueba")
            else:
                print("⚠️  No hay inscripciones para probar verificación")
        else:
            print("❌ Error obteniendo inscripciones para verificación")
            
    except Exception as e:
        print(f"❌ Error inesperado en verificación: {str(e)}")

def test_attendance_history():
    """Prueba el historial de asistencia"""
    
    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {TOKEN}"
    }
    
    try:
        print("\n🔍 Probando historial de asistencia...")
        
        # Obtener publicaciones del usuario
        response = requests.get(f"{BASE_URL}/posts/", headers=headers)
        
        if response.status_code == 200:
            posts = response.json()
            
            if posts:
                # Usar la primera publicación del usuario
                post = posts[0]
                event_id = post["id"]
                
                print(f"📊 Obteniendo historial para evento: {event_id}")
                
                history_response = requests.get(
                    f"{BASE_URL}/qr-attendance/historial/{event_id}",
                    headers=headers
                )
                
                print(f"Historial Status Code: {history_response.status_code}")
                
                if history_response.status_code == 200:
                    history_data = history_response.json()
                    print(f"✅ Historial obtenido: {len(history_data)} registros")
                    if history_data:
                        print(f"📋 Primer registro: {history_data[0]}")
                else:
                    print("❌ Error obteniendo historial:")
                    print(history_response.text)
            else:
                print("⚠️  No hay publicaciones para probar historial")
        else:
            print("❌ Error obteniendo publicaciones")
            
    except Exception as e:
        print(f"❌ Error inesperado en historial: {str(e)}")

if __name__ == "__main__":
    print("🚀 Iniciando pruebas del sistema de QR...")
    print("=" * 50)
    
    test_generate_qr()
    test_qr_verification()
    test_attendance_history()
    
    print("\n" + "=" * 50)
    print("🏁 Pruebas del sistema QR completadas")
