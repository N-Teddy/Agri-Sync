import { ApiClient } from '../utils/api-client';
import { generateUserData } from '../utils/data-generators';
import { USER_CREDENTIALS } from '../config';

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        fullName: string;
    };
}

export class AuthSeeder {
    constructor(private apiClient: ApiClient) { }

    async registerAndLogin(index: number): Promise<AuthResponse> {
        const userData = generateUserData(index);

        console.log(`📝 Registering user: ${userData.email}`);

        // Register
        const registerResponse = await this.apiClient.post<AuthResponse>(
            '/auth/register',
            {
                ...userData,
                password: USER_CREDENTIALS.password,
                rememberMe: USER_CREDENTIALS.rememberMe,
            }
        );

        // Set token for subsequent requests
        this.apiClient.setAccessToken(registerResponse.accessToken);

        console.log(`✅ User registered and logged in: ${userData.email}`);

        return registerResponse;
    }

    async login(email: string): Promise<AuthResponse> {
        console.log(`🔐 Logging in: ${email}`);

        const loginResponse = await this.apiClient.post<AuthResponse>(
            '/auth/login',
            {
                email,
                password: USER_CREDENTIALS.password,
                rememberMe: USER_CREDENTIALS.rememberMe,
            }
        );

        this.apiClient.setAccessToken(loginResponse.accessToken);

        console.log(`✅ Logged in: ${email}`);

        return loginResponse;
    }
}
