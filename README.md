# Crowdsourced Local Issue Reporting and Resolution Platform

## Overview

This platform allows users to report local issues (e.g., potholes, broken streetlights, garbage collection problems) and collaborate with the community or authorities to resolve them. Users can:
1. Submit reports with details and photos.
2. Track the status of issues.
3. Upvote issues to prioritize resolution.

The project is divided into three main components:
- **Issues Service:** Handles issue creation, updates, and tracking.
- **Notifications & Insights Service:** Sends updates about issue statuses and generates insights.
- **Frontend:** User interface for reporting, tracking, and viewing insights.

## Tech Stack

- **Backend:** Node.js, Express.js, MongoDB
- **Frontend:** React.js
- **Communication:** REST APIs, WebSockets

## Services

### Issues Service

#### Key Features
1. Report Issues: Users submit an issue with location, description, and photo.
2. Track Issues: Display issue statuses (e.g., “Open,” “In Progress,” “Resolved”).
3. Vote for Issues: Allow users to upvote issues to prioritize them.

#### APIs
- `POST /issues`: Create a new issue.
- `GET /issues`: Fetch issues by `id`, `city`, or `area`.
- `PATCH /issues/:id`: Update the status of an issue.
- `POST /issues/:id/upvote`: Upvote an issue.
- `POST /issues/:id/comments`: Add a comment to an issue.
- `DELETE /issues/:id`: Delete a resolved issue.

### Notifications & Insights Service

#### Key Features
1. Notifications: Notify users when:
   - An issue they reported is updated (status change).
   - A nearby issue receives attention.
2. Insights:
   - Aggregate data to show trends (e.g., most common issues in a city).
   - Provide visualizations like pie charts (e.g., “Types of Issues Reported”).

#### APIs
- `POST /notifications/send`: Notify a user about an issue update.
- `GET /insights`: Fetch insights for a specific location (e.g., issue statistics).

## Setup and Installation

### Prerequisites

- Node.js
- MongoDB
- Docker (optional, for containerization)

### Environment Variables

Create a `.env` file in the root of each service directory with the following variables:

#### Issues Service
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<dbname>
JWT_SECRET=<your_jwt_secret>
PORT=3000

#### Notification and Insights Service
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<dbname>
JWT_SECRET=<your_jwt_secret>
PORT=3001
ISSUES_SERVICE_URL=http://localhost:3000/api

### Running the Services

#### Issues Service

1. Navigate to the `issues-service` directory.
2. Install dependencies: `npm install`
3. Start the service: `npm start`

#### Notifications & Insights Service

1. Navigate to the `notifications-insights-service` directory.
2. Install dependencies: `npm install`
3. Start the service: `npm start`

#### Frontend

1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Start the frontend: `npm start`
