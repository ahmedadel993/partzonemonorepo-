import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "./lib/apollo";
import { router } from "./app/router";
import { LanguageProvider } from "./contexts/LanguageContext";
import "./index.css";

const container = document.getElementById("root");
if (!container) throw new Error("#root element not found");

createRoot(container).render(
  <StrictMode>
    <LanguageProvider>
      <ApolloProvider client={apolloClient}>
        <RouterProvider router={router} />
      </ApolloProvider>
    </LanguageProvider>
  </StrictMode>
);
