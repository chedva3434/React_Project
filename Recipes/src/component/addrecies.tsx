import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios, { AxiosError } from "axios";
import { useState, useEffect } from "react";
import { Button, TextField, Box, Grid, Typography, Container, IconButton, Paper, FormControl, InputLabel, Select, MenuItem, FormHelperText } from "@mui/material";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AuthModal from "./test";

// ✅ הגדרת ה-Type של הנתונים בטופס
type RecipeFormData = {
  Name: string;
  Instructions: { Name: string }[];
  Difficulty: number; // שונה מ-string ל-number
  Duration: number;
  Description: string;
  Categoryid: string;
  Img: string;
  Ingridents: {
    Name: string;
    Count: number;
    Type: string;
  }[];
};


// ✅ סכימת ולידציה עם Yup - גרסה מתוקנת
const validationSchema = yup.object({
  Name: yup.string().required("שם המתכון הוא שדה חובה"),
  Instructions: yup.array().of(
    yup.object({
      Name: yup.string().required("הוראה אחת חובה ")
    })).
    min(1, "חייבים לפחות מרכיב אחד").required("חייבים לפחות מרכיב אחד"),
  Difficulty: yup
    .number()
    .typeError("רמת קושי צריכה להיות מספר")
    .required("רמת קושי היא שדה חובה"),
  Duration: yup
    .number()
    .typeError("משך זמן חייב להיות מספר")
    .required("זמן הכנה הוא שדה חובה")
    .positive("הזמן חייב להיות חיובי"),
  Description: yup.string().required("תיאור המתכון הוא שדה חובה"),
  Categoryid: yup.string().required("מזהה קטגוריה הוא שדה חובה"),
  Img: yup.string().required("יש להזין קישור לתמונה"),
  Ingridents: yup.array().of(
    yup.object({
      Name: yup.string().required("שם המוצר הוא שדה חובה"),
      Count: yup.number().required("כמות המוצר היא שדה חובה"),
      Type: yup.string().required("סוג הכמות הוא שדה חובה"),
    })
  ).min(1, "חייבים לפחות מרכיב אחד").required("חייבים לפחות מרכיב אחד"),
});


