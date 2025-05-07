import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import App from "./App.tsx";
import Home from "./component/home.tsx";
import Login from "./component/login.tsx";
import { UserProvider } from "./UseContext/userContext.tsx";
import SighnIn from "./component/SighnIn.tsx";
import Recipes from "./component/recipes.tsx";
import CategoryProvider from "./UseContext/cetagoryContext.tsx";
import AddRecipe from "./component/addrecies.tsx";
import MyRecipes from "./component/myRecipe.tsx";


const Routes = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/", element: <Navigate to="/home" />
      },
    ],
  },
  {
    path: "home",
    element: <Home />,
  },
  {
    path: "login",
    element: <Login />, 
  },
  {
    path: "SighnIn",
    element: <SighnIn />,
  },

  {
    path: "/recipes",
    element: <Recipes />, // דף המתכונים
  },
  {
    path:"/addrecies",
    element:<AddRecipe/>
  },
  {
    path:"/myRecipe",
    element:<MyRecipes/>
  }
]);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UserProvider>
      <CategoryProvider>
        <RouterProvider router={Routes} />
      </CategoryProvider>
    </UserProvider>
  </StrictMode>
);