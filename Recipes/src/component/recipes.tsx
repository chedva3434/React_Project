import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box, Typography, Card, CardContent, CardMedia, Button,
  TextField
} from "@mui/material";
import { Rec } from "../moduls/recipe";
import AuthModal from "./test";

const Recipes = () => {
  const [recipes, setRecipes] = useState<Rec[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  const [filters, setFilters] = useState({
    category: '',
    duration: '',
    difficulty: '',
    createdBy: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/category");
        setCategories(response.data);
      } catch (err) {
        console.error("שגיאה בטעינת הקטגוריות", err);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryNameById = (id: number | string) => {
    const category = categories.find((cat) => cat.Id === Number(id));
    return category ? category.Name : "לא זוהתה קטגוריה";
  };

  useEffect(() => {
    const loggedInUserId = sessionStorage.getItem("userId");
    if (loggedInUserId && !isNaN(Number(loggedInUserId))) {
      setUserId(Number(loggedInUserId));
    }

    const fetchRecipes = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/recipe");
        setRecipes(response.data);
      } catch (err) {
        setError("❌ לא הצלחנו לטעון את המתכונים. אנא נסה שוב מאוחר יותר.");
        console.error(err);
      }
    };

    fetchRecipes();
  }, []);



  const resetFilters = () => {
    setFilters({
      category: '',
      duration: '',
      difficulty: '',
      createdBy: '',
    });
  };

  return (
    <>
      <AuthModal />
      <Box sx={{ padding: 3, direction: "rtl", marginTop: 10 }}>
        <Typography variant="h4" gutterBottom>
          🍽️ המתכונים שלנו
        </Typography>
        {error && <Typography color="error">{error}</Typography>}

        {/* סינון */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
          <TextField
            label="סנן לפי קטגוריה"
            select
            SelectProps={{ native: true }}
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">הכל</option>
            {categories.map((cat) => (
              <option key={cat.Id} value={cat.Id}>
                {cat.Name}
              </option>
            ))}
          </TextField>

          <TextField
            label="זמן מקסימלי (בדקות)"
            type="number"
            value={filters.duration}
            onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
          />

          <TextField
            label="דרגת קושי"
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
          />

          <Button variant="outlined" color="secondary" onClick={resetFilters}>
            איפוס סינון
          </Button>
        </Box>

        {/* רשימת מתכונים */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "flex-start" }}>
          {recipes
            .filter((recipe) => {
              const categoryFilter = filters.category ? Number(filters.category) : undefined;
              const byCategory =
                categoryFilter === undefined || recipe.Categoryid === categoryFilter;

              const byDuration = !filters.duration || Number(recipe.Duration) <= Number(filters.duration);
              const byDifficulty =
                !filters.difficulty ||
                Number(recipe.Difficulty) === Number(filters.difficulty);
              return byCategory && byDuration && byDifficulty;
            })
            .map((recipe) => {

              return (
                <Card
                  key={recipe.Id}
                  sx={{
                    width: 250,
                    position: "relative",
                    boxShadow: 3,
                    transition: "0.3s",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={recipe.Img} // הנחת שיש שדה ImageUrl במודל המתכון
                    alt={recipe.Name}
                    sx={{ objectFit: "cover", backgroundColor: "#f0f0f0" }}

                  />

                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {recipe.Name}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {recipe.Description}
                    </Typography>

                    <Typography variant="body2">
                      <strong>⏱ זמן הכנה:</strong> {recipe.Duration} דקות
                    </Typography>
                    <Typography variant="body2">
                      <strong>💪 דרגת קושי:</strong> {recipe.Difficulty}
                    </Typography>
                    <Typography variant="body2">
                      <strong>🍽 קטגוריה:</strong> {getCategoryNameById(recipe.Categoryid)}
                    </Typography>

                    <Typography variant="body2" sx={{ marginTop: 1 }}>
                      <strong>🧂 רכיבים:</strong>
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                      {Array.isArray(recipe.Ingridents) && recipe.Ingridents.length > 0 ? (
                        recipe.Ingridents.map((ing, index) => <li key={index}>{ing.Name}</li>)
                      ) : (
                        <li>אין רכיבים</li>
                      )}
                    </ul>

                    <Typography variant="body2" sx={{ marginTop: 1 }}>
                      <strong>📋 הוראות:</strong>
                    </Typography>
                    <ol style={{ margin: 0, paddingLeft: "1.2rem" }}>
                      {Array.isArray(recipe.Instructions) && recipe.Instructions.length > 0 ? (
                        recipe.Instructions.map((ins, index) => <li key={index}>{ins.Name}</li>)
                      ) : (
                        <li>אין הוראות</li>
                      )}
                    </ol>
                  </CardContent>
                </Card>
              );
            })}
        </Box>
      </Box>

    </>
  );
};

export default Recipes;
