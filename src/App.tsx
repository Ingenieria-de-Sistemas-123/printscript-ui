import "./App.css";
import { RouterProvider } from "react-router";
import { createBrowserRouter } from "react-router-dom";
import HomeScreen from "./screens/Home.tsx";
import RulesScreen from "./screens/Rules.tsx";
import { QueryClient, QueryClientProvider } from "react-query";
import Auth0ProviderWithNavigate from "./auth/Auth0ProviderWithNavigate";
import { withAuthenticationRequired } from "@auth0/auth0-react";

const router = createBrowserRouter([
    { path: "/", element: <HomeScreen /> },
    { path: "/rules", element: <RulesScreen /> },
]);

export const queryClient = new QueryClient();

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <Auth0ProviderWithNavigate>
                <RouterProvider router={router} />
            </Auth0ProviderWithNavigate>
        </QueryClientProvider>
    );
};

export default withAuthenticationRequired(App);

// Si querés sin login global, exportá App en vez de withAuthenticationRequired(App)
