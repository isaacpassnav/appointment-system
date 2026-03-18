import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_TARGET = 'http://localhost:3000/api';
const TARGET_BASE = process.env.API_PROXY_TARGET ?? DEFAULT_TARGET;

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

function buildTargetUrl(request: NextRequest, pathSegments: string[]) {
  const targetBase = TARGET_BASE.endsWith('/')
    ? TARGET_BASE.slice(0, -1)
    : TARGET_BASE;
  const targetPath = pathSegments.length ? `/${pathSegments.join('/')}` : '';
  const targetUrl = new URL(`${targetBase}${targetPath}`);
  targetUrl.search = request.nextUrl.search;
  return targetUrl;
}

type RouteContext = {
  params: Promise<Record<string, string | string[]>>;
};

function normalizePathSegments(params: Record<string, string | string[]>) {
  const raw = params.path;
  if (!raw) {
    return [];
  }
  return Array.isArray(raw) ? raw : [raw];
}

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  const pathSegments = normalizePathSegments(params);
  const targetUrl = buildTargetUrl(request, pathSegments);
  const headers = new Headers(request.headers);

  headers.delete('host');
  headers.delete('accept-encoding');
  HOP_BY_HOP_HEADERS.forEach((header) => headers.delete(header));

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const body = hasBody ? await request.arrayBuffer() : undefined;

  const upstreamResponse = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
    redirect: 'manual',
  });

  const responseHeaders = new Headers(upstreamResponse.headers);
  HOP_BY_HOP_HEADERS.forEach((header) => responseHeaders.delete(header));
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('content-length');

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}
