const SSL_INIT_URL = "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";
const SSL_VALIDATION_URL =
  "https://sandbox.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php";

type InitPaymentInput = {
  amount: number;
  cancelUrl: string;
  customer: {
    address?: string;
    city?: string;
    email: string;
    name: string;
    phone?: string;
  };
  failUrl: string;
  productName: string;
  successUrl: string;
  tranId: string;
};

type InitPaymentResult = {
  gatewayPageUrl: string;
  sessionKey?: string;
  raw: Record<string, unknown>;
};

type SslCredential = {
  storeId: string;
  storePassword: string;
};

function getSslCredentials(): SslCredential {
  const storeId = process.env.SSL_Store_ID ?? process.env.SSLCOMMERZ_STORE_ID;
  const storePassword =
    process.env.SSL_Store_Password ?? process.env.SSLCOMMERZ_STORE_PASS;

  if (!storeId || !storePassword) {
    throw new Error(
      "SSLCommerz sandbox credentials are missing. Set SSL_Store_ID and SSL_Store_Password."
    );
  }

  return { storeId, storePassword };
}

export function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.replace(/^/, "https://") ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export async function initiateSslCommerzPayment(
  input: InitPaymentInput
): Promise<InitPaymentResult> {
  const { storeId, storePassword } = getSslCredentials();
  const params = new URLSearchParams({
    cancel_url: input.cancelUrl,
    currency: "BDT",
    cus_add1: input.customer.address || "Dhaka",
    cus_city: input.customer.city || "Dhaka",
    cus_country: "Bangladesh",
    cus_email: input.customer.email,
    cus_name: input.customer.name,
    cus_phone: input.customer.phone || "01700000000",
    fail_url: input.failUrl,
    format: "json",
    product_category: "Veterinary consultation",
    product_name: input.productName,
    product_profile: "general",
    shipping_method: "NO",
    store_id: storeId,
    store_passwd: storePassword,
    success_url: input.successUrl,
    total_amount: input.amount.toFixed(2),
    tran_id: input.tranId,
  });

  const response = await fetch(SSL_INIT_URL, {
    body: params,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  const responseText = await response.text();
  let raw: Record<string, unknown>;

  try {
    raw = JSON.parse(responseText) as Record<string, unknown>;
  } catch {
    throw new Error(
      `SSLCommerz returned a non-JSON response. Check sandbox credentials and callback URLs. Response: ${responseText.slice(
        0,
        180
      )}`
    );
  }

  const gatewayPageUrl =
    typeof raw.GatewayPageURL === "string" ? raw.GatewayPageURL : "";

  if (!response.ok || !gatewayPageUrl) {
    const failedReason =
      typeof raw.failedreason === "string"
        ? raw.failedreason
        : "SSLCommerz failed to create a payment session.";
    throw new Error(failedReason);
  }

  return {
    gatewayPageUrl,
    raw,
    sessionKey: typeof raw.sessionkey === "string" ? raw.sessionkey : undefined,
  };
}

export async function validateSslCommerzTransaction(tranId: string) {
  const { storeId, storePassword } = getSslCredentials();
  const url = new URL(SSL_VALIDATION_URL);
  url.searchParams.set("tran_id", tranId);
  url.searchParams.set("store_id", storeId);
  url.searchParams.set("store_passwd", storePassword);

  const response = await fetch(url);
  const raw = (await response.json()) as Record<string, unknown>;

  return {
    isValid:
      raw.APIConnect === "DONE" &&
      Array.isArray(raw.element) &&
      raw.element.some((item) => {
        if (!item || typeof item !== "object") return false;
        const status = (item as { status?: unknown }).status;
        return status === "VALID" || status === "VALIDATED";
      }),
    raw,
  };
}
