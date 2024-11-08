terraform {
  required_providers {
    kubernetes = {
      source = "hashicorp/kubernetes"
      version = "~> 2.11"  
    }
  }
}

provider "kubernetes" {}

# Persistent Volume Claim for MongoDB
resource "kubernetes_persistent_volume_claim" "mongo_pvc" {
  metadata {
    name = "mongo-storage"
    namespace = "default"
  }
  spec {
    access_modes = ["ReadWriteOnce"]
    resources {
      requests = {
        storage = "10Gi"
      }
    }
    storage_class_name = "standard"
  }
}

# MongoDB StatefulSet
resource "kubernetes_stateful_set" "mongodb" {
  metadata {
    name = "mongodb"
    namespace = "default"
  }
  spec {
    replicas = 1
    service_name = "mongodb-service"
    selector {
      match_labels = {
        app = "mongodb"
      }
    }
    template {
      metadata {
        labels = {
          app = "mongodb"
        }
      }
      spec {
        container {
          name  = "mongodb"
          image = "mongo"

          port {
            container_port = 27017
          }

          volume_mount {
            mount_path = "/data/db"
            name       = "mongo-storage"
          }
        }
      }
    }
    volume_claim_template {
      metadata {
        name = "mongo-storage"
      }
      spec {
        access_modes = ["ReadWriteOnce"]
        resources {
          requests = {
            storage = "10Gi"
          }
        }
      }
    }
  }
}

# MongoDB Service
resource "kubernetes_service" "mongodb" {
  metadata {
    name = "mongodb-service"
    namespace = "default"
  }
  spec {
    selector = {
      app = "mongodb"
    }
    port {
      protocol    = "TCP"
      port        = 27017
      target_port = 27017
    }
    type = "ClusterIP"
  }
}

# Backend Deployment
resource "kubernetes_deployment" "backend_deployment" {
  metadata {
    name = "yolo-backend"
    labels = {
      app = "yolo-backend"
    }
  }

  spec {
    replicas = 2  # Number of backend replicas
    selector {
      match_labels = {
        app = "yolo-backend"
      }
    }

    template {
      metadata {
        labels = {
          app = "yolo-backend"
        }
      }

      spec {
        container {
          name  = "backend"
          image = "hiramwamae/hiram-yolo-backend:v1.0.2"
          ports {
            container_port = 5000
          }
          env {
            name  = "MONGO_URL"
            value = "mongodb://yolo-mongo-service:27017/yolo-db"
          }
        }
      }
    }
  }
}

# Backend Service
resource "kubernetes_service" "backend_service" {
  metadata {
    name = "yolo-backend-service"
  }

  spec {
    selector = {
      app = "yolo-backend"
    }

    port {
      port        = 80
      target_port = 5000
    }

    type = "ClusterIP"
  }
}

# Frontend Deployment
resource "kubernetes_deployment" "frontend_deployment" {
  metadata {
    name = "yolo-frontend"
    labels = {
      app = "yolo-frontend"
    }
  }

  spec {
    replicas = 2  # Number of frontend replicas
    selector {
      match_labels = {
        app = "yolo-frontend"
      }
    }

    template {
      metadata {
        labels = {
          app = "yolo-frontend"
        }
      }

      spec {
        container {
          name  = "frontend"
          image = "hiramwamae/hiram-yolo-client:v1.0.2"
          ports {
            container_port = 3000
          }
          env {
            name  = "BACKEND_URL"
            value = "http://yolo-backend-service:80"  # Internal cluster communication
          }
        }
      }
    }
  }
}

# Frontend Service
resource "kubernetes_service" "frontend_service" {
  metadata {
    name = "yolo-frontend-service"
  }

  spec {
    selector = {
      app = "yolo-frontend"
    }

    port {
      port        = 80
      target_port = 3000
    }

    type = "LoadBalancer"  # Exposes the frontend service externally
  }
}