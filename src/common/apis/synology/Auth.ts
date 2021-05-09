import { RestApiResponse, BaseRequest, get, SessionName } from "./shared";

const CGI_NAME = "auth" as const;
const API_NAME = "SYNO.API.Auth" as const;

export interface AuthLoginRequest extends BaseRequest {
  account: string;
  passwd: string;
  session: SessionName;
  // 2 is the lowest version that actually provides an sid.
  // 3 is the lowest version that DSM 7 supports.
  version: 2 | 3;
}

export interface AuthLoginResponse {
  sid: string;
}

export interface AuthLogoutRequest extends BaseRequest {
  sid: string;
  session: SessionName;
}

function Login(
  baseUrl: string,
  options: AuthLoginRequest,
): Promise<RestApiResponse<AuthLoginResponse>> {
  return get(baseUrl, CGI_NAME, {
    ...options,
    api: API_NAME,
    method: "login",
    format: "sid",
  });
}

function Logout(baseUrl: string, options: AuthLogoutRequest): Promise<RestApiResponse<{}>> {
  return get(baseUrl, CGI_NAME, {
    ...options,
    api: API_NAME,
    version: 1,
    method: "logout",
  });
}

export const Auth = {
  API_NAME,
  Login,
  Logout,
};