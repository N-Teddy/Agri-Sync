import { ApiClient } from '../utils/api-client';
import { generateUserData } from '../utils/data-generators';
import { BaseApiResponse, USER_CREDENTIALS } from '../config';

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
        const response = await this.apiClient.post<BaseApiResponse<AuthResponse>>(
            '/auth/register',
            {
                ...userData,
                password: USER_CREDENTIALS.password,
                rememberMe: USER_CREDENTIALS.rememberMe,
            }
        );

        if (!response.data) {
            throw new Error('No data returned from register');
        }

        // Set token for subsequent requests
        this.apiClient.setAccessToken(response.data.accessToken);

        console.log(`✅ User registered and logged in: ${userData.email}`);

        return response.data;
    }

    async login(email: string): Promise<AuthResponse> {
        console.log(`🔐 Logging in: ${email}`);

        const response = await this.apiClient.post<BaseApiResponse<AuthResponse>>(
            '/auth/login',
            {
                email,
                password: USER_CREDENTIALS.password,
                rememberMe: USER_CREDENTIALS.rememberMe,
            }
        );

        if (!response.data) {
            throw new Error('No data returned from login');
        }

        this.apiClient.setAccessToken(response.data.accessToken);

        console.log(`✅ Logged in: ${email}`);

        return response.data;
    }
}
