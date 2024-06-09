import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import LoginForm from './pages/auth/login-form.tsx'
import HeaderLayout from './components/layout/HeaderLayout.tsx'
import SignUpForm from './pages/auth/signup-form.tsx'
import { AuthProvider } from './context/AuthProvider.tsx'
import UserEdit from './pages/user/user-edit.tsx'
import Chat from './pages/chat/chat.tsx'
import ProtectedRoute from './pages/protect-routes.tsx'
import { Toaster } from "@/components/ui/sonner"


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<HeaderLayout />}>

      <Route index path="/" element={<App />} />

      <Route path='chats' element={
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      } />

      <Route path="user/edit" element={
        <ProtectedRoute>
          <UserEdit />
        </ProtectedRoute>
      } />

      <Route path='auth/login' element={<LoginForm />} />
      <Route path='auth/signup' element={<SignUpForm />} />
    </Route>
  )
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <Toaster />
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)
