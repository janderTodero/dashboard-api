
# API Dashboard Financeiro

## Base URL
```
https://dashboard-api-1-nnoj.onrender.com/api
```

---

## Autenticação

Todas as rotas de transações requerem o token JWT no header:

```
Authorization: Bearer <token>
```

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
```

**Response 201:**

```json
{
  "user": {
    "id": "64df2a173b9e47359fd301ab",
    "name": "João",
    "email": "joao@email.com"
  }
}
```

---

### POST /api/auth/login  
Fazer login.

**Request Body (JSON):**

```json
{
  "email": "joao@email.com",
  "password": "123456"
}
```

**Response 200:**

```json
{
  "user": {
    "id": "64df2a173b9e47359fd301ab",
    "name": "João",
    "email": "joao@email.com"
  }
}
```

---

## Rotas de Transações

### GET /api/transactions  
Lista todas as transações do usuário autenticado.

**Headers:**

```
Authorization: Bearer <token>
```

**Response 200:**

```json
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
```

---

### POST /api/transactions  
Criar nova transação.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body (JSON):**

```json
{
  "title": "Supermercado",
  "amount": 200,
  "type": "expense",
  "category": "Alimentação",
  "date": "2025-07-30T14:00:00.000Z"
}
```

**Response 201:**

```json
{
  "_id": "64df2a173b9e47359fd301ad",
  "title": "Supermercado",
  "amount": 200,
  "type": "expense",
  "category": "Alimentação",
  "date": "2025-07-30T14:00:00.000Z",
  "user": "64df2a173b9e47359fd301ab"
}
```

---

### GET /api/transactions/:id  
Buscar transação específica.

**Headers:**

```
Authorization: Bearer <token>
```

**Response 200:**

```json
{
  "_id": "64df2a173b9e47359fd301ad",
  "title": "Supermercado",
  "amount": 200,
  "type": "expense",
  "category": "Alimentação",
  "date": "2025-07-30T14:00:00.000Z",
  "user": "64df2a173b9e47359fd301ab"
}
```

---

### PUT /api/transactions/:id  
Atualizar uma transação.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body (JSON):**

```json
{
  "title": "Supermercado Atualizado",
  "amount": 250
}
```

**Response 200:**

```json
{
  "_id": "64df2a173b9e47359fd301ad",
  "title": "Supermercado Atualizado",
  "amount": 250,
  "type": "expense",
  "category": "Alimentação",
  "date": "2025-07-30T14:00:00.000Z",
  "user": "64df2a173b9e47359fd301ab"
}
```

---

### DELETE /api/transactions/:id  
Deletar uma transação.

**Headers:**

```
Authorization: Bearer <token>
```

**Response 200:**

```json
{
  "_id": "64df2a173b9e47359fd301ad",
  "title": "Supermercado Atualizado",
  "amount": 250,
  "type": "expense",
  "category": "Alimentação",
  "date": "2025-07-30T14:00:00.000Z",
  "user": "64df2a173b9e47359fd301ab"
}
```

---

### POST /api/transactions/import
Importar transações via arquivo CSV genérico.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body (Multipart/Form-Data):**

- `file`: Arquivo CSV contendo as transações. Colunas esperadas: `title`, `amount`, `date`.

**Response 201:**

```json
{
  "message": "Transactions imported and categorized successfully",
  "count": 10,
  "sample": [
    {
      "title": "Supermercado",
      "amount": 200,
      "type": "expense",
      "category": "Alimentação",
      "date": "2025-07-30T14:00:00.000Z",
      "user": "..."
    }
  ]
}
```

---

### POST /api/transactions/import-bank-statement
Importar extrato bancário via arquivo CSV. Utiliza IA para categorização automática e resumo de títulos (se necessário). O tipo (receita/despesa) é definido automaticamente pelo sinal do valor.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body (Multipart/Form-Data):**

- `file`: Arquivo CSV do extrato bancário. Colunas esperadas: `date`, `amount`, `title` (ou `description`).

**Response 201:**

```json
{
  "message": "Bank statement imported and categorized successfully",
  "count": 15,
  "sample": [
    {
      "title": "Uber",
      "amount": 25.50,
      "type": "expense",
      "category": "Transporte",
      "date": "2025-07-30T14:00:00.000Z",
      "user": "..."
    }
  ]
}
```

---

## Integração com IA

O projeto utiliza a API do Google Gemini para funcionalidades inteligentes:

- **Categorização Automática:** As transações importadas são analisadas e categorizadas automaticamente (ex: Alimentação, Transporte, Lazer).
- **Resumo de Títulos:** Na importação de extrato bancário, descrições longas são resumidas para títulos mais claros.

**Configuração:**
É necessário configurar a variável de ambiente `GEMINI_API_KEY` no arquivo `.env`.
