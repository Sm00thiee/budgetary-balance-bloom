# Docker Setup for Frontend

This document outlines how to build and run the frontend application using Docker.

## Building and Running the Frontend with Docker

### Building the Frontend Docker Image Separately

If you want to build just the frontend Docker image:

```bash
# Navigate to the frontend directory
cd frontend

# Build the Docker image
docker build -t finance-frontend .
```

### Running the Frontend Container Separately

```bash
# Run the frontend container
docker run -p 3000:80 finance-frontend
```

The frontend will be accessible at http://localhost:3000

## Using Docker Compose (Recommended)

The project includes a `docker-compose.yml` file in the root directory that sets up both the frontend and backend services.

### Building and Running with Docker Compose

```bash
# Navigate to the project root directory
cd ..

# Build and start all services
docker-compose up --build

# Alternatively, run in detached mode
docker-compose up --build -d
```

With Docker Compose, the frontend will be accessible at http://localhost:3000 and the backend API at http://localhost:8080.

### Stopping the Services

```bash
# Stop the services while preserving containers
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers, networks, and images
docker-compose down --rmi all
```

## Environment Variables

If you need to modify environment variables for production builds, consider creating a `.env` file in the frontend directory or passing environment variables during the Docker build process.

## Troubleshooting

- If you encounter permission issues, ensure Docker has the necessary permissions to access the files.
- For network issues between containers, check that they are on the same Docker network (in this case, `finance-network`).
- To view logs for the frontend container: `docker logs <container_id>` or `docker-compose logs frontend`. 