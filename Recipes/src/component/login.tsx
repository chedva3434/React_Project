import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextField, Box, Typography } from "@mui/material";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import AuthModal from "./test";
import Footer1 from "./footer";
import { useUser } from "../UseContext/userContext";

type SignInData = {
    UserName: string;
    Password: string;
};

const validationSchema = Yup.object({
    UserName: Yup.string()
        .required("שם משתמש הוא שדה חובה")
        .min(5, "שם המשתמש חייב להיות לפחות 5 תווים"),
    Password: Yup.string()
        .required("הסיסמה היא שדה חובה")
        .min(8, "הסיסמה חייבת להיות לפחות 8 תווים"),
}).required();

const Login = () => {
    const { setUser } = useUser();
    const nav = useNavigate();
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<SignInData>({
        resolver: yupResolver(validationSchema),
    });

    const onSubmit = (data: SignInData) => {
        logIn(data);
    };

    const logIn = async (data: SignInData) => {
        try {
            const response = await axios.post("http://localhost:8080/api/user/login", {
                UserName: data.UserName,
                Password: data.Password
            });
    
            console.log("Response data:", response.data);  // בדוק את התגובה בקונסול
    
            if (response.status === 200 && response.data && response.data.Id) {
                console.log('Valid response:', response.data);
                setUser(response.data);
                sessionStorage.setItem("userId", response.data.Id.toString());  // השתמש ב-Id במקום id                
                nav("/home");
            } else {
                setError("לא נמצאו נתונים תקינים בתגובה");
            }
        } catch (error: any) {
            console.error("Login error:", error.response?.data || error.message);
            setError(error.response?.data?.message || "⚠️ שם משתמש או סיסמה לא נכונים");
        }
    };    

    return (
        <>
        <AuthModal/>
        <Box sx={{ padding: 3, borderRadius: 2, width: 300, margin: 'auto', boxShadow: 3 }}>
            {error && <Typography color="error" sx={{ textAlign: "center", marginBottom: 2 }}>{error}</Typography>}
            
            <form onSubmit={handleSubmit(onSubmit)}>
                <TextField
                    label="שם משתמש"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    {...register("UserName")}
                    error={!!errors.UserName}
                    helperText={errors.UserName?.message}
                />
                <TextField
                    label="סיסמה"
                    type="password"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    {...register("Password")}
                    error={!!errors.Password}
                    helperText={errors.Password?.message}
                />
                <Button
                    type="submit"
                    sx={{
                        backgroundColor: 'black',
                        '&:hover': { backgroundColor: 'black', color: '#d32f2f' },
                        color: 'white',
                        marginTop: 2,
                        width: '100%',
                    }}
                >
                    התחבר
                </Button>
            </form>

            {/* מעבר להרשמה */}
            <Typography sx={{ marginTop: 2, textAlign: "center" }}>
                אין לך חשבון? 
                <Button onClick={() => nav("/SighnIn")} sx={{ textDecoration: "underline", color: "#d32f2f" }}>
                    הירשם כאן
                </Button>
            </Typography>
        </Box>
        <Footer1/>
        </>
    );
};

export default Login;

