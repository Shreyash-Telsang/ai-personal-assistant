# AI Task Assistant

AI Task Assistant is a modern web application that combines task management with AI-powered assistance to help you stay organized and productive.

## Features

- **AI-powered Assistant**: Natural language task creation, reminders, and suggestions
- **Smart To-Do Lists**: Create, organize, and track tasks with priorities and categories
- **Focus Mode**: Pomodoro timer to enhance productivity
- **Calendar View**: Visual representation of your tasks and schedule
- **Notes & Journal**: Capture your ideas and thoughts
- **User Dashboard**: Quick overview of your day with stats and upcoming tasks
- **Dark Mode**: Customize your visual experience

## Technology Stack

- **Frontend**: React, TypeScript, Material-UI
- **State Management**: Zustand
- **Routing**: React Router
- **Date Management**: date-fns, MUI DatePicker
- **Charts**: Recharts (for analytics)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ai-task-assistant.git
   cd ai-task-assistant
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── assistant/        # AI Assistant components
│   ├── common/           # Shared components
│   ├── layout/           # Layout components
│   ├── tasks/            # Task-related components
│   ├── calendar/         # Calendar components
│   └── focus/            # Focus mode components
├── pages/                # Application pages
│   ├── auth/             # Authentication pages
│   ├── Dashboard.tsx     # Home dashboard
│   ├── TasksPage.tsx     # Task management page
│   ├── AssistantPage.tsx # AI assistant chat interface
│   ├── CalendarPage.tsx  # Calendar view
│   ├── FocusPage.tsx     # Focus/Pomodoro timer
│   ├── NotesPage.tsx     # Notes and journal
│   └── SettingsPage.tsx  # User settings
├── store/                # Zustand state management
│   ├── taskStore.ts      # Task-related state
│   ├── userStore.ts      # User authentication and preferences
│   ├── assistantStore.ts # AI assistant state
│   └── themeStore.ts     # UI theme state
├── services/             # API and external services
├── hooks/                # Custom React hooks
├── utils/                # Utility functions
├── types/                # TypeScript type definitions
└── assets/               # Static assets
```

## Login Credentials (Demo)

For demonstration purposes, you can use any email/password combination to log in, or use the Google/Facebook buttons for quick access.

## Usage Examples

- **Creating a task with AI**: Type "Remind me to buy milk tomorrow at 5 PM" in the AI Assistant
- **Starting a focus session**: Navigate to the Focus page and start a Pomodoro timer
- **Adding a quick task**: Use the quick add feature on the Dashboard
- **Setting task priorities**: Create or edit tasks and set their priority levels

## Future Enhancements

- **Voice Command Support**: Hands-free task creation and management
- **Google Calendar Integration**: Sync with your existing calendar
- **Data Visualization**: More detailed productivity analytics
- **Mobile App**: Native mobile experience with push notifications
- **AI Improvements**: Better natural language understanding and predictive suggestions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
