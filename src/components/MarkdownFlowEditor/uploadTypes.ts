export interface UploadRequestOption {
  file: File;
  filename?: string;
  data?: Record<string, any> | FormData;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  action?: string;
  onProgress?: (event: { percent: number }) => void;
  onSuccess?: (response: any) => void;
  onError?: (error: Error) => void;
}

export interface UploadProps {
  action?: string | ((file: File) => string | Promise<string>);
  headers?: Record<string, string>;
  data?: Record<string, any> | ((file: File) => Record<string, any>);
  withCredentials?: boolean;
  name?: string;
  beforeUpload?: (
    file: File
  ) => boolean | void | Blob | File | Promise<boolean | void | Blob | File>;
  customRequest?: (options: UploadRequestOption) => void;
  onSuccess?: (response: any, file: File) => void;
  onError?: (error: Error, file: File) => void;
  onProgress?: (event: { percent: number }, file: File) => void;
}
