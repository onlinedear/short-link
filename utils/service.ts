export interface ShortLinkGenerateRequest {
  url: string;
}

export interface ShortLinkData {
  code?: string;
  url: string;
  short_link: string;
}
