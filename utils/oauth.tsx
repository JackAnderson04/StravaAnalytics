// utils/oauth.ts
export const config = {
  clientId: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
  clientSecret: process.env.STRAVA_CLIENT_SECRET, // This should never be exposed to the client
  redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI || "http://localhost:3000/api/auth/callback",
  scope: "activity:read_all,profile:read_all"
};

export const getAuthUrl = () => {
  if (!config.clientId) {
    throw new Error('Strava Client ID not configured');
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    redirect_uri: config.redirectUri,
    scope: config.scope,
    approval_prompt: 'force'
  });

  return `https://www.strava.com/oauth/authorize?${params.toString()}`;
};

export const handleStravaLogin = () => {
  try {
    const authUrl = getAuthUrl();
    window.location.href = authUrl;
  } catch (error) {
    console.error('Failed to initiate Strava login:', error);
    // You might want to handle this error more gracefully in the UI
  }
};

// This should be called from the server side only
export const getToken = async (code: string) => {
  if (!config.clientSecret) {
    throw new Error('Strava Client Secret not configured');
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

    return await response.json();
  } catch (error) {
    console.error('Token exchange error:', error);
    throw error;
  }
};

// This should be called from the server side only
export const refreshToken = async (refreshToken: string) => {
  if (!config.clientSecret) {
    throw new Error('Strava Client Secret not configured');
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

    return await response.json();
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
}