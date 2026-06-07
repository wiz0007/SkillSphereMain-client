import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://api.skillsphere.space/api";

const CSRF_HEADER_NAME = "X-CSRF-Token";
const UNSAFE_METHODS = new Set(["post", "put", "patch", "delete"]);

let csrfToken = "";
let csrfTokenRequest: Promise<string> | null = null;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const isUnsafeMethod = (config: InternalAxiosRequestConfig) => {
  const method = String(config.method || "get").toLowerCase();
  return UNSAFE_METHODS.has(method);
};

const shouldAttachCsrf = (config: InternalAxiosRequestConfig) => {
  const url = String(config.url || "");

  return (
    isUnsafeMethod(config) &&
    !url.includes("/auth/csrf")
  );
};

const fetchCsrfToken = async () => {
  if (csrfToken) {
    return csrfToken;
  }

  if (!csrfTokenRequest) {
    csrfTokenRequest = api
      .get("/auth/csrf", {
        headers: {
          "x-skip-auth-redirect": "true",
        },
      })
      .then((response) => {
        csrfToken = String(response.data?.csrfToken || "");
        return csrfToken;
      })
      .finally(() => {
        csrfTokenRequest = null;
      });
  }

  return csrfTokenRequest;
};

api.interceptors.request.use(async (config) => {
  /**
   * Replay protection
   * Added to ALL unsafe requests
   */
  if (isUnsafeMethod(config)) {
    config.headers.set(
      "X-Timestamp",
      Date.now().toString()
    );

    config.headers.set(
      "X-Nonce",
      crypto.randomUUID()
    );
  }

  /**
   * CSRF protection
   */
  if (shouldAttachCsrf(config)) {
    const token = await fetchCsrfToken();

    config.headers.set(
      CSRF_HEADER_NAME,
      token
    );
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    console.error(
      "API ERROR:",
      error.response?.data || error.message
    );

    const skipAuthRedirect =
      error.config?.headers?.["x-skip-auth-redirect"] ===
      "true";

    const isCsrfFailure =
      error.response?.status === 403 &&
      String(
        error.response?.data?.code || ""
      ).startsWith("CSRF_TOKEN_");

    if (
      isCsrfFailure &&
      error.config &&
      !(error.config as any)._csrfRetry
    ) {
      csrfToken = "";

      (error.config as any)._csrfRetry = true;

      const token = await fetchCsrfToken();

      error.config.headers?.set(
        CSRF_HEADER_NAME,
        token
      );

      return api.request(error.config);
    }

    if (
      error.response?.status === 401 &&
      !skipAuthRedirect
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
