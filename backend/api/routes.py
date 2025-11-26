from flask import Blueprint, request, jsonify # type: ignore
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, get_current_user # type: ignore
from werkzeug.security import generate_password_hash, check_password_hash # type: ignore
from api.models import db, Jefatura, Zona, Dependencia, Usuario, Turno, Guardia, Licencia, PasswordResetToken, Notificacion, Suscripcion
import secrets
from datetime import datetime, timedelta
from .utils.email_utils import send_email
from pywebpush import webpush, WebPushException # type: ignore
import json  

api = Blueprint("api", __name__)

VAPID_PUBLIC_KEY = "BOv4kW68bvJn-1UMmf90hsycVfvmqqWW45zANVv4S799NLDZ1bHH1QrnhMkvrgQ0mVY5i79DYZoZKfRHUaITYNc="
VAPID_PRIVATE_KEY = "6uq6q6d5M2n5BeSw3leoGMnFVQH4n_9LVsEj0AQqojE="


# -------------------------------------------------------------------
# JEFATURA
# -------------------------------------------------------------------
@api.route('/jefaturas', methods=['POST'])
@jwt_required()
def crear_jefatura():
    body = request.json
    nombre = body.get("nombre")
    if not nombre:
        return jsonify({"error": "Falta nombre"}), 400
    nueva = Jefatura(nombre=nombre)
    db.session.add(nueva)
    db.session.commit()
    return jsonify(nueva.serialize()), 201

@api.route('/jefaturas', methods=['GET'])
def listar_jefaturas():
    data = Jefatura.query.all()
    return jsonify([x.serialize() for x in data]), 200

