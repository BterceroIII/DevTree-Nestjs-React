import { Link, useLocation, useNavigate } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage";
import { RegisterForm } from "../schema";
import { useForm } from "react-hook-form";
import { registerUser } from "../api/auth";
import { isAxiosError } from "axios";
import { toast } from "sonner";


export default function RegisterView() {
    const location = useLocation();
    const navigate = useNavigate();
    const initialValues: RegisterForm = {
        name: "",
        email: "",
        handle: location.state?.handle || "",
        password: "",
        password_confirmation: "",
    }

    const { register, watch, reset, handleSubmit, formState: { errors} } = useForm({ defaultValues: initialValues });
    const password = watch('password');

    const handleRegister = async (formData : RegisterForm) => {
        try {
            const result = await registerUser(formData.name, formData.email, formData.password, formData.handle);
            
            toast.success(result.message, {className: "bg-green-400 text-slate-800"});
            reset();
            navigate("/auth/login");
        } catch (error) {
            if (isAxiosError(error) && error.response) {
                toast.error(error.response.data.message);
              } else {
                toast.error("Error inesperado al registrar usuario");
              }
        }
    }


    return (
        <>
            <h1 className="text-4xl text-white font-bold">Crear Cuenta</h1>

            <form 
                onSubmit={handleSubmit(handleRegister)}
                className="bg-white px-5 py-20 rounded-lg space-y-10 mt-10"
            >
                <div className="grid grid-col-1 space-y-3">
                    <label htmlFor="name" className="text-2xl text-slate-500">Nombre</label>
                    <input
                        id="name" 
                        type="text" 
                        placeholder="Tu Nombre"
                        className="bg-slate-100 border-none p-3 rounded-lg placeholder-slate-400"
                        {...register('name', {
                            required: { value: true, message: 'Nombre es requerido' }
                        })}
                    />
                    {errors.name && <ErrorMessage >{errors.name.message}</ErrorMessage>}
                </div>
                <div className="grid grid-cols-1 space-y-3">
                    <label htmlFor="email" className="text-2xl text-slate-500">E-mail</label>
                    <input
                        id="email" 
                        type="text" 
                        placeholder="Tu E-mail"
                        className="bg-slate-100 border-none p-3 rounded-lg placeholder-slate-400"
                        {...register('email', {
                            required: { value: true, message: 'E-mail es requerido' },
                            pattern: {
                                value: /\S+@\S+\.\S+/,
                                message: "E-mail no válido",
                            },
                        })}
                    />
                    {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
                </div>
                <div className="grid grid-cols-1 space-y-3">
                    <label htmlFor="handle" className="text-2xl text-slate-500">Handle</label>
                    <input
                        id="handle"
                        type="text"
                        placeholder="Nombre de usuario: sin espacios"
                        className="bg-slate-100 border-none p-3 rounded-lg placeholder-slate-400"
                        {...register('handle', {
                            required: "El Handle es obligatorio"
                        })}
                    />
                    {errors.handle && <ErrorMessage>{errors.handle.message}</ErrorMessage>}
                </div>
                <div className="grid grid-cols-1 space-y-3">
                    <label htmlFor="password" className="text-2xl text-slate-500">Password</label>
                    <input
                        id="password" 
                        type="password" 
                        placeholder="Tu Password"
                        className="bg-slate-100 border-none p-3 rounded-lg placeholder-slate-400"
                        {...register('password', {
                            required: { value: true, message: 'Password es requerido' },
                            minLength: {
                                value: 8,
                                message: 'Password debe tener al menos 8 caracteres',
                            },
                        })}
                    />
                    {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
                </div>
                <div className="grid grid-cols-1 space-y-3">
                    <label htmlFor="password_confirmation" className="text-2xl text-slate-500">Repetir Password</label>
                    <input
                        id="password_confirmation"
                        type="password"
                        placeholder="Repetir Password"
                        className="bg-slate-100 border-none p-3 rounded-lg placeholder-slate-400"
                        {...register('password_confirmation', {
                            required: "Repetir Password es obligatorio",
                            validate: (value) => value === password || 'Los passwords no son iguales'
                        })}
                    />
                    {errors.password_confirmation && <ErrorMessage>{errors.password_confirmation.message}</ErrorMessage>}
                </div>
                <input
                    type="submit"
                    className="bg-cyan-400 p-3 text-lg w-full uppercase text-slate-600 rounded-lg font-bold cursor-pointer"
                    value='Crear Cuenta'
                />
            </form>

            <nav className="mt-10">
                <Link
                    className="text-center text-white text-lg block"
                    to="/auth/login"
                >¿Ya tienes una cuenta? Inicia Sesión</Link>
            </nav>
        </>
    )
}
