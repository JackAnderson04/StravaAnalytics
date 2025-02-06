// utils/oauth.ts
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
};

export const config = {
    clientId: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID || '',
    clientSecret: process.env.STRAVA_CLIENT_SECRET || '',
    redirectUri: `${getBaseUrl()}/api/auth/callback`,
    scope: "activity:read_all,profile:read_all"
} as const;

export const getAuthUrl = () => {
    if (!config.clientId) {
        throw new Error('Strava Client ID not configured');
    }

    const params = new URLSearchParams();
    params.append('client_id', config.clientId);
    params.append('response_type', 'code');
    params.append('redirect_uri', config.redirectUri);
    params.append('scope', config.scope);
    params.append('approval_prompt', 'force');

    return `https://www.strava.com/oauth/authorize?${params.toString()}`;
};

export const handleStravaLogin = () => {
    window.location.href = getAuthUrl();
};

export const getToken = async (code: string) => {
    if (!config.clientId || !config.clientSecret) {
        throw new Error('Strava credentials not configured');
    }

    try {
        const response = await fetch("https://www.strava.com/oauth/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                client_id: config.clientId,
                client_secret: config.clientSecret,
                code,
                grant_type: "authorization_code",
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to exchange code for token');
        }

        return response.json();
    } catch (error) {
        console.error('Token exchange error:', error);
        throw error;
    }
};

export const refreshToken = async (refreshToken: string) => {
    if (!config.clientId || !config.clientSecret) {
        throw new Error('Strava credentials not configured');
    }

    try {
        const response = await fetch("https://www.strava.com/oauth/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                client_id: config.clientId,
                client_secret: config.clientSecret,
                refresh_token: refreshToken,
                grant_type: "refresh_token",
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to refresh token');
        }

        return response.json();
    } catch (error) {
        console.error('Token refresh error:', error);
        throw error;
    }
};