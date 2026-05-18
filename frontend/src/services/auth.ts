const API_URL = 'http://localhost:8080/api/auth';

export interface AuthResponse {
    token: string;
    username: string;
    tier: 'free' | 'premium' | 'admin';
}

export const authService = {
    // Отправка POST-запроса на регистрацию нового пользователя
    async register(username: string, password: string): Promise<string> {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Ошибка при регистрации');
        }
        return response.text();
    },

    // Отправка POST-запроса на логин
    async login(username: string, password: string): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Неверное имя пользователя или пароль');
        }
        return response.json(); // Возвращает JSON { token, username, tier }
    }
};