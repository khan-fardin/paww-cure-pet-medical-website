import { RtcRole, RtcTokenBuilder } from "agora-token";

const TOKEN_TTL_SECONDS = 60 * 60 * 2;

function getAgoraConfig() {
  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appId) {
    throw new Error("AGORA_APP_ID is not configured.");
  }

  if (!appCertificate) {
    throw new Error("AGORA_APP_CERTIFICATE is not configured.");
  }

  return { appCertificate, appId };
}

export function createAgoraChannelName(consultationId: string) {
  return `pawwcure-${consultationId}`.slice(0, 63);
}

export function createAgoraRtcToken({
  channelName,
  userId,
}: {
  channelName: string;
  userId: string;
}) {
  const { appCertificate, appId } = getAgoraConfig();
  const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;

  return {
    appId,
    channelName,
    expiresAt,
    token: RtcTokenBuilder.buildTokenWithUserAccount(
      appId,
      appCertificate,
      channelName,
      userId,
      RtcRole.PUBLISHER,
      TOKEN_TTL_SECONDS,
      TOKEN_TTL_SECONDS
    ),
    uid: userId,
  };
}
