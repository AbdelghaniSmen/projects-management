from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash
from flask_cors import CORS
from sqlalchemy import Enum
from datetime import datetime


app = Flask(__name__, template_folder='templates')

# Configuration CORS robuste
CORS(app, resources={
    r"/*": {
        "origins": "http://localhost:3000",
        "methods": ["OPTIONS", "GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost:3308/labase'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'votre_clé_secrète_très_longue_et_aléatoire'
app.config['SESSION_COOKIE_SECURE'] = False  # False pour développement local (pas HTTPS)
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # Lax pour permettre les requêtes cross-origin avec credentials


db = SQLAlchemy(app)

# Modèles
class Visiteur(db.Model):
    __tablename__ = 'visiteurs'
    Id = db.Column(db.Integer, primary_key=True)
    Nom = db.Column(db.String(255), nullable=False)
    Email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    Entity = db.Column(db.String(255), nullable=False)
    role = db.Column(Enum('admin', 'user'), default='user', nullable=False)

class Entity(db.Model):
    __tablename__ = 'tabentity'
    identity = db.Column(db.Integer, primary_key=True)
    nomentity = db.Column(db.String(255), nullable=False)

class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    entity_id = db.Column(db.Integer, db.ForeignKey('tabentity.identity'), nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('visiteurs.Id'), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

class Task(db.Model):
    __tablename__ = 'tasks'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey('visiteurs.Id'), nullable=True)
    status = db.Column(Enum('todo', 'in_progress', 'done'), default='todo', nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    due_date = db.Column(db.DateTime, nullable=True)

# Routes Utilisateurs
@app.route('/api/users')
def get_users_api():
    utilisateurs = Visiteur.query.all()
    return jsonify([{
        'Id': user.Id,
        'Nom': user.Nom,
        'Email': user.Email,
        'Entity': user.Entity,
        'role': user.role
    } for user in utilisateurs])

@app.route('/')
def index():
    if 'loggedin' in session:
        utilisateurs = Visiteur.query.all()
        return render_template('index.html', users=utilisateurs)
    return redirect(url_for('login'))

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = Visiteur.query.filter_by(Email=email).first()

    if user and user.password == password:
        session['loggedin'] = True
        session['user_id'] = user.Id
        print(f"Connexion réussie pour {email}, user_id: {user.Id}")
        return jsonify({
            "message": "Connexion réussie",
            "user": {
                "Id": user.Id,
                "Nom": user.Nom,
                "Email": user.Email,
                "Entity": user.Entity,
                "role": user.role
            }
        }), 200
    print(f"Échec de connexion pour {email}")
    return jsonify({"error": "Email ou mot de passe incorrect"}), 401

@app.route('/add_user', methods=['POST'])
def add_user():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Données manquantes"}), 400

        required_fields = ['Nom', 'email', 'password', 'Entity']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"Le champ {field} est manquant ou vide"}), 400

        Nom = data['Nom']
        email = data['email']
        password = data['password']
        Entity = data['Entity']
        role = data.get('role', 'user')

        if 'user_id' not in session:
            return jsonify({"error": "Non authentifié"}), 401
        current_user = Visiteur.query.get(session['user_id'])
        if current_user.role != 'admin':
            return jsonify({"error": "Seul un admin peut ajouter des utilisateurs"}), 403

        if Visiteur.query.filter_by(Email=email).first():
            return jsonify({"error": "Cet email est déjà utilisé"}), 400

        new_user = Visiteur(Nom=Nom, Email=email, password=password, Entity=Entity, role=role)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "Utilisateur ajouté avec succès", "id": new_user.Id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erreur serveur: {str(e)}"}), 500

@app.route('/update_user/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.get_json()
    user = Visiteur.query.get(user_id)

    if not user:
        return jsonify({"error": "Utilisateur introuvable"}), 404

    if 'user_id' not in session:
        return jsonify({"error": "Non authentifié"}), 401
    current_user = Visiteur.query.get(session['user_id'])
    if current_user.role != 'admin':
        return jsonify({"error": "Seul un admin peut modifier des utilisateurs"}), 403

    user.Nom = data.get('Nom', user.Nom)
    user.Email = data.get('email', user.Email)
    if 'password' in data and data['password']:
        user.password = data['password']
    user.Entity = data.get('Entity', user.Entity)
    user.role = data.get('role', user.role)

    db.session.commit()
    return jsonify({"message": "Utilisateur modifié avec succès"}), 200

@app.route('/delete_user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = Visiteur.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': "L'utilisateur non trouvé!"}), 404

    if 'user_id' not in session:
        return jsonify({"error": "Non authentifié"}), 401
    current_user = Visiteur.query.get(session['user_id'])
    if current_user.role != 'admin':
        return jsonify({"error": "Seul un admin peut supprimer des utilisateurs"}), 403

    db.session.delete(user)
    db.session.commit()
    return jsonify({'success': True, 'message': "L'utilisateur a été supprimé avec succès!"}), 200

# Routes Entités
@app.route('/entities')
def entities():
    entities_data = Entity.query.all()
    return render_template('entities.html', entities=entities_data)

@app.route('/formulaire_entity')
def formulaire_entity():
    return render_template('add_entity.html')

@app.route('/add_entity', methods=['POST'])
def add_entity():
    if request.method == 'POST':
        identity = request.form['identity']
        nomentity = request.form['nomentity']
        new_entity = Entity(identity=identity, nomentity=nomentity)
        db.session.add(new_entity)
        db.session.commit()
        flash('L\'entité a été ajoutée avec succès!', 'success')
        return redirect(url_for('entities'))

@app.route('/delete_entity/<int:identity>', methods=['POST'])
def delete_entity(identity):
    entity = Entity.query.get(identity)
    if entity:
        db.session.delete(entity)
        db.session.commit()
        flash("L'entité a été supprimée avec succès!", 'success')
    return redirect(url_for('entities'))

@app.route('/api/entities', methods=['GET'])
def get_entities_api():
    entities = Entity.query.all()
    print("Entités récupérées:", [{"identity": e.identity, "nomentity": e.nomentity} for e in entities])
    return jsonify([{
        "identity": e.identity,
        "nomentity": e.nomentity
    } for e in entities])

# Routes Projets
@app.route('/api/projects', methods=['GET'])
def get_projects_api():
    projects = Project.query.all()
    return jsonify([{
        "id": p.id,
        "name": p.name,
        "description": p.description,
        "entity_id": p.entity_id,
        "created_by": p.created_by,
        "created_at": p.created_at.isoformat()
    } for p in projects])

@app.route('/api/projects', methods=['POST'])
def add_project_api():
    print("Session avant vérification:", session)
    print("Requête reçue pour /api/projects:", request.get_json())
    if 'user_id' not in session:
        print("Erreur: Non authentifié")
        return jsonify({"error": "Non authentifié"}), 401
    current_user = Visiteur.query.get(session['user_id'])
    if current_user.role != 'admin':
        print(f"Erreur: Utilisateur {current_user.Email} n'est pas admin")
        return jsonify({"error": "Seul un admin peut ajouter des projets"}), 403

    data = request.get_json()
    required_fields = ['name', 'entity_id']
    for field in required_fields:
        if field not in data or not data[field]:
            print(f"Erreur: Champ {field} manquant ou vide")
            return jsonify({"error": f"Le champ {field} est requis"}), 400

    try:
        project = Project(
            name=data['name'],
            description=data.get('description', ''),
            entity_id=int(data['entity_id']),
            created_by=current_user.Id
        )
        db.session.add(project)
        db.session.commit()
        print(f"Projet ajouté avec ID: {project.id}")
        return jsonify({"message": "Projet ajouté", "id": project.id}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Erreur serveur: {str(e)}")
        return jsonify({"error": f"Erreur serveur: {str(e)}"}), 500

# Routes Tâches
@app.route('/api/projects/<int:project_id>/tasks', methods=['GET'])
def get_tasks_api(project_id):
    if not Project.query.get(project_id):
        return jsonify({"error": "Projet non trouvé"}), 404
    tasks = Task.query.filter_by(project_id=project_id).all()
    return jsonify([{
        "id": t.id,
        "title": t.title,
        "description": t.description,
        "project_id": t.project_id,
        "assigned_to": t.assigned_to,
        "status": t.status,
        "created_at": t.created_at.isoformat(),
        "due_date": t.due_date.isoformat() if t.due_date else None
    } for t in tasks])

@app.route('/api/tasks', methods=['POST'])
def add_task_api():
    print("Requête reçue pour /api/tasks:", request.get_json())
    if 'user_id' not in session:
        print("Erreur: Non authentifié")
        return jsonify({"error": "Non authentifié"}), 401
    current_user = Visiteur.query.get(session['user_id'])
    if current_user.role != 'admin':
        print(f"Erreur: Utilisateur {current_user.Email} n'est pas admin")
        return jsonify({"error": "Seul un admin peut ajouter des tâches"}), 403

    data = request.get_json()
    required_fields = ['title', 'project_id']
    for field in required_fields:
        if field not in data or not data[field]:
            print(f"Erreur: Champ {field} manquant ou vide")
            return jsonify({"error": f"Le champ {field} est requis"}), 400

    try:
        task = Task(
            title=data['title'],
            description=data.get('description', ''),
            project_id=data['project_id'],
            assigned_to=data.get('assigned_to'),
            status=data.get('status', 'todo'),
            due_date=datetime.fromisoformat(data['due_date']) if data.get('due_date') else None
        )
        db.session.add(task)
        db.session.commit()
        print(f"Tâche ajoutée avec ID: {task.id}")
        return jsonify({"message": "Tâche ajoutée", "id": task.id}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Erreur serveur: {str(e)}")
        return jsonify({"error": f"Erreur serveur: {str(e)}"}), 500

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task_api(task_id):
    print(f"Requête reçue pour mise à jour de la tâche ID: {task_id}")
    if 'user_id' not in session:
        print("Erreur: Non authentifié")
        return jsonify({"error": "Non authentifié"}), 401
    task = Task.query.get_or_404(task_id)
    current_user = Visiteur.query.get(session['user_id'])

    if current_user.role != 'admin' and task.assigned_to != current_user.Id:
        print(f"Erreur: Permission refusée pour utilisateur {current_user.Email}")
        return jsonify({"error": "Permission refusée"}), 403

    data = request.get_json()
    print("Données reçues pour mise à jour:", data)
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.status = data.get('status', task.status)
    task.due_date = datetime.fromisoformat(data['due_date']) if data.get('due_date') else task.due_date
    task.assigned_to = data.get('assigned_to', task.assigned_to)

    try:
        db.session.commit()
        print(f"Tâche ID {task_id} mise à jour avec succès")
        return jsonify({"message": "Tâche mise à jour"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Erreur serveur lors de la mise à jour: {str(e)}")
        return jsonify({"error": f"Erreur serveur: {str(e)}"}), 500

@app.route('/api/my_tasks', methods=['GET'])
def get_my_tasks_api():
    if 'user_id' not in session:
        print("Erreur: Non authentifié")
        return jsonify({"error": "Non authentifié"}), 401
    user_id = session['user_id']
    tasks = Task.query.filter_by(assigned_to=user_id).all()
    return jsonify([{
        "id": t.id,
        "title": t.title,
        "description": t.description,
        "project_id": t.project_id,
        "assigned_to": t.assigned_to,
        "status": t.status,
        "created_at": t.created_at.isoformat(),
        "due_date": t.due_date.isoformat() if t.due_date else None
    } for t in tasks])

if __name__ == '__main__':
    app.run(debug=True, port=5001)