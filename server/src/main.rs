use axum::{
    extract::{Request, State},
    http::{header, HeaderName, HeaderValue, StatusCode},
    middleware::{self, Next},
    response::{IntoResponse, Response},
    Router,
};
use std::{net::SocketAddr, path::Path, sync::Arc};
use tower_http::services::{ServeDir, ServeFile};

const DIST: &str = "../dist";

struct Rules {
    headers: Vec<(String, Vec<(HeaderName, Option<HeaderValue>)>)>,
    redirects: Vec<(String, String, StatusCode)>,
}

fn matches(pattern: &str, path: &str) -> bool {
    match pattern.strip_suffix('*') {
        Some(prefix) => path.starts_with(prefix),
        None => pattern == path,
    }
}

fn read(name: &str) -> String {
    std::fs::read_to_string(Path::new(DIST).join(name))
        .unwrap_or_else(|_| panic!("{DIST}/{name} is missing, run npm run build first"))
}

fn parse_headers(text: &str) -> Vec<(String, Vec<(HeaderName, Option<HeaderValue>)>)> {
    let mut rules: Vec<(String, Vec<(HeaderName, Option<HeaderValue>)>)> = Vec::new();
    for line in text.lines().filter(|l| !l.trim().is_empty()) {
        if !line.starts_with(char::is_whitespace) {
            rules.push((line.trim().to_owned(), Vec::new()));
        } else if let (Some(name), Some(rule)) = (line.trim().strip_prefix('!'), rules.last_mut()) {
            let name = HeaderName::try_from(name.trim().to_ascii_lowercase()).expect("invalid header name in _headers");
            rule.1.push((name, None));
        } else if let (Some((name, value)), Some(rule)) = (line.trim().split_once(':'), rules.last_mut()) {
            let name = HeaderName::try_from(name.trim().to_ascii_lowercase()).expect("invalid header name in _headers");
            let value = HeaderValue::try_from(value.trim()).expect("invalid header value in _headers");
            rule.1.push((name, Some(value)));
        }
    }
    rules
}

fn parse_redirects(text: &str) -> Vec<(String, String, StatusCode)> {
    text.lines()
        .filter_map(|line| {
            let mut parts = line.split_whitespace();
            let from = parts.next()?.to_owned();
            let to = parts.next()?.to_owned();
            let status = parts
                .next()
                .and_then(|s| s.parse().ok())
                .and_then(|s| StatusCode::from_u16(s).ok())
                .unwrap_or(StatusCode::FOUND);
            Some((from, to, status))
        })
        .collect()
}

async fn apply(State(rules): State<Arc<Rules>>, req: Request, next: Next) -> Response {
    let path = req.uri().path().to_owned();
    if let Some((_, to, status)) = rules.redirects.iter().find(|(from, ..)| *from == path) {
        return (*status, [(header::LOCATION, to.as_str())]).into_response();
    }
    let mut res = next.run(req).await;
    let headers = res.headers_mut();
    for (pattern, values) in &rules.headers {
        if matches(pattern, &path) {
            for (name, value) in values {
                match value {
                    Some(value) => {
                        headers.insert(name, value.clone());
                    }
                    None => {
                        headers.remove(name);
                    }
                }
            }
        }
    }
    res
}

#[tokio::main]
async fn main() {
    let rules = Arc::new(Rules {
        headers: parse_headers(&read("_headers")),
        redirects: parse_redirects(&read("_redirects")),
    });
    let port: u16 = std::env::var("PORT").ok().and_then(|p| p.parse().ok()).unwrap_or(8080);

    let app = Router::new()
        .fallback_service(ServeDir::new(DIST).fallback(ServeFile::new(format!("{DIST}/index.html"))))
        .layer(middleware::from_fn_with_state(rules, apply));

    let listener = tokio::net::TcpListener::bind(SocketAddr::from(([127, 0, 0, 1], port)))
        .await
        .expect("could not bind the port");
    println!("Voidstrap running at http://localhost:{port}");
    axum::serve(listener, app).await.expect("server stopped");
}
