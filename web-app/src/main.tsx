import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { ConvexReactClient } from 'convex/react'
import App from './App'
import './index.css'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <App />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </React.StrictMode>
);
