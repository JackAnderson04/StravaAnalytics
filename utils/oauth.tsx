const getBaseUrl = () => {
  if (process.env.VERCEL_URL) { //Vercel provides process.env.VERCEL_URL in production
    return `https://${process.env.VERCEL_URL}`;
  }
  
  if (typeof window !== 'undefined') { //for local development, we can use window.location.origin if available
    return window.location.origin;
  }
  
  return 'http://localhost:3000';   //fallback for server-side rendering in development
};

export const config = {
    clientId: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID || '',
    clientSecret: process.env.STRAVA_CLIENT_SECRET || '',
    // Construct the redirect URI dynamically
    get redirectUri() {
        const uri = `${getBaseUrl()}/api/auth/callback`;
        console.log('Generated redirect URI:', uri); // Debug log
        return uri;
    },
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

    const authUrl = `https://www.strava.com/oauth/authorize?${params.toString()}`;
    console.log('Generated auth URL:', authUrl); // Debug log
    return authUrl;
};

export const handleStravaLogin = () => {
    window.location.href = getAuthUrl();
};

export const getToken = async (code: string) => {
    if (!config.clientId || !config.clientSecret) {
        throw new Error('Strava credentials not configured');
    }

    const tokenRequestBody = {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        grant_type: "authorization_code",
    };

    console.log('Token exchange request:', {
        url: "https://www.strava.com/oauth/token",
        body: { ...tokenRequestBody, client_secret: '[REDACTED]' }
    });

    try {
        const response = await fetch("https://www.strava.com/oauth/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(tokenRequestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Strava API error response:', errorData);
            throw new Error(errorData.message || 'Failed to exchange code for token');
        }

        const tokenData = await response.json();
        console.log('Token exchange successful');
        return tokenData;
    } catch (error) {
        console.error('Token exchange error:', error);
        throw error;
    }
};

export const refreshToken = async (refreshToken: string) => {
    if (!config.clientId || !config.clientSecret) {
        throw new Error('Strava credentials not configured');
    }

    const refreshRequestBody = {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
    };

    try {
        const response = await fetch("https://www.strava.com/oauth/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(refreshRequestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Token refresh error response:', errorData);
            throw new Error(errorData.message || 'Failed to refresh token');
        }

        const tokenData = await response.json();
        console.log('Token refresh successful');
        return tokenData;
    } catch (error) {
        console.error('Token refresh error:', error);
        throw error;
    }
};