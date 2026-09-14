# NXTGENSEC CTF Platform



NXTGENSEC is a full-stack cybersecurity Capture The Flag (CTF) platform for practical security learning, competitions, challenge management, player accounts, submissions, scoring, and leaderboards.



## Project Structure



nxtgensec-ctf-platform/

  backend/

  database/

  frontend/

  docs/

  scripts/

  README.md



## Requirements



- Node.js 20+

- PostgreSQL

- npm



## Backend Setup



Open PowerShell or a terminal in the backend directory:



cd backend

npm install



Create the local environment file:



Copy-Item .env.example .env



Configure PostgreSQL credentials and a strong unique JWT secret in .env.



## Database Setup



Apply database/schema.sql to the PostgreSQL database configured in backend/.env.



Example:



psql -U YOUR\_DB\_USER -d YOUR\_DB\_NAME -f database/schema.sql



## Run the Backend



From backend:



npm run dev



Backend:

http://127.0.0.1:4445



Health check:

http://127.0.0.1:4445/health



## Frontend Setup



Open another terminal in frontend:



npm install



npm run dev -- --host 127.0.0.1 --port 4444



Frontend:

http://127.0.0.1:4444



## Production Build



From frontend:



npm run build



Production files are generated in frontend/dist/.



## Production Deployment



The platform can be deployed to a VPS or a managed hosting platform.



Production requires:



- PostgreSQL

- Backend environment variables

- Strong unique JWT secret

- Correct CORS origin

- HTTPS

- Reverse proxy or compatible hosting configuration



The production frontend uses same-origin /api requests.



## Environment Variables



See:



backend/.env.example



Required variables:



PORT

DATABASE\_HOST

DATABASE\_PORT

DATABASE\_NAME

DATABASE\_USER

DATABASE\_PASSWORD

JWT\_SECRET

CORS\_ORIGIN



Never commit a real .env file or production credentials.



## Security



Never publish:



- Database passwords

- JWT secrets

- VPS credentials

- API keys

- Private keys

- .env files



## License



This project is intended for NXTGENSEC cybersecurity education and CTF competition use.


