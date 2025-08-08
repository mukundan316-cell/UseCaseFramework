# Questionnaire API Endpoints Documentation

## Overview

The Questionnaire API provides comprehensive endpoints for managing questionnaires, response sessions, and scoring calculations within the RSA AI Use Case Value Framework. All endpoints follow RESTful conventions with proper status codes and error handling.

## Base URL
```
http://localhost:5000/api
```

## Endpoints

### 1. Get Questionnaire with Sections and Questions

**Endpoint:** `GET /api/questionnaires/:id`

**Description:** Retrieve a complete questionnaire with all sections, questions, and options hierarchically organized.

**Parameters:**
- `id` (path): Questionnaire UUID

**Response Format:**
```json
{
  "id": "uuid",
  "title": "RSA AI Maturity Assessment",
  "description": "Evaluate your organization's AI readiness",
  "version": "1.0",
  "status": "active",
  "createdAt": "2025-01-08T...",
  "updatedAt": "2025-01-08T...",
  "sections": [
    {
      "id": "uuid",
      "title": "AI Strategy & Governance",
      "sectionOrder": 1,
      "estimatedTime": 10,
      "questions": [
        {
          "id": "uuid",
          "questionText": "How would you rate your AI strategy maturity?",
          "questionType": "scale",
          "isRequired": "true",
          "questionOrder": 1,
          "helpText": "Consider governance, ethics, and strategic alignment",
          "options": []
        }
      ]
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Questionnaire found and returned
- `404 Not Found` - Questionnaire not found
- `500 Internal Server Error` - Database or server error

---

### 2. Start New Response Session

**Endpoint:** `POST /api/responses/start`

**Description:** Initiate a new questionnaire response session for a respondent.

**Request Body:**
```json
{
  "questionnaireId": "uuid",
  "respondentEmail": "user@rsa.co.uk",
  "respondentName": "John Smith (optional)",
  "metadata": {
    "department": "Underwriting",
    "role": "Senior Manager"
  }
}
```

**Response Format:**
```json
{
  "id": "response-uuid",
  "questionnaireId": "uuid",
  "respondentEmail": "user@rsa.co.uk",
  "respondentName": "John Smith",
  "status": "started",
  "startedAt": "2025-01-08T...",
  "completedAt": null,
  "totalScore": null,
  "metadata": "{\"department\":\"Underwriting\"}"
}
```

**Validation Rules:**
- `questionnaireId`: Required, must be valid UUID
- `respondentEmail`: Required, must be valid email format
- `respondentName`: Optional string
- `metadata`: Optional object with additional context

**Status Codes:**
- `201 Created` - Response session started successfully
- `400 Bad Request` - Validation error or questionnaire not active
- `404 Not Found` - Questionnaire not found
- `500 Internal Server Error` - Database error

---

### 3. Save Individual Answers

**Endpoint:** `PUT /api/responses/:id/answers`

**Description:** Save or update answers for specific questions in a response session.

**Parameters:**
- `id` (path): Response session UUID

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "uuid",
      "answerValue": "4",
      "score": 4
    },
    {
      "questionId": "uuid",
      "answerValue": "automation",
      "score": 3
    }
  ]
}
```

**Response Format:**
```json
[
  {
    "id": "answer-uuid",
    "responseId": "response-uuid",
    "questionId": "question-uuid",
    "answerValue": "4",
    "score": 4,
    "answeredAt": "2025-01-08T..."
  }
]
```

**Features:**
- Updates existing answers if they already exist for a question
- Creates new answers for new questions
- Supports batch answer submission
- Automatic timestamp management

**Status Codes:**
- `200 OK` - Answers saved successfully
- `400 Bad Request` - Validation error or response already completed
- `404 Not Found` - Response session not found
- `500 Internal Server Error` - Database error

---

### 4. Complete Questionnaire

**Endpoint:** `POST /api/responses/:id/complete`

**Description:** Mark a response session as completed and calculate final scores.

**Parameters:**
- `id` (path): Response session UUID

**Request Body:** None required

**Response Format:**
```json
{
  "id": "response-uuid",
  "questionnaireId": "questionnaire-uuid",
  "respondentEmail": "user@rsa.co.uk",
  "status": "completed",
  "startedAt": "2025-01-08T...",
  "completedAt": "2025-01-08T...",
  "totalScore": 42,
  "metadata": "{...}"
}
```

