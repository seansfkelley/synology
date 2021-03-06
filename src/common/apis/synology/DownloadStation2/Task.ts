import { BaseRequest, FormFile, RestApiResponse, get, post } from "../shared";

const API_NAME = "SYNO.DownloadStation2.Task";
const CGI_NAME = "entry";

interface BaseDownloadStation2TaskCreateRequest extends BaseRequest {
  create_list?: boolean;
  destination?: string;
  extract_password?: string;
}

export interface DownloadStation2TaskCreateFileRequest
  extends BaseDownloadStation2TaskCreateRequest {
  type: "file";
  file: FormFile;
}

export interface DownloadStation2TaskCreateUrlRequest
  extends BaseDownloadStation2TaskCreateRequest {
  type: "url";
  url: string[];
}

export interface DownloadStation2TaskCreateLocalRequest
  extends BaseDownloadStation2TaskCreateRequest {
  type: "local";
  local_path: string;
}

export type DownloadStation2TaskCreateRequest =
  | DownloadStation2TaskCreateFileRequest
  | DownloadStation2TaskCreateUrlRequest
  | DownloadStation2TaskCreateLocalRequest;

export interface DownloadStation2TaskCreateResponse {
  list_id: string[];
  task_id: string[];
}

function Task_Create(
  baseUrl: string,
  sid: string,
  options: DownloadStation2TaskCreateRequest,
): Promise<RestApiResponse<DownloadStation2TaskCreateResponse>> {
  const commonOptions = {
    // These three must come first. I believe they also must be in this order.
    api: API_NAME,
    method: "create",
    version: 2,
    ...options,
    type: JSON.stringify(options.type),
    // undefined means default location configured on the NAS, which is represented by empty string
    destination: JSON.stringify(options.destination ?? ""),
    create_list: JSON.stringify(options.create_list ?? false),
    sid,
    meta: {
      apiGroup: "DownloadStation2",
      apiSubgroup: "DownloadStation2.Task",
    },
    file: undefined,
    url: undefined,
    local_path: undefined,
  };

  if (options.type === "file") {
    return post(baseUrl, CGI_NAME, {
      ...commonOptions,
      file: '["torrent"]',
      torrent: options.file,
    });
  } else if (options.type === "url") {
    return get(baseUrl, CGI_NAME, {
      ...commonOptions,
      url: JSON.stringify(options.url),
    });
  } else if (options.type === "local") {
    return get(baseUrl, CGI_NAME, {
      ...commonOptions,
      // TODO: Unsure if this works. Documentation isn't clear on how it's intended to work.
      local_path: JSON.stringify(options.local_path),
    });
  } else {
    return Promise.reject(new Error(`illegal type "${(options as any)?.type}"`));
  }
}

export const Task = {
  API_NAME,
  Create: Task_Create,
};
