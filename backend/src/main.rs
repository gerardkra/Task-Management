use axum::{
    extract::{Path, State},
    http::{Method, StatusCode},
    response::Json,
    routing::{delete, get, post, put},
    Router,
};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tower_http::cors::{Any, CorsLayer};
use uuid::Uuid;

// ============================================================
// MODÈLE
// ============================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Task {
    id: Uuid,
    titre: String,
    description: String,
    date_limite: String,
    statut: String,
}

#[derive(Debug, Deserialize)]
struct CreateTask {
    titre: String,
    description: String,
    date_limite: String,
    statut: Option<String>,
}

#[derive(Debug, Deserialize)]
struct UpdateTask {
    titre: Option<String>,
    description: Option<String>,
    date_limite: Option<String>,
    statut: Option<String>,
}

type AppState = Arc<Mutex<Vec<Task>>>;

// ============================================================
// MAIN
// ============================================================

#[tokio::main]
async fn main() {
    let store: AppState = Arc::new(Mutex::new(Vec::new()));

    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers(Any)
        .allow_origin(Any);

    let app = Router::new()
        .route("/tasks", get(get_all_tasks))
        .route("/tasks", post(create_task))
        .route("/tasks/:id", put(update_task))
        .route("/tasks/:id", delete(delete_task))
        .layer(cors)
        .with_state(store);

    let addr = "0.0.0.0:3001";
    println!("🚀 Backend démarré sur http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

// ============================================================
// HANDLERS
// ============================================================

async fn get_all_tasks(State(store): State<AppState>) -> Json<Vec<Task>> {
    let tasks = store.lock().unwrap().clone();
    Json(tasks)
}

async fn create_task(
    State(store): State<AppState>,
    Json(body): Json<CreateTask>,
) -> Result<Json<Task>, (StatusCode, String)> {
    if body.titre.trim().is_empty() {
        return Err((StatusCode::BAD_REQUEST, "Titre obligatoire".into()));
    }
    if body.date_limite.trim().is_empty() {
        return Err((StatusCode::BAD_REQUEST, "Date obligatoire".into()));
    }

    let task = Task {
        id: Uuid::new_v4(),
        titre: body.titre,
        description: body.description,
        date_limite: body.date_limite,
        statut: body.statut.unwrap_or("À faire".into()),
    };

    store.lock().unwrap().push(task.clone());
    Ok(Json(task))
}

async fn update_task(
    State(store): State<AppState>,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateTask>,
) -> Result<Json<Task>, (StatusCode, String)> {
    let mut tasks = store.lock().unwrap();

    let task = tasks
        .iter_mut()
        .find(|t| t.id == id)
        .ok_or((StatusCode::NOT_FOUND, "Tâche introuvable".into()))?;

    if let Some(titre) = body.titre {
        task.titre = titre;
    }
    if let Some(description) = body.description {
        task.description = description;
    }
    if let Some(date_limite) = body.date_limite {
        task.date_limite = date_limite;
    }
    if let Some(statut) = body.statut {
        task.statut = statut;
    }

    Ok(Json(task.clone()))
}

async fn delete_task(
    State(store): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, (StatusCode, String)> {
    let mut tasks = store.lock().unwrap();
    let len_before = tasks.len();
    tasks.retain(|t| t.id != id);

    if tasks.len() == len_before {
        return Err((StatusCode::NOT_FOUND, "Tâche introuvable".into()));
    }

    Ok(StatusCode::NO_CONTENT)
}