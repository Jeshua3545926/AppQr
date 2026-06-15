import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from functools import wraps
from flask import request, redirect, jsonify, url_for
from services.auth_service import get_token_from_request, verify_jwt_token

def role_required(role):
    """Decorator para verificar que el usuario tenga el rol requerido"""
    def decorator(view):
        @wraps(view)
        def wrapped_view(*args, **kwargs):
            token = get_token_from_request()
            if not token:
                print(f"DEBUG: No token found for path: {request.path}")
                if request.path.startswith('/api/'):
                    return jsonify({"ok": False, "error": "No autorizado"}), 401
                return redirect(url_for("login"))

            payload = verify_jwt_token(token)
            print(f"DEBUG: Payload for {request.path}: {payload}, required role: {role}")
            if not payload or payload.get('role') != role:
                print(f"DEBUG: Role check failed. Payload role: {payload.get('role') if payload else None}, required: {role}")
                if request.path.startswith('/api/'):
                    return jsonify({"ok": False, "error": "No autorizado"}), 403
                return redirect(url_for("login"))

            from flask import session
            session['role'] = payload['role']
            session['user_id'] = payload['user_id']
            session['username'] = payload['username']

            return view(*args, **kwargs)
        return wrapped_view
    return decorator

login_required = role_required("admin")
