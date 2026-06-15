import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from flask import Blueprint, render_template, request, redirect, session, url_for
from models.database import get_db
from services.auth_service import generate_jwt_token
from utils.helpers import hash_password

auth_bp = Blueprint('auth', __name__)

@auth_bp.route("/")
def home():
    if session.get("role") == "admin":
        return redirect("/admin")
    if session.get("role") == "user":
        return redirect("/scanner")
    return redirect("/login")

@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    error = None
    db = get_db()
    response = db.table('empleado').select('*').order('nombre').execute()
    empleados = response.data

    if request.method == "POST":
        login_type = request.form.get("login_type")

        if login_type == "admin":
            username = request.form.get("username", "").strip()
            password = request.form.get("password", "")
            response = db.table('admin').select('*').eq('nombre', username).eq('password', password).execute()
            admins = response.data
            
            if admins:
                admin = admins[0]
                token = generate_jwt_token("admin", admin["id"], admin["nombre"])
                response = redirect("/admin")
                response.set_cookie('jwt_token', token, max_age=60*60*24*7, httponly=False)
                return response

            error = "Usuario o contraseña incorrectos"

        elif login_type == "user":
            empleado_id = request.form.get("empleado_id")
            if not empleado_id:
                error = "Debes seleccionar un empleado para iniciar sesión"
            else:
                response = db.table('empleado').select('*').eq('id', empleado_id).execute()
                empleados_data = response.data
                if not empleados_data:
                    error = "Empleado no válido"
                else:
                    empleado = empleados_data[0]
                    token = generate_jwt_token("user", empleado["id"], empleado["nombre"])
                    response = redirect("/scanner")
                    response.set_cookie('jwt_token', token, max_age=60*60*24*7, httponly=False)
                    return response

        else:
            error = "Selecciona un tipo de inicio de sesión válido"

    return render_template("login.html", error=error, empleados=empleados)

@auth_bp.route("/logout")
def logout():
    response = redirect("/login")
    response.delete_cookie('jwt_token')
    session.clear()
    return response