const AddRecipe = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<RecipeFormData>({
    resolver: yupResolver(validationSchema),
  });

  const [ingredients, setIngridents] = useState([{ Name: "", Count: undefined, Type: "" }]);
  const [userId, setUserId] = useState<number | null>(null);
  const [categories, setCategories] = useState<{ Id: number; Name: string }[]>([]);
  const [instructions, setInstructions] = useState([{ Name: "" }]);


  // ✅ הוספת שדה רכיב חדש
  const addIngredient = () => {
    setIngridents([...ingredients, { Name: "", Count: undefined, Type: "" }]);
  };

  const addInstruction = () => {
    setInstructions([...instructions, { Name: "" }]);
  };


  useEffect(() => {
    axios.get('http://localhost:8080/api/category')
      .then(response => {
        setCategories(response.data);
      })
      .catch(error => {
        console.error("שגיאה בטעינת הקטגוריות:", error);
      });
  }, []);

  const onSubmit = async (data: RecipeFormData) => {
    if (!userId) {
      alert("משתמש לא מחובר – לא ניתן לשלוח מתכון");
      return;
    }

    const recipeData = {
      Name: data.Name,
      Img: data.Img,

      Instructions: data.Instructions,
      Duration: data.Duration,
       Difficulty: data.Difficulty,
      Description: data.Description,
      UserId: userId, 
      Categoryid: Number(data.Categoryid),
      Ingridents: data.Ingridents
        .map(ingredient => ({
          Name: ingredient.Name,
          Count: ingredient.Count,
          Type: ingredient.Type
        }))
    };
    console.log(JSON.stringify(recipeData, null, 2));

    console.log("✅ נתונים שנשלחים לשרת:", recipeData);

    try {
      const response = await axios.post("http://localhost:8080/api/recipe", recipeData);
      if (response.status === 200) {
        alert("המתכון נוסף בהצלחה!");
        reset();
      } else {
        alert(`שגיאה: ${response.data.message}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("❌ שגיאת Axios:", error);
      } else {
        console.error("❌ שגיאה כללית:", error);
      }
    }
  };

  useEffect(() => {
    const loggedInUserId = sessionStorage.getItem("userId");
    if (loggedInUserId) {
      setUserId(Number(loggedInUserId));
    } else {
      setUserId(null);
    }
  }, []); // רק בהתחלה

  return (
    <>
      <AuthModal />
      {!userId && <p style={{ color: "red" }}>משתמש לא מחובר – לא ניתן לשלוח</p>}
      <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center',marginTop:10 }}>
          <Typography variant="h5" gutterBottom>הוסף מתכון חדש</Typography>
          <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
            {Object.keys(errors).length > 0 && (
              <pre style={{ color: "red" }}>
                יש שגיאות בטופס:
                {JSON.stringify(errors, null, 2)}
              </pre>
            )}
            <Grid container spacing={2}>
              {/* שדות המתכון */}
              <Grid item xs={12}>
                <TextField
                  label="שם המתכון"
                  fullWidth
                  variant="outlined"
                  {...register("Name")}
                  error={!!errors.Name}
                  helperText={errors.Name?.message}
                />
              </Grid>


              <Grid item xs={12}>
                <Typography variant="body1">הוראות הכנה</Typography>
                {instructions.map((_, index) => (
                  <TextField
                    key={index}
                    label={`הוראה ${index + 1}`}
                    fullWidth
                    variant="outlined"
                    {...register(`Instructions.${index}.Name` as const)}
                    error={!!errors.Instructions?.[index]?.Name}
                    helperText={errors.Instructions?.[index]?.Name?.message}
                    sx={{ mb: 1 }}
                  />
                ))}
                <IconButton onClick={addInstruction} color="primary">
                  <AddCircleIcon />
                </IconButton>
              </Grid>


              <Grid item xs={12} sm={6}>
                <TextField
                  label="רמת קושי"
                  fullWidth
                  variant="outlined"
                  type="number"
                  {...register("Difficulty", { valueAsNumber: true })}
                  error={!!errors.Difficulty}
                  helperText={errors.Difficulty?.message}
                />

              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="זמן הכנה (בדקות)"
                  fullWidth
                  variant="outlined"
                  type="number"
                  {...register("Duration")}
                  error={!!errors.Duration}
                  helperText={errors.Duration?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="תיאור קצר"
                  fullWidth
                  variant="outlined"
                  {...register("Description")}
                  error={!!errors.Description}
                  helperText={errors.Description?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.Categoryid}>
                  <InputLabel id="category-label">קטגוריה</InputLabel>
                  <Select
                    labelId="category-label"
                    label="קטגוריה"
                    defaultValue=""
                    {...register("Categoryid", { required: "יש לבחור קטגוריה" })}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat.Id} value={cat.Id}>
                        {cat.Name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{errors.Categoryid?.message}</FormHelperText>
                </FormControl>
              </Grid>


              <Grid item xs={12}>
                <TextField
                  label="קישור לתמונה"
                  fullWidth
                  variant="outlined"
                  {...register("Img")}
                  error={!!errors.Img}
                  helperText={errors.Img?.message}
                />
              </Grid>
              {/* רכיבים */}
              <Grid item xs={12}>
                <Typography variant="body1">רכיבים</Typography>
                {ingredients.map((_, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="שם המוצר"
                      variant="outlined"
                      fullWidth
                      {...register(`Ingridents.${index}.Name`)}
                      error={!!errors.Ingridents?.[index]?.Name}
                      helperText={errors.Ingridents?.[index]?.Name?.message}
                    />
                    <TextField
                      label="כמות"
                      variant="outlined"
                      fullWidth
                      type="number"
                      {...register(`Ingridents.${index}.Count`)}
                      error={!!errors.Ingridents?.[index]?.Count}
                      helperText={errors.Ingridents?.[index]?.Count?.message}
                    />
                    <TextField
                      label="סוג הכמות"
                      variant="outlined"
                      fullWidth
                      {...register(`Ingridents.${index}.Type`)}
                      error={!!errors.Ingridents?.[index]?.Type}
                      helperText={errors.Ingridents?.[index]?.Type?.message}
                    />
                  </Box>
                ))}
                <IconButton onClick={addIngredient} color="primary">
                  <AddCircleIcon />
                </IconButton>
              </Grid>

              {/* כפתור לשליחה */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  sx={{ backgroundColor: "#f48fb1", borderRadius: 3 }}
                  variant="contained"
                  fullWidth
                >
                  הוסף מתכון
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </>
  );
};

export default AddRecipe;
