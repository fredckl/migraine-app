from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps
import json

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["*"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///diet_tracker.db'
app.config['SECRET_KEY'] = 'votre-clé-secrète-très-longue-et-très-sécurisée'  # À changer en production
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    food_entries = db.relationship('FoodEntry', backref='user', lazy=True)
    migraines = db.relationship('Migraine', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class FoodCategory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    is_common_trigger = db.Column(db.Boolean, default=False)

class Migraine(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=True)
    intensity = db.Column(db.Integer, nullable=False)  # 1-10
    symptoms = db.Column(db.String(500), nullable=True)
    triggers = db.Column(db.String(500), nullable=True)
    medication = db.Column(db.String(200), nullable=True)
    notes = db.Column(db.String(500), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class FoodEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    datetime = db.Column(db.DateTime, nullable=False)
    meal_type = db.Column(db.String(50), nullable=False)
    notes = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    food_items = db.relationship('FoodItem', backref='food_entry', lazy=True, cascade='all, delete-orphan')

class FoodItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    entry_id = db.Column(db.Integer, db.ForeignKey('food_entry.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('food_category.id'), nullable=False)
    name = db.Column(db.String(100), nullable=True)
    quantity = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20), nullable=False)
    
    category = db.relationship('FoodCategory')

def init_categories():
    default_categories = [
        {'name': 'Café', 'is_trigger': True},
        {'name': 'Thé', 'is_trigger': True},
        {'name': 'Chocolat', 'is_trigger': True},
        {'name': 'Alcool', 'is_trigger': True},
        {'name': 'Produits laitiers', 'is_trigger': True},
        {'name': 'Fruits', 'is_trigger': False},
        {'name': 'Légumes', 'is_trigger': False},
        {'name': 'Viandes', 'is_trigger': False},
        {'name': 'Féculents', 'is_trigger': False},
        {'name': 'Boissons', 'is_trigger': False},
        {'name': 'Snacks', 'is_trigger': False}
    ]
    
    for cat in default_categories:
        if not FoodCategory.query.filter_by(name=cat['name']).first():
            category = FoodCategory(name=cat['name'], is_common_trigger=cat['is_trigger'])
            db.session.add(category)
    
    db.session.commit()

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        
        if not token:
            return jsonify({'error': 'Token manquant'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'error': 'Token invalide'}), 401
        except:
            return jsonify({'error': 'Token invalide'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

def parse_datetime(dt_str):
    if dt_str:
        # Supprimer le 'Z' et les millisecondes si présents
        if dt_str.endswith('Z'):
            dt_str = dt_str[:-1]  # Enlever le Z
        if '.' in dt_str:
            dt_str = dt_str.split('.')[0]  # Enlever les millisecondes
        return datetime.fromisoformat(dt_str)
    return None

with app.app_context():
    db.create_all()
    init_categories()

@app.route('/')
def home():
    categories = FoodCategory.query.all()
    return jsonify([{'id': cat.id, 'name': cat.name, 'is_trigger': cat.is_common_trigger} for cat in categories])

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not all(k in data for k in ['email', 'password', 'name']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    user = User(
        email=data['email'],
        name=data['name']
    )
    user.set_password(data['password'])
    
    try:
        db.session.add(user)
        db.session.commit()
        return jsonify({
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error creating user'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not all(k in data for k in ['email', 'password']):
        return jsonify({'error': 'Email ou mot de passe manquant'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if user and user.check_password(data['password']):
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(days=1)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        return jsonify({
            'message': 'Connexion réussie',
            'token': token,
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name
            }
        }), 200
    
    return jsonify({'error': 'Email ou mot de passe invalide'}), 401

@app.route('/api/me', methods=['GET'])
@token_required
def get_user_profile(current_user):
    return jsonify({
        'user': {
            'id': current_user.id,
            'email': current_user.email,
            'name': current_user.name
        }
    }), 200

@app.route('/add_entry', methods=['POST'])
@token_required
def add_entry(current_user):
    try:
        data = request.json
        
        # Combine date and time
        entry_date = datetime.strptime(data['date'], '%Y-%m-%d')
        if data.get('time'):
            time_parts = data['time'].split(':')
            entry_date = entry_date.replace(
                hour=int(time_parts[0]),
                minute=int(time_parts[1])
            )
        
        entry = FoodEntry(
            datetime=entry_date,
            meal_type=data['meal_type'],
            notes=data.get('notes', ''),
            user_id=current_user.id
        )
        
        db.session.add(entry)
        db.session.flush()
        
        for food_item in data['food_items']:
            item = FoodItem(
                entry_id=entry.id,
                category_id=food_item['category_id'],
                name=food_item.get('name', ''),
                quantity=food_item['quantity'],
                unit=food_item['unit']
            )
            db.session.add(item)
        
        db.session.commit()
        return jsonify({'message': 'Entry added successfully', 'entry_id': entry.id}), 201
    
    except Exception as e:
        print("Error:", str(e))
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/get_entries', methods=['GET'])
@token_required
def get_entries(current_user):
    entries = FoodEntry.query.filter_by(user_id=current_user.id).order_by(FoodEntry.datetime.desc()).all()
    return jsonify([{
        'id': entry.id,
        'datetime': entry.datetime.isoformat() + 'Z',
        'meal_type': entry.meal_type,
        'notes': entry.notes,
        'food_items': [{
            'id': item.id,
            'name': item.name,
            'quantity': item.quantity,
            'unit': item.unit,
            'category': {
                'id': item.category.id,
                'name': item.category.name,
                'is_common_trigger': item.category.is_common_trigger
            } if item.category else None
        } for item in entry.food_items]
    } for entry in entries])

@app.route('/add_migraine', methods=['POST'])
@token_required
def add_migraine(current_user):
    data = request.json
    symptoms_json = json.dumps(data.get('symptoms', [])) if data.get('symptoms') else None
    triggers_json = json.dumps(data.get('triggers', [])) if data.get('triggers') else None
    migraine = Migraine(
        start_time=parse_datetime(data['start_time']),
        end_time=parse_datetime(data['end_time']) if data.get('end_time') else None,
        intensity=data['intensity'],
        symptoms=symptoms_json,
        triggers=triggers_json,
        medication=data.get('medication'),
        notes=data.get('notes'),
        user_id=current_user.id
    )
    
    db.session.add(migraine)
    db.session.commit()
    
    return jsonify({'status': 'success', 'migraine_id': migraine.id})

@app.route('/get_migraines', methods=['GET'])
@token_required
def get_migraines(current_user):
    migraines = Migraine.query.filter_by(user_id=current_user.id).order_by(Migraine.start_time.desc()).all()
    return jsonify([{
        'id': m.id,
        'start_time': m.start_time.isoformat() + 'Z',
        'end_time': m.end_time.isoformat() + 'Z' if m.end_time else None,
        'intensity': m.intensity,
        'symptoms': json.loads(m.symptoms) if m.symptoms else [],
        'triggers': json.loads(m.triggers) if m.triggers else [],
        'medication': m.medication,
        'notes': m.notes
    } for m in migraines])

@app.route('/get_categories', methods=['GET'])
def get_categories():
    categories = FoodCategory.query.all()
    return jsonify([{
        'id': cat.id,
        'name': cat.name,
        'is_trigger': cat.is_common_trigger
    } for cat in categories])

@app.route('/delete_migraine/<int:migraine_id>', methods=['DELETE'])
@token_required
def delete_migraine(current_user, migraine_id):
    migraine = Migraine.query.filter_by(id=migraine_id, user_id=current_user.id).first()
    if not migraine:
        return jsonify({'error': 'Migraine non trouvée'}), 404
    
    db.session.delete(migraine)
    db.session.commit()
    
    return jsonify({'status': 'success', 'message': 'Migraine supprimée'})

@app.route('/delete_food/<int:food_id>', methods=['DELETE'])
@token_required
def delete_food(current_user, food_id):
    food = FoodEntry.query.get_or_404(food_id)
    
    if food.user_id != current_user.id:
        return jsonify({'error': 'Non autorisé'}), 403
        
    db.session.delete(food)
    db.session.commit()
    
    return jsonify({'message': 'Repas supprimé avec succès'})

if __name__ == '__main__':
    app.run(debug=True)
