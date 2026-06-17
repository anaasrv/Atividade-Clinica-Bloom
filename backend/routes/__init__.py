def register_blueprints(app):
    from routes.admin import bp as admin_bp
    from routes.agendamentos import bp as agendamentos_bp
    from routes.auth import bp as auth_bp
    from routes.especialidades import bp as especialidades_bp
    from routes.exames import bp as exames_bp, procedimentos_bp
    from routes.medicos import bp as medicos_bp
    from routes.notificacoes import bp as notificacoes_bp
    from routes.pacientes import bp as pacientes_bp
    from routes.unidades import bp as unidades_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(pacientes_bp)
    app.register_blueprint(medicos_bp)
    app.register_blueprint(agendamentos_bp)
    app.register_blueprint(especialidades_bp)
    app.register_blueprint(exames_bp)
    app.register_blueprint(procedimentos_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(notificacoes_bp)
    app.register_blueprint(unidades_bp)
