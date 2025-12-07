import { Routes, Route, Navigate } from "react-router-dom";

import './App.css'

import SignUpForm from './pages/sign-up.jsx'
import SignInForm from './pages/sign-in.jsx';
import DashBoard from './pages/dashboard.jsx';
import Home from './pages/home.jsx';
import Projects from './pages/project.jsx'
import ProjectDetail from './pages/projectDetail.jsx' // <- new page
import ProjectInvite from "./pages/projectInvite.jsx";

import { NotificationProvider } from "./components/notificationContext.jsx";
import Layout from "./components/layout.jsx";

function App() {
  return (
    <NotificationProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignInForm />} />
        <Route path="/signup" element={<SignUpForm />} />

        {/* Authenticated Routes with Sidebar + Navbar */}
        <Route
          path="/dashboard"
          element={
            <Layout defaultActive="Dashboard">
              <DashBoard />
            </Layout>
          }
        />
        <Route
          path="/projects"
          element={
            <Layout defaultActive="Projects">
              <Projects />
            </Layout>
          }
        />
        {/* Dynamic Project Route */}
        <Route
          path="/projects/:projectId"
          element={
            <Layout defaultActive="Projects">
              <ProjectDetail />
            </Layout>
          }
        />

        <Route
          path="/invites"
          element={
            <Layout defaultActive="ProjectInvite">
              <ProjectInvite />
            </Layout>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </NotificationProvider>
  )
}

export default App;
