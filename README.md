# API Dashboard Financeiro

## Base URL
http://localhost:5000/api

yaml
Copiar
Editar

---

## Autenticação

Todas as rotas de transações requerem o token JWT no header:

Authorization: Bearer <token>

yaml
Copiar
Editar

---

## Rotas de Usuário

### POST /api/auth/register  
Registrar novo usuário.

**Request Body (JSON):**

```json
{
  "name": "João",
  "email": "joao@email.com",
  "password": "123456"
}
Response 201:

json
Copiar
Editar
{
  "user": {
    "id": "64df2a173b9e47359fd301ab",
    "name": "João",
    "email": "joao@email.com"
  }
}
POST /api/auth/login
Fazer login.

Request Body (JSON):

json
Copiar
Editar
{
  "email": "joao@email.com",
  "password": "123456"
}
Response 200:

json
Copiar
Editar
{
  "user": {
    "id": "64df2a173b9e47359fd301ab",
    "name": "João",
    "email": "joao@email.com"
  }
}
Rotas de Transações
GET /api/transactions
Lista todas as transações do usuário autenticado.

Headers:

makefile
Copiar
Editar
Authorization: Bearer <token>
Response 200:

json
Copiar
Editar
[
  {
    "_id": "64df2a173b9e47359fd301ac",
    "title": "Salário",
    "amount": 5000,
    "type": "income",
    "category": "Trabalho",
    "date": "2025-07-30T10:00:00.000Z",
    "user": "64df2a173b9e47359fd301ab"
  }
]
POST /api/transactions
Criar nova transação.

Headers:

makefile
Copiar
Editar
Authorization: Bearer <token>
Request Body (JSON):

json
Copiar
Editar
{
  "title": "Supermercado",
  "amount": 200,
  "type": "expense",
  "category": "Alimentação",
  "date": "2025-07-30T14:00:00.000Z"
}
Response 201:

json
Copiar
Editar
{
  "_id": "64df2a173b9e47359fd301ad",
  "title": "Supermercado",
  "amount": 200,
  "type": "expense",
  "category": "Alimentação",
  "date": "2025-07-30T14:00:00.000Z",
  "user": "64df2a173b9e47359fd301ab"
}
GET /api/transactions/:id
Buscar transação específica.

Headers:

makefile
Copiar
Editar
Authorization: Bearer <token>
Response 200:

json
Copiar
Editar
{
  "_id": "64df2a173b9e47359fd301ad",
  "title": "Supermercado",
  "amount": 200,
  "type": "expense",
  "category": "Alimentação",
  "date": "2025-07-30T14:00:00.000Z",
  "user": "64df2a173b9e47359fd301ab"
}