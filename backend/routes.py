from flask import Blueprint, jsonify, request
from extensions import db
from models import Task

api = Blueprint("api", __name__, url_prefix="/api")

@api.get("/health")
def health():
    try:
        db.session.execute(db.text("SELECT 1"))
        return jsonify({"status": "ok", "database": "connected"})
    except Exception:
        db.session.rollback()
        return jsonify({"status": "error", "database": "unavailable"}), 503

@api.get("/tasks")
def get_tasks():
    tasks = Task.query.order_by(Task.created_at.desc()).all()
    return jsonify([task.to_dict() for task in tasks])

@api.post("/tasks")
def create_task():
    data = request.get_json(silent=True) or {}
    title = str(data.get("title", "")).strip()
    description = str(data.get("description", "")).strip()

    if not title:
        return jsonify({"error": "Task title is required."}), 400
    if len(title) > 160:
        return jsonify({"error": "Title must be 160 characters or fewer."}), 400

    task = Task(title=title, description=description)
    db.session.add(task)
    db.session.commit()
    return jsonify(task.to_dict()), 201

@api.patch("/tasks/<int:task_id>")
def update_task(task_id):
    task = db.session.get(Task, task_id)
    if task is None:
        return jsonify({"error": "Task not found."}), 404

    data = request.get_json(silent=True) or {}

    if "title" in data:
        title = str(data["title"]).strip()
        if not title:
            return jsonify({"error": "Task title cannot be empty."}), 400
        if len(title) > 160:
            return jsonify({"error": "Title must be 160 characters or fewer."}), 400
        task.title = title

    if "description" in data:
        task.description = str(data["description"]).strip()

    if "status" in data:
        status = data["status"]
        if status not in ("pending", "completed"):
            return jsonify({"error": "Status must be pending or completed."}), 400
        task.status = status

    db.session.commit()
    return jsonify(task.to_dict())

@api.delete("/tasks/<int:task_id>")
def delete_task(task_id):
    task = db.session.get(Task, task_id)
    if task is None:
        return jsonify({"error": "Task not found."}), 404

    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted successfully."})
