# Contactless Cafe Ordering System



## Prerequisites

- Node.js (v18+)

- Docker Desktop



## Setup



```bash

# 1. Clone

git clone <repo-url>

cd contactless-cafe



# 2. Start MongoDB

docker-compose up -d



# 3. Backend

cd backend

npm install

copy .env.example .env

npm run seed

npm run dev



# 4. Frontend (open 3 new terminals)

cd frontend/customer-app \&\& npm install \&\& npm run dev

cd frontend/kitchen-dashboard \&\& npm install \&\& npm run dev

cd frontend/owner-dashboard \&\& npm install \&\& npm run dev

