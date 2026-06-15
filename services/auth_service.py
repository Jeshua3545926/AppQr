import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import jwt
from datetime import datetime, timedelta
from flask import request
from config import JWT_SECRET

def generate_jwt_token(role, user_id, username):
    """Generar token JWT"""
    payload = {
        'role': role,
        'user_id': user_id,
        'username': username,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

def verify_jwt_token(token):
    """Verificar token JWT"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        print(f"DEBUG: Token verified successfully. Payload: {payload}")
        return payload
    except jwt.ExpiredSignatureError:
        print("DEBUG: Token expired")
        return None
    except jwt.InvalidTokenError as e:
        print(f"DEBUG: Invalid token: {e}")
        return None

def get_token_from_request():
    """Obtener token de la solicitud (header, query param o cookie)"""
    # Try to get token from Authorization header
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        print(f"DEBUG: Token from Authorization header: {auth_header[:20]}...")
        return auth_header.split(' ')[1]
    
    # Try to get token from query parameter
    token = request.args.get('token')
    if token:
        print(f"DEBUG: Token from query parameter: {token[:20]}...")
        return token
    
    # Try to get token from cookie
    token = request.cookies.get('jwt_token')
    if token:
        print(f"DEBUG: Token from cookie: {token[:20]}...")
        return token
    
    print("DEBUG: No token found in request")
    return None