@api.route('/jefaturas/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_jefatura(id):
    jefatura = Jefatura.query.get(id)
    db.session.delete(jefatura)
    db.session.commit()
    return jsonify({'status': 'ok'}), 200

# -------------------------------------------------------------------
# ZONA
# -------------------------------------------------------------------
@api.route('/zonas', methods=['POST'])
@jwt_required()
def crear_zona():
    body = request.json
    nombre = body.get("nombre")
    jefatura_id = body.get("jefatura_id")
    descripcion = body.get("descripcion")

    nueva = Zona(nombre=nombre, jefatura_id=jefatura_id, descripcion=descripcion)
    db.session.add(nueva)
    db.session.commit()
    return jsonify(nueva.serialize()), 201

@api.route('/zonas', methods=['GET'])
def listar_zonas():
    data = Zona.query.all()
    return jsonify([x.serialize() for x in data]), 200

@api.route('/zonas/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_zona(id):
    zona = Zona.query.get(id)
    db.session.delete(zona)
    db.session.commit()
    return jsonify({'status': 'ok'}), 200

# -------------------------------------------------------------------
# DEPENDENCIA
# -------------------------------------------------------------------
@api.route('/dependencias', methods=['POST'])
@jwt_required()
def crear_dependencia():
    body = request.json
    nombre = body.get("nombre")
    descripcion = body.get("descripcion")
    zona_id = body.get("zona_id")
    nueva = Dependencia(nombre=nombre, descripcion=descripcion, zona_id=zona_id)
    db.session.add(nueva)
    db.session.commit()
    return jsonify(nueva.serialize()), 201

@api.route('/dependencias', methods=['GET'])
def listar_dependencias():
    data = Dependencia.query.all()
    return jsonify([x.serialize() for x in data]), 200

@api.route('/dependencias/<int:id>', methods=['GET'])
def obtener_dependencia(id):
    dependencia = Dependencia.query.get(id)
    return jsonify(dependencia.serialize()), 200

@api.route('/dependencias/<int:id>', methods=['PUT'])
@jwt_required()
def actualizar_dependencia(id):
    body = request.json
    dependencia = Dependencia.query.get(id)
    if not dependencia:
        return jsonify({"error": "Dependencia no encontrada"}), 404
    dependencia.nombre = body.get("nombre")
    dependencia.descripcion = body.get("descripcion")
    db.session.commit()
    return jsonify(dependencia.serialize()), 200

@api.route('/dependencias/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_dependencia(id):
    dependencia = Dependencia.query.get(id)
    db.session.delete(dependencia)
    db.session.commit()
    return jsonify({'status': 'ok'}), 200

# -------------------------------------------------------------------
# TURNOS
# -------------------------------------------------------------------
@api.route('/turnos', methods=['POST'])
@jwt_required()
def crear_turno():
    body = request.json
    nombre = body.get("nombre")
    hora_inicio = body.get("hora_inicio")
    hora_fin = body.get("hora_fin")
    descripcion = body.get("descripcion")
    dependencia_id = body.get("dependencia_id")

    nuevo = Turno(
        nombre=nombre,
        hora_inicio=hora_inicio,
        hora_fin=hora_fin,
        descripcion=descripcion,
        dependencia_id=dependencia_id
    )
    db.session.add(nuevo)
    db.session.commit()
    return jsonify(nuevo.serialize()), 201

@api.route('/turnos/<int:id>', methods=['PUT'])
@jwt_required()
def actualizar_turno(id):
    body = request.json
    turno = Turno.query.get(id)
    if not turno:
        return jsonify({"error": "Turno no encontrado"}), 404
    turno.nombre = body.get("nombre")
    turno.hora_inicio = body.get("hora_inicio")
    turno.hora_fin = body.get("hora_fin")
    turno.descripcion = body.get("descripcion")
    turno.dependencia_id = body.get("dependencia_id")
    db.session.commit()
    return jsonify(turno.serialize()), 200


@api.route('/turnos', methods=['GET'])
def listar_turnos():
    dependencia_id = request.args.get('dependencia_id', type=int)
    if dependencia_id:
        turnos = Turno.query.filter_by(dependencia_id=dependencia_id).all()
    else:
        turnos = Turno.query.all()
    return jsonify([t.serialize() for t in turnos]), 200

@api.route('/turnos/<int:turno_id>', methods=['DELETE'])
@jwt_required()
def eliminar_turno(turno_id):
    turno = Turno.query.get(turno_id)
    if not turno:
        return jsonify({"error": "Turno no encontrado"}), 404
    db.session.delete(turno)
    db.session.commit()
    return jsonify({"turno": turno.serialize()}), 200

# -------------------------------------------------------------------
# GUARDIAS
# -------------------------------------------------------------------
@api.route('/guardias', methods=['POST'])
@jwt_required()
def crear_guardia():
    body = request.json
    usuario_id = body.get("usuario_id")
    fecha_inicio = body.get("fecha_inicio")
    fecha_fin = body.get("fecha_fin")
    tipo = body.get("tipo")
    comentario = body.get("comentario")

    nueva = Guardia(usuario_id=usuario_id, fecha_inicio=fecha_inicio, fecha_fin=fecha_fin, tipo=tipo, comentario=comentario)
    db.session.add(nueva)
    db.session.commit()
    return jsonify(nueva.serialize()), 201

@api.route('/guardias/<int:id>', methods=['PUT'])
@jwt_required()
def actualizar_guardia(id):
    body = request.json
    guardia = Guardia.query.get(id)
    if not guardia:
        return jsonify({"error": "Guardia no encontrada"}), 404

    guardia.usuario_id = body.get("usuario_id")
    guardia.fecha_inicio = body.get("fecha_inicio")
    guardia.fecha_fin = body.get("fecha_fin")
    guardia.tipo = body.get("tipo")
    guardia.comentario = body.get("comentario")

    db.session.commit()
    return jsonify(guardia.serialize()), 200

@api.route('/guardias/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_guardia(id):
    guardia = Guardia.query.get(id)
    db.session.delete(guardia)
    db.session.commit()
    return jsonify({'status': 'ok'}), 200

@api.route('/guardias', methods=['GET'])
def listar_guardias():
    data = Guardia.query.all()
    return jsonify([x.serialize() for x in data]), 200

# -------------------------------------------------------------------
# LICENCIAS
# -------------------------------------------------------------------
@api.route('/licencias', methods=['POST'])
@jwt_required()
def crear_licencia():
    body = request.json
    usuario_id = body.get("usuario_id")
    fecha_inicio = body.get("fecha_inicio")
    fecha_fin = body.get("fecha_fin")
    tipo = body.get("tipo")
    motivo = body.get("motivo")
    estado = body.get("estado")

    nueva = Licencia(usuario_id=usuario_id, fecha_inicio=fecha_inicio, fecha_fin=fecha_fin, tipo=tipo, motivo=motivo, estado=estado)
    db.session.add(nueva)
    db.session.commit()
    return jsonify(nueva.serialize()), 201

@api.route('/licencias/<int:id>', methods=['PUT'])
@jwt_required()
def actualizar_licencia(id):
    body = request.json
    licencia = Licencia.query.get(id)
    if not licencia:
        return jsonify({"error": "Licencia no encontrada"}), 404

    licencia.usuario_id = body.get("usuario_id")
    licencia.fecha_inicio = body.get("fecha_inicio")
    licencia.fecha_fin = body.get("fecha_fin")
    licencia.tipo = body.get("tipo")
    licencia.motivo = body.get("motivo")
    licencia.estado = body.get("estado")

    db.session.commit()
    return jsonify(licencia.serialize()), 200

@api.route('/licencias/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_licencia(id):
    licencia = Licencia.query.get(id)
    db.session.delete(licencia)
    db.session.commit()
    return jsonify({'status': 'ok'}), 200

@api.route('/licencias', methods=['GET'])
def listar_licencias():
    data = Licencia.query.all()
    return jsonify([x.serialize() for x in data]), 200

@api.route("/usuarios/<int:usuario_id>/licencias", methods=["GET"])
def obtener_todas_licencias_usuario(usuario_id):
    usuario = Usuario.query.get_or_404(usuario_id)

    return jsonify({
        "licencias": [l.serialize() for l in usuario.licencias],
        "licencias_medicas": [lm.serialize() for lm in usuario.licencias_medicas],
    })

# -------------------------------------------------------------------
# USUARIOS
# -------------------------------------------------------------------
@api.route('/usuarios', methods=['POST'])
@jwt_required()
def crear_usuario():

    body = request.json
    grado = body.get("grado")
    nombre = body.get("nombre")
    correo = body.get("correo")
    password = body.get("password")
    rol_jerarquico = body.get("rol_jerarquico")
    fecha_ingreso = body.get("fecha_ingreso")
    dependencia_id = body.get("dependencia_id")
    zona_id = body.get("zona_id")
    estado = body.get("estado")
    is_admin = body.get("is_admin")
    turno_id = body.get("turno_id")


    ROLES_VALIDOS = ['JEFE_ZONA', 'ADMINISTRADOR', 'FUNCIONARIO', 'JEFE_DEPENDENCIA']

    if not grado or not nombre or not correo or not password or not rol_jerarquico:
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    if rol_jerarquico not in ROLES_VALIDOS:
        return jsonify({
            "error": f"Rol jerárquico inválido. Debe ser uno de: {', '.join(ROLES_VALIDOS)}"
        }), 400

    if Usuario.query.filter_by(correo=correo).first():
        return jsonify({"error": "El correo ya está en uso"}), 400

    if rol_jerarquico == 'JEFE_ZONA':
        if not zona_id:
            return jsonify({"error": "Un jefe de zona debe tener zona_id"}), 400
        dependencia_id = None

    elif rol_jerarquico == 'ADMINISTRADOR':
        if dependencia_id or zona_id:
            return jsonify({
                "error": "Un administrador no debe tener dependencia_id ni zona_id"
            }), 400
        dependencia_id = None
        zona_id = None

    else: 
        if not dependencia_id:
            return jsonify({
                "error": f"Un usuario con rol {rol_jerarquico} debe tener dependencia_id"
            }), 400
        zona_id = None

    password_hash = generate_password_hash(password)

    nuevo_usuario = Usuario(
        grado=grado,
        nombre=nombre,
        correo=correo,
        password=password_hash,
        rol_jerarquico=rol_jerarquico,
        fecha_ingreso=fecha_ingreso,
        dependencia_id=dependencia_id,
        zona_id=zona_id,
        is_admin=is_admin,
        estado=estado,
        turno_id=turno_id
    )

    db.session.add(nuevo_usuario)
    db.session.commit()

    return jsonify(nuevo_usuario.serialize()), 201



@api.route('/usuarios', methods=['GET'])
def listar_usuarios():
    data = Usuario.query.all()
    return jsonify([x.serialize() for x in data]), 200


@api.route('/usuarios/<int:id>', methods=['GET'])
def obtener_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    return jsonify(usuario.serialize()), 200


@api.route('/usuarios/<int:id>', methods=['PUT'])
@jwt_required()
def actualizar_usuario(id):
    body = request.json

    usuario = Usuario.query.get(id)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404

    grado = body.get("grado", usuario.grado)
    nombre = body.get("nombre", usuario.nombre)
    correo = body.get("correo", usuario.correo)
    rol_jerarquico = body.get("rol_jerarquico", usuario.rol_jerarquico)
    fecha_ingreso = body.get("fecha_ingreso", usuario.fecha_ingreso)
    dependencia_id = body.get("dependencia_id", usuario.dependencia_id)
    zona_id = body.get("zona_id", usuario.zona_id)
    estado = body.get("estado", usuario.estado)
    turno_id = body.get("turno_id", usuario.turno_id)  
    is_admin = body.get("is_admin", usuario.is_admin)

    if rol_jerarquico == 'JEFE_ZONA':
        if not zona_id:
            return jsonify({"error": "Un jefe de zona debe tener zona_id"}), 400
        dependencia_id = None
    else:
        if not dependencia_id:
            return jsonify({"error": "Este usuario debe tener dependencia_id"}), 400
        zona_id = None


    usuario.grado = grado
    usuario.nombre = nombre
    usuario.correo = correo
    usuario.rol_jerarquico = rol_jerarquico
    usuario.fecha_ingreso = fecha_ingreso
    usuario.dependencia_id = dependencia_id
    usuario.zona_id = zona_id
    usuario.estado = estado
    usuario.turno_id = turno_id
    usuario.is_admin = is_admin

    db.session.commit()
    return jsonify(usuario.serialize()), 200

@api.route('/usuarios/<int:id>/cambiar-password', methods=['PUT'])
@jwt_required()
def cambiar_password(id):
    body = request.json

    current_password = body.get("current_password")
    new_password = body.get("new_password")
    confirm_password = body.get("confirm_password")

    if not current_password or not new_password or not confirm_password:
        return jsonify({"error": "Todos los campos son requeridos"}), 400


    current_user_id = int(get_jwt_identity())
    if current_user_id != id:
        return jsonify({"error": "No autorizado"}), 403

    usuario = Usuario.query.get(id)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404

    if not check_password_hash(usuario.password, current_password):
        return jsonify({"error": "La contraseña actual es incorrecta"}), 400

    if new_password != confirm_password:
        return jsonify({"error": "Las nuevas contraseñas no coinciden"}), 400

    if current_password == new_password:
        return jsonify({"error": "La nueva contraseña no puede ser igual a la actual"}), 400

    usuario.password = generate_password_hash(new_password)
    db.session.commit()

    return jsonify({"message": "Contraseña actualizada correctamente"}), 200

@api.route('/setup', methods=['POST'])
def setup_admin():
    # Verificar si ya hay usuarios
    if Usuario.query.first():
        return jsonify({"error": "Ya existe al menos un usuario. Setup bloqueado."}), 403

    data = request.json
    nombre = data.get("nombre", "Administrador")
    correo = data.get("correo")
    password = data.get("password")

    if not correo or not password:
        return jsonify({"error": "Se requieren correo y password"}), 400

    password_hash = generate_password_hash(password)

    nuevo_admin = Usuario(
        grado=0,
        nombre=nombre,
        correo=correo,
        password=password_hash,
        rol_jerarquico="ADMINISTRADOR",
        dependencia_id=None,
        zona_id=None,
        is_admin=True,
        estado="Activo",
        turno_id=None
    )

    db.session.add(nuevo_admin)
    db.session.commit()

    return jsonify({
        "msg": "Usuario administrador creado correctamente",
        "usuario": nuevo_admin.serialize()
    }), 201

@api.route('/usuarios/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_usuario(id):
    usuario = Usuario.query.get(id)
    db.session.delete(usuario)
    db.session.commit()
    return jsonify({'status': 'ok'}), 200   



# -------------------------------------------------------------------
# LOGIN
# -------------------------------------------------------------------
@api.route('/login', methods=['POST'])
def login():
    body = request.json
    correo = body.get("correo")
    password = body.get("password")

    if not correo or not password:
        return jsonify({"error": "Correo y contraseña son requeridos"}), 400

    usuario = Usuario.query.filter_by(correo=correo).first()

    if not usuario or not check_password_hash(usuario.password, password):
        return jsonify({"error": "Usuario o contraseña incorrectos"}), 401

    token = create_access_token(identity=str(usuario.id))

    return jsonify({
        "token": token,
        "usuario": usuario.serialize()
    }), 200

# -------------------------------------------------------------------
# PASSWORD RESET
# -------------------------------------------------------------------


@api.route('/auth/forgot-password', methods=['POST'])
def forgot_password():
    data = request.json
    email = data.get('email')

    if not email:
        return jsonify({"error": "El correo es requerido"}), 400

    usuario = Usuario.query.filter_by(correo=email).first()

    # Respuesta genérica para no filtrar emails
    if not usuario:
        return jsonify({"message": "Si el correo existe, se enviaron instrucciones."}), 200

    # Generar token único y fecha expiración (1 hora)
    token = secrets.token_hex(32)
    expiration = datetime.utcnow() + timedelta(hours=1)

    # Guardar token en DB
    reset_token = PasswordResetToken(
        usuario_id=usuario.id,
        token=token,
        expiration=expiration,
        usado=False
    )
    db.session.add(reset_token)
    db.session.commit()

   
    frontend_url = "http://localhost:3000"  
    reset_link = f"{frontend_url}/reset-password/{token}"

   
    send_email(
        to=email,
        subject="Restablecimiento de contraseña",
        body=f"Hola {usuario.nombre},\n\nPara restablecer tu contraseña haz click en el siguiente enlace:\n{reset_link}\n\nSi no solicitaste esto, ignora este correo."
    )

    return jsonify({"message": "Si el correo existe, se enviaron instrucciones."}), 200


@api.route('/auth/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    token = data.get('token')
    new_password = data.get('newPassword')

    if not token or not new_password:
        return jsonify({"error": "Token y nueva contraseña son requeridos."}), 400

    reset_token = PasswordResetToken.query.filter_by(token=token, usado=False).first()

    if not reset_token or reset_token.expiration < datetime.utcnow():
        return jsonify({"error": "Token inválido o expirado."}), 400

    usuario = Usuario.query.get(reset_token.usuario_id)

    if not usuario:
        return jsonify({"error": "Usuario no encontrado."}), 400


    usuario.password = generate_password_hash(new_password)
    db.session.commit()


    reset_token.usado = True
    db.session.commit()

    return jsonify({"message": "Contraseña actualizada correctamente."}), 200

# -------------------------------------------------------------------
# NOTIFICACIONES
# -------------------------------------------------------------------
@api.route('/notificaciones', methods=['GET'])
def listar_notificaciones():
    data = Notificacion.query.all()        
    return jsonify([x.serialize() for x in data]), 200

@api.route('/notificaciones', methods=['POST'])
@jwt_required()
def crear_notificacion():
    body = request.json
    usuario_id = body.get("usuario_id")
    fecha = body.get("fecha")    
    mensaje = body.get("mensaje") 

    nueva = Notificacion(usuario_id=usuario_id, fecha=fecha, mensaje=mensaje)
    db.session.add(nueva)
    db.session.commit()

    enviar_push(usuario_id, mensaje)

    return jsonify(nueva.serialize()), 201



@api.route('/notificaciones/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_notificacion(id):
    notificacion = Notificacion.query.get(id)
    db.session.delete(notificacion)
    db.session.commit()
    return jsonify({'status': 'ok'}), 200  

#-------------------------------------------------------------------
# SUBSCRIPCIONES
# -------------------------------------------------------------------
@api.route('/save-subscription', methods=['POST'])
def save_subscription():
    data = request.json

    usuario_id = data.get("usuario_id")
    endpoint = data.get("endpoint")
    p256dh = data.get("p256dh")
    auth = data.get("auth")

    if not p256dh or not auth:
        return jsonify({
            "error": "La suscripción no incluye claves p256dh/auth (probablemente VAPID inválido)"
        }), 400

    # Verificar si ya existe la suscripción
    sus = Suscripcion.query.filter_by(usuario_id=usuario_id, endpoint=endpoint).first()
    if sus:
        # Actualizar claves por si cambiaron
        sus.p256dh = p256dh
        sus.auth = auth
        db.session.commit()
        return jsonify({"msg": "Suscripción existente actualizada"}), 200

    # Si no existe, crear nueva
    sus = Suscripcion(
        usuario_id=usuario_id,
        endpoint=endpoint,
        p256dh=p256dh,
        auth=auth
    )
    db.session.add(sus)
    db.session.commit()

    return jsonify({"msg": "Suscripción creada"}), 201


@api.route('/subscriptions', methods=['GET'])
def listar_subscripciones():
    data = Suscripcion.query.all()
    return jsonify([x.serialize() for x in data]), 200

@api.route('/subscriptions/<int:id>', methods=['DELETE'])
def eliminar_subscripcion(id):
    suscripcion = Suscripcion.query.get(id)
    db.session.delete(suscripcion)
    db.session.commit() 
    return jsonify({'status': 'ok'}), 200

# -------------------------------------------------------------------
# PUSH
# -------------------------------------------------------------------
def enviar_push(usuario_id, mensaje):
    """
    Envía notificaciones push a un usuario específico o a todos si no se pasa usuario_id.
    mensaje debe ser un string.
    """
    if usuario_id:
        subs = Suscripcion.query.filter_by(usuario_id=usuario_id).all()
    else:
        subs = Suscripcion.query.all()

    for sub in subs:
        try:
            webpush(
                subscription_info={
                    "endpoint": sub.endpoint,
                    "keys": {"p256dh": sub.p256dh, "auth": sub.auth}
                },
                data=mensaje,
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims={"sub": "mailto:nestorfrones07@gmail.com"}
            )
        except Exception as e:
            print(f"Error enviando push a {sub.id}: {e}")

