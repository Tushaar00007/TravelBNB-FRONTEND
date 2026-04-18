import Cookies from "js-cookie";

/**
 * Checks if the user is authenticated.
 * @returns {boolean} True if token/userId exists
 */
export const checkAuth = () => {
    const token = Cookies.get("token");
    const userId = Cookies.get("userId");
    return !!(token && userId);
};

/**
 * Helper to handle protected actions.
 * If authenticated, executes the callback.
 * If not, redirects to login with current path for return.
 * 
 * @param {Function} navigate - React Router navigate function
 * @param {string} currentPath - Current path for redirect back
 * @param {Function} callback - Action to perform if authed
 */
export const handleProtectedRoute = (navigate, currentPath, callback) => {
    if (checkAuth()) {
        callback();
    } else {
        navigate("/login", { state: { redirect: currentPath } });
    }
};
