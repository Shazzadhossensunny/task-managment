import { Providers } from './providers'
import '../styles/components/TaskList.css'
import '../styles/components/TaskForm.css'
import '../styles/global.css'
import '../styles/components/EditTaskModal.css'



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Task Management System</title>
      </head>
      <body className="min-h-screen bg-gray-50">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}