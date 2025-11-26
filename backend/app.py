from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask_migrate import Migrate
from extensions import mail

from config import Config
from api.models import db, Usuario, Turno, Jefatura, Zona, Dependencia, Licencia, Guardia, Notificacion, Suscripcion

from api.routes import api


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Extensiones
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    mail.init_app(app)
    db.init_app(app)
    JWTManager(app)
    Migrate(app, db)

    # Admin panel
    admin = Admin(app, name='Panel Admin')
    admin.add_view(ModelView(Usuario, db.session))
    admin.add_view(ModelView(Jefatura, db.session))
    admin.add_view(ModelView(Zona, db.session))
    admin.add_view(ModelView(Dependencia, db.session))
    admin.add_view(ModelView(Turno, db.session))
    admin.add_view(ModelView(Guardia, db.session))
    admin.add_view(ModelView(Licencia, db.session))
    admin.add_view(ModelView(Notificacion, db.session))
    admin.add_view(ModelView(Suscripcion, db.session))

    # Blueprints
    app.register_blueprint(api, url_prefix='/api')

    # Test route
    @app.route('/ping')
    def ping():
        return {'status': 'ok'}, 200

    # Cerrar conexión después de cada request (EVITA fugas)
    @app.teardown_appcontext
    def shutdown_session(exception=None):
        db.session.remove()

    return app


app = create_app()

# ⚠️ Solo crear tablas si realmente estás en desarrollo
with app.app_context():
    try:
        db.create_all()
    except Exception as e:
        print("⚠ No se pudieron crear las tablas:", e)


if __name__ == "__main__":
    # ⚠️ DESACTIVAR DEBUG EN SUPABASE (produce doble proceso)
    app.run(debug=False)
