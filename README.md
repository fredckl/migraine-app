# Journal Alimentaire et Migraines

Une application web permettant de suivre vos repas et vos migraines pour identifier les potentiels déclencheurs alimentaires.

## Fonctionnalités

- 📝 **Journal Alimentaire**
  - Enregistrement des repas avec date, heure et type de repas
  - Catégorisation des aliments
  - Notes pour chaque repas
  - Suppression des repas

- 🤕 **Journal des Migraines**
  - Suivi des migraines avec intensité et durée
  - Enregistrement des symptômes
  - Notes sur les déclencheurs potentiels
  - Suppression des migraines

- 📊 **Analyse**
  - Visualisation des corrélations entre aliments et migraines
  - Identification des déclencheurs potentiels
  - Statistiques sur les migraines

## Installation

### Prérequis

- Python 3.8 ou supérieur
- Node.js 14 ou supérieur
- pip (gestionnaire de paquets Python)
- npm (gestionnaire de paquets Node.js)

### Backend (Flask)

1. Créez un environnement virtuel Python :
```bash
python -m venv venv
source venv/bin/activate  # Sur Unix/macOS
# ou
.\venv\Scripts\activate  # Sur Windows
```

2. Installez les dépendances :
```bash
pip install -r requirements.txt
```

3. Initialisez la base de données :
```bash
flask db upgrade
```

### Frontend (React)

1. Naviguez vers le dossier frontend :
```bash
cd frontend
```

2. Installez les dépendances :
```bash
npm install
```

## Utilisation

### Démarrer le Backend

1. Activez l'environnement virtuel si ce n'est pas déjà fait :
```bash
source venv/bin/activate  # Sur Unix/macOS
# ou
.\venv\Scripts\activate  # Sur Windows
```

2. Lancez le serveur Flask :
```bash
python app.py
```

Le serveur backend sera accessible sur `http://localhost:5000`

### Démarrer le Frontend

1. Dans un nouveau terminal, naviguez vers le dossier frontend :
```bash
cd frontend
```

2. Lancez le serveur de développement :
```bash
npm start
```

L'application sera accessible sur `http://localhost:3000`

## Utilisation de l'Application

### Journal Alimentaire

1. Cliquez sur "Ajouter un repas"
2. Remplissez les informations :
   - Date et heure
   - Type de repas
   - Description des aliments
   - Notes éventuelles
3. Pour supprimer un repas, cliquez sur l'icône de poubelle à côté du repas concerné

### Journal des Migraines

1. Cliquez sur "Ajouter une migraine"
2. Renseignez :
   - Date et heure de début
   - Intensité
   - Symptômes
   - Déclencheurs potentiels
   - Notes éventuelles
3. Pour supprimer une migraine, cliquez sur l'icône de poubelle à côté de la migraine concernée

### Analyse des Corrélations

- Consultez l'onglet "Corrélations" pour visualiser les liens potentiels entre vos repas et vos migraines
- Les aliments fréquemment associés à des migraines seront mis en évidence

## Sécurité

- Authentification requise pour accéder à l'application
- Les données sont stockées de manière sécurisée
- Chaque utilisateur ne peut voir et modifier que ses propres données

## Support

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub.
