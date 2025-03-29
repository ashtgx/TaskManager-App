# TaskManager App

TaskManager is a collaborative project management application built with Django and React, using an SQLite database.

---

## To Set Up

First thing to do is to clone the repository:
```bash
$ git clone https://github.com/ashtgx/TaskManager-App.git
$ cd TaskManager-App
```

Create a virtual environment to install dependencies and activate it:
```bash
$ python3 -m venv env
$ source env/bin/activate
```

Set up backend:
```bash
(env)$ cd TaskManagerBackend
(env)$ pip install -r requirements.txt

# Setup environment
(env)$ python manage.py makemigrations
(env)$ python manage.py migrate
```
Note the `(env)` in front of the prompts. This indicates that the terminal
session operates in a virtual environment set up by venv.

Run backend:
```bash
# Start Redis server
(env)$ redis-server

# In a separate terminal, start Daphne server process
(env)$ daphne TaskManagerBackend.asgi:application

# In a separate terminal, start Celery worker
(env)$ celery -A TaskManagerBackend worker --beat --loglevel=info
```

Set up and run frontend in a separate terminal:
```bash
(env)$ cd task-manager-frontend
(env)$ npm install
(env)$ npm run dev
```

---

## Core Features
- **User Authentication** with JWT (Login / Register)
- **Dashboard** to view your created and joined projects
- **Project Management**:
  - Create, view, update, delete projects
  - Invite and remove collaborators
  - Transfer ownership
- **Boards System**:
  - Task Board (Task list style)
  - Kanban Board (Kanban board style with drag-and-drop)
  - Gantt Board (Gantt chart style)
- **Real-Time Group Chat** per project (WebSocket-powered)
- **Notifications System**:
  - Real-time updates for project invites, chat messages, and gantt task deadlines
  - WebSocket-powered push notifications
- **Gantt Deadline Alerts** via Celery + Redis
