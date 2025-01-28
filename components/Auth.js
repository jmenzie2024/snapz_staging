import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from "next/router";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const logoutNew = () => {
        setIsAuthenticated(false);
        localStorage.clear();
        router.push("/");
        //localStorage.removeItem('userToken'); // Adjust according to your auth mechanism
    };

    useEffect(() => {
        // Check localStorage or cookies to set authentication status on mount
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
        }

        const handleBeforeUnload = (event) => {
            logoutNew(); // Call logout when the user closes the browser
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, login: () => setIsAuthenticated(true), logoutNew }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
