from flask import Flask, render_template, request, redirect, url_for, jsonify
from pymongo import MongoClient
import config

# Inicialización de la aplicación Flask
app = Flask(__name__)

# Conexión a MongoDB utilizando la configuración
client = MongoClient(config.MONGO_URI, tlsCAFile=config.CA_FILE)
db = client[config.DB_NAME]
coleccion_empleados = db.empleados

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/empleados', methods=['POST'])
def guardar_empleado():
    """Ruta para guardar un nuevo empleado en la base de datos"""
    try:
        # Obtener datos del formulario
        nombre = request.form.get('nombre_empleado')
        apellido = request.form.get('apellido_empleado')
        direccion = request.form.get('direccion_empleado')
        contrato = request.form.get('contrato_empleado')
        salario = request.form.get('salario_empleado')
        departamento = request.form.get('departamento_empleado')
        cargo = request.form.get('cargo_empleado')
        
        # Crear documento de empleado
        empleado = {
            "nombre_empleado": nombre,
            "apellido_empleado": apellido,
            "direccion_empleado": direccion,
            "contrato_empleado": contrato,
            "salario_empleado": int(salario),
            "departamento_empleado": departamento,
            "cargo_empleado": cargo
        }
        
        # Guardar en MongoDB
        coleccion_empleados.insert_one(empleado)
        
        return jsonify({"status": "success", "message": "Empleado guardado correctamente"})
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/empleados', methods=['GET'])
def listar_empleados():
    """Ruta para listar todos los empleados de la base de datos"""
    empleados = list(coleccion_empleados.find({}, {'_id': 0}))
    
    return render_template('empleados.html', empleados=empleados)

@app.route('/empleados/query')
def consultar_empleados():
    """Ruta para consultar empleados usando query strings"""
    # Obtener parámetros de consulta
    args = request.args.to_dict()
    
    if not args:
        return redirect(url_for('listar_empleados'))
    
    # Filtrar empleados basados en query strings
    empleados = list(coleccion_empleados.find(args, {'_id': 0}))
    
    return render_template('empleados.html', empleados=empleados, filtros=args)

if __name__ == '__main__':
    app.run(debug=True)