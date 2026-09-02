import type { ApiResponse, AuthTokens, LeadInput, ProjectSummary } from '@real-estate/types';

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown };
export class ApiClient {
  constructor(private readonly baseUrl: string, private readonly getToken?: () => string | null) {}
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    const token = this.getToken?.(); if (token) headers.set('Authorization', `Bearer ${token}`);
    const response = await fetch(`${this.baseUrl}${path}`, { ...options, headers, body: options.body === undefined ? undefined : JSON.stringify(options.body) });
    const payload = await response.json() as ApiResponse<T> | { message: string };
    if (!response.ok || !('success' in payload)) throw new Error('message' in payload ? payload.message : 'Request failed');
    return payload.data;
  }
  projects(): Promise<ProjectSummary[]> { return this.request('/projects'); }
  project(slug: string): Promise<ProjectSummary> { return this.request(`/projects/${slug}`); }
  createLead(projectId: string, lead: LeadInput): Promise<{ id: string }> { return this.request(`/projects/${projectId}/leads`, { method: 'POST', body: lead }); }
  login(email: string, password: string): Promise<AuthTokens> { return this.request('/auth/login', { method: 'POST', body: { email, password } }); }
}
