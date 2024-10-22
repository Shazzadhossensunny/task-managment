# Task Management Application

## Overview

This is a Task Management application that allows users to create, manage, and filter tasks. Users can search tasks by keyword and filter them based on various criteria, such as status, priority, and custom category tags.

## Features

- Create, edit, and delete tasks
- Filter tasks by status (All, Completed, Pending)
- Filter tasks by priority (Low, Medium, High)
- Custom category tags
- Search tasks by name or description
- Dynamic real-time updates for filtered and searched tasks

## Technologies Used

- Next.js for frontend development
- Redux Toolkit for state management
- MongoDB for the database
- Vanilla CSS

## Setup Instructions

### Prerequisites

- Node.js
- MongoDB (ensure the database is set up and running)

### Installation

1. Clone the repository:

   ```bash
   git clone <https://github.com/Shazzadhossensunny/task-managment>
   cd <task-managment>
   ```

2. Install dependencies with legacy peer dependencies support:

   ```bash
   npm install --legacy-peer-deps
   ```

3. Set up your environment variables:

   - Create a `.env.local` file in the root of the project and add your MongoDB connection string and any other necessary environment variables.

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000` to view the application.
