const DAILY_API_BASE = "https://api.daily.co/v1";

type DailyRoom = {
  name: string;
  url: string;
};

type DailyToken = {
  token: string;
};

function getDailyApiKey() {
  const apiKey = process.env.DAILY_API_KEY;

  if (!apiKey) {
    throw new Error("DAILY_API_KEY is not configured.");
  }

  return apiKey;
}

async function dailyFetch<T>(path: string, init: RequestInit) {
  const response = await fetch(`${DAILY_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getDailyApiKey()}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const body = (await response.json()) as T & { error?: string; info?: string };

  if (!response.ok) {
    throw new Error(body.error || body.info || "Daily API request failed.");
  }

  return body;
}

export async function createDailyRoom(consultationId: string) {
  const roomName = `pawwcure-${consultationId}`;
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24;

  const room = await dailyFetch<DailyRoom>("/rooms", {
    body: JSON.stringify({
      name: roomName,
      privacy: "private",
      properties: {
        enable_chat: true,
        enable_knocking: false,
        exp,
      },
    }),
    method: "POST",
  });

  return room;
}

export async function createDailyMeetingToken({
  isOwner,
  roomName,
  userId,
  userName,
}: {
  isOwner: boolean;
  roomName: string;
  userId: string;
  userName: string;
}) {
  const now = Math.floor(Date.now() / 1000);

  const token = await dailyFetch<DailyToken>("/meeting-tokens", {
    body: JSON.stringify({
      properties: {
        enable_prejoin_ui: true,
        enable_screenshare: true,
        exp: now + 60 * 60 * 6,
        is_owner: isOwner,
        room_name: roomName,
        user_id: userId.slice(0, 36),
        user_name: userName,
      },
    }),
    method: "POST",
  });

  return token.token;
}
