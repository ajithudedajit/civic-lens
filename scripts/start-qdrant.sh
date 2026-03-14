#!/bin/bash

# Start Qdrant using Docker
echo "Starting Qdrant vector database..."

docker run -p 6333:6333 -p 6334:6334 \
    -v $(pwd)/qdrant_storage:/qdrant/storage:z \
    qdrant/qdrant

echo "Qdrant is running on http://localhost:6333"
echo "Dashboard available at http://localhost:6333/dashboard"