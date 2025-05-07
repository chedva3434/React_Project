import { useState, useEffect } from "react";
import axios from "axios";
import {
    Box, Typography, Card, CardContent, CardMedia, Button,
    TextField, Dialog, DialogActions, DialogContent, DialogTitle
} from "@mui/material";
import { Rec } from "../moduls/recipe";
import AuthModal from "./test";

const MyRecipe = () => {
    const [recipes, setRecipes] = useState<Rec[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editRecipeData, setEditRecipeData] = useState<Rec | null>(null);
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

    const deleteRecipe = async (recipeId: number) => {
        try {
            await axios.post(`http://localhost:8080/api/recipe/delete/${recipeId}`);
            setRecipes((prev) => prev.filter((recipe) => recipe.Id !== recipeId));
            console.log(`✅ המתכון עם ID ${recipeId} נמחק בהצלחה.`);
        } catch (err) {
            console.error("❌ שגיאה במחיקת המתכון", err);
            alert("לא ניתן למחוק את המתכון. ייתכן שאינך המשתמש שיצר אותו.");
        }
    };

    const editRecipe = async (updatedRecipe: Rec) => {
        try {
            const response = await axios.post("http://localhost:8080/api/recipe/edit", updatedRecipe);
            const newRecipe = response.data;

            setRecipes((prev) =>
                prev.map((r) => (r.Id === newRecipe.Id ? newRecipe : r))
            );
            console.log("✏️ המתכון עודכן בהצלחה:", newRecipe);
            setOpenEditDialog(false);
        } catch (err) {
            console.error("❌ שגיאה בעריכת המתכון", err);
            alert("לא ניתן לערוך את המתכון. ודא שאתה הבעלים.");
        }
    };

    const handleEdit = (recipe: Rec) => {
        if (Number(recipe.UserId) !== userId) {
            alert("לא ניתן לערוך מתכון של משתמש אחר.");
            return;
        }

        setEditRecipeData(recipe);
        setOpenEditDialog(true);
    };

    const handleSaveEdit = () => {
        if (editRecipeData) {
            editRecipe(editRecipeData);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (editRecipeData) {
            setEditRecipeData({
                ...editRecipeData,
                [e.target.name]: e.target.value,
            });
        }
    };

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

                            const byUser = !userId || recipe.UserId === userId;  // סינון לפי ID של המשתמש

                            return byCategory && byDuration && byDifficulty && byUser;  // הוספת הסינון לפי משתמש
                        })
                        .map((recipe) => {
                            const canEdit = Number(recipe.UserId) === userId;

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
                                        image={recipe.Img}
                                        alt={recipe.Name}
                                        sx={{ objectFit: "cover", backgroundColor: "#f0f0f0" }}
                                    />
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom fontWeight="bold">
                                            {recipe.Name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {recipe.Description}
                                        </Typography>

                                        <Typography variant="body2">⏱ {recipe.Duration} דקות</Typography>
                                        <Typography variant="body2">💪 קושי: {recipe.Difficulty}</Typography>
                                        <Typography variant="body2">🍽 קטגוריה: {getCategoryNameById(recipe.Categoryid)}</Typography>

                                        <Box mt={2}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                color="primary"
                                                onClick={() => handleEdit(recipe)}
                                                sx={{ mr: 1 }}
                                            >
                                                ערוך
                                            </Button>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                color="error"
                                                onClick={() => deleteRecipe(recipe.Id)}
                                            >
                                                מחק
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            );
                        })}
                </Box>
            </Box>

            {/* Dialog לעריכת מתכון */}
            {editRecipeData && (
                <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
                    <DialogTitle>ערוך מתכון</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="שם המתכון"
                            value={editRecipeData.Name}
                            name="Name"
                            onChange={handleInputChange}
                            fullWidth sx={{ marginBottom: 2 }}
                        />
                        <TextField
                            label="תיאור"
                            value={editRecipeData.Description}
                            name="Description"
                            onChange={handleInputChange}
                            fullWidth sx={{ marginBottom: 2 }}
                        />
                        <TextField
                            label="זמן הכנה"
                            value={editRecipeData.Duration}
                            name="Duration"
                            onChange={handleInputChange}
                            fullWidth sx={{ marginBottom: 2 }}
                        />
                        <TextField
                            label="דרגת קושי"
                            value={editRecipeData.Difficulty}
                            name="Difficulty"
                            onChange={handleInputChange}
                            fullWidth sx={{ marginBottom: 2 }}
                        />
                        <TextField
                            label="קטגוריה"
                            value={editRecipeData.Categoryid}
                            name="Categoryid"
                            onChange={handleInputChange}
                            fullWidth sx={{ marginBottom: 2 }}
                        />
                        <TextField
                            label="רכיבים"
                            value={editRecipeData.Ingridents?.map(ing => ing.Name).join(", ")}
                            name="Ingridents"
                            onChange={(e) =>
                                setEditRecipeData({
                                    ...editRecipeData,
                                    Ingridents: e.target.value.split(", ").map(name => ({ Name: name.trim() }))
                                })
                            }
                            fullWidth sx={{ marginBottom: 2 }}
                        />
                        <TextField
                            label="הוראות"
                            value={editRecipeData.Instructions?.map(ins => ins.Name).join(", ")}
                            name="Instructions"





                            onChange={(e) =>
                                setEditRecipeData({
                                    ...editRecipeData,
                                    Instructions: e.target.value.split(", ").map(name => ({ Name: name.trim() }))
                                })
                            }
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenEditDialog(false)} color="secondary">
                            ביטול
                        </Button>
                        <Button onClick={handleSaveEdit} color="primary">
                            שמור
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </>
    );
};

export default MyRecipe;