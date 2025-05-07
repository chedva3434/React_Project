import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextField, Box, Typography } from "@mui/material";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useUser } from "../UseContext/userContext";
import Recipes from "./recipes";
import AuthModal from "./test";
import Footer1 from "./footer";

export type UserForSighn = {
    password: string;
    name: string;
    userName: string;
    phone: string;
    email: string;
    tz: string;
};

const validationSchema = Yup.object({
    userName: Yup.string().required("שם המשתמש חובה").min(5, "לפחות 5 תווים"),
    password: Yup.string().required("הסיסמה חובה").min(8, "לפחות 8 תווים"),
    name: Yup.string().required("השם מלא חובה"),
    phone: Yup.string().required("הטלפון חובה").matches(/^[0-9]{10}$/, "הטלפון חייב להיות 10 ספרות"),
    email: Yup.string().email("כתובת אימייל לא תקינה").required("האימייל חובה"),
    tz: Yup.string().required("תעודת זהות חובה").length(9, "חייב להיות 9 ספרות"),
}).required();

const SighnIn = () => {
    const { setUser } = useUser();
    const nav = useNavigate();
    const [isLogin, setIsLogin] = useState(false); 

    const { register, handleSubmit, formState: { errors } } = useForm<UserForSighn>({
        resolver: yupResolver(validationSchema),
    });

    const onSubmit = (data: UserForSighn) => {
        signInUser(data);
    };

    const signInUser = async (data: UserForSighn) => {
        const payload = {
            UserName: data.userName,
            Password: data.password,
            Name: data.name,
            Phone: data.phone,
            Email: data.email,
            Tz: data.tz,
        };
    
        // הדפסת המידע שנשלח לשרת בפורמט JSON מסודר
        console.log("📤 נתונים שנשלחים לשרת:", JSON.stringify(payload, null, 2));
    
        try {
            const response = await axios.post('http://localhost:8080/api/user/sighin', payload);
            setUser(response.data);
            sessionStorage.setItem("userId", response.data.Id.toString());    
            nav("/home");
        } catch (error: any) {
            console.error("❌ שגיאה בהרשמה:", error);
        }
    };
    

    return (
        <>
        <AuthModal/>
        <Box sx={{ padding: 3, borderRadius: 2, width: 300, margin: 'auto', boxShadow: 3 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <TextField label="שם מלא" fullWidth margin="normal" variant="outlined" {...register("name")} error={!!errors.name} helperText={errors.name?.message} />
                <TextField label="שם משתמש" fullWidth margin="normal" variant="outlined" {...register("userName")} error={!!errors.userName} helperText={errors.userName?.message} />
                <TextField label="סיסמה" type="password" fullWidth margin="normal" variant="outlined" {...register("password")} error={!!errors.password} helperText={errors.password?.message} />
                <TextField label="מספר טלפון" fullWidth margin="normal" variant="outlined" {...register("phone")} error={!!errors.phone} helperText={errors.phone?.message} />
                <TextField label="אימייל" fullWidth margin="normal" variant="outlined" {...register("email")} error={!!errors.email} helperText={errors.email?.message} />
                <TextField label="תעודת זהות" fullWidth margin="normal" variant="outlined" {...register("tz")} error={!!errors.tz} helperText={errors.tz?.message} />

                <Button type="submit" sx={{ backgroundColor: 'black', color: 'white', marginTop: 2, width: '100%' }}>הרשם</Button>
            </form>

        
            {isLogin && <Recipes />}
        </Box>
        <Footer1/>
        </>
    );
};

export default SighnIn;