**Features:**
- Automatically calculates total score from all answered questions
- Sets completion timestamp
- Prevents further modifications to the response
- Only works on responses in 'started' status

**Status Codes:**
- `200 OK` - Response completed successfully
- `400 Bad Request` - Response already completed
- `404 Not Found` - Response session not found
- `500 Internal Server Error` - Database error

---

### 5. Calculate Maturity Scores

**Endpoint:** `GET /api/responses/:id/scores`

**Description:** Calculate and return detailed maturity scores and levels for a completed response.

**Parameters:**
- `id` (path): Response session UUID

**Response Format:**
```json
{
  "responseId": "uuid",
  "totalScore": 42,
  "completedAt": "2025-01-08T...",
  "averageScores": {
    "scale": {
      "average": 4.2,
      "count": 5,
      "total": 21
    },
    "select": {
      "average": 3.5,
      "count": 3,
      "total": 10.5
    }
  },
  "maturityLevels": {
    "scale": {
      "average": 4.2,
      "count": 5,
      "total": 21,
      "level": "Managed",
      "percentage": 84
    }
  },
  "overallAverage": 3.85
}
```

**Maturity Levels:**
- `Initial` (< 1.5): Basic awareness, ad-hoc processes
- `Repeatable` (1.5-2.5): Some documented processes
- `Defined` (2.5-3.5): Standardized processes across organization
- `Managed` (3.5-4.5): Measured and controlled processes
- `Optimized` (≥ 4.5): Continuous improvement and optimization

**Status Codes:**
- `200 OK` - Scores calculated successfully
- `404 Not Found` - Response session not found
- `500 Internal Server Error` - Database error

---

### 6. Get Response with Answers

**Endpoint:** `GET /api/responses/:id`

**Description:** Retrieve a response session with all associated answers.

**Parameters:**
- `id` (path): Response session UUID

**Response Format:**
```json
{
  "id": "response-uuid",
  "questionnaireId": "questionnaire-uuid",
  "respondentEmail": "user@rsa.co.uk",
  "status": "completed",
  "totalScore": 42,
  "answers": [
    {
      "id": "answer-uuid",
      "questionId": "question-uuid",
      "answerValue": "4",
      "score": 4,
      "answeredAt": "2025-01-08T..."
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Response retrieved successfully
- `404 Not Found` - Response session not found
- `500 Internal Server Error` - Database error

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": [
    {
      "field": "fieldName",
      "message": "Validation error details"
    }
  ]
}
```

## Example Usage Flow

### 1. Get Available Questionnaire
```bash
curl -X GET "http://localhost:5000/api/questionnaires/91684df8-9700-4605-bc3e-2320120e5e1b"
```

### 2. Start Response Session
```bash
curl -X POST "http://localhost:5000/api/responses/start" \
  -H "Content-Type: application/json" \
  -d '{
    "questionnaireId": "91684df8-9700-4605-bc3e-2320120e5e1b",
    "respondentEmail": "manager@rsa.co.uk",
    "respondentName": "Sarah Johnson"
  }'
```

### 3. Submit Answers
```bash
curl -X PUT "http://localhost:5000/api/responses/{response-id}/answers" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {
        "questionId": "c1b783b2-d0dd-4c8a-9e83-c74cc0ed73e2",
        "answerValue": "4",
        "score": 4
      }
    ]
  }'
```

### 4. Complete Response
```bash
curl -X POST "http://localhost:5000/api/responses/{response-id}/complete"
```

### 5. Get Maturity Scores
```bash
curl -X GET "http://localhost:5000/api/responses/{response-id}/scores"
```

## Integration Notes

- All endpoints use UUID identifiers for security and scalability
- Timestamps are in ISO 8601 format with timezone information
- Scores are calculated in real-time using database aggregations
- Response sessions maintain complete audit trails
- Metadata fields support flexible JSON storage for contextual information

## Database-First Architecture

- No hardcoded questionnaire content
- All questions, options, and scoring rules stored in database
- Dynamic questionnaire generation from database schema
- Full CRUD operations on questionnaire structure
- Referential integrity maintained through foreign key constraints

---

*Created: January 2025*  
*API Version: 1.0*  
*Framework: RSA AI Use Case Value Framework*