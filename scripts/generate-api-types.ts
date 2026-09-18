import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://main-backend-njndy.ondigitalocean.app';
const OUTPUT_DIR = path.join(process.cwd(), 'lib', 'api', 'generated');

async function generateTypes() {
  console.log('🚀 Starting OpenAPI type generation...');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  try {
    // Fetch OpenAPI spec from backend
    console.log(`📡 Fetching OpenAPI spec from ${API_BASE_URL}/api/docs-json`);
    const specUrl = `${API_BASE_URL}/api/docs-json`;

    // Check if we have a local openapi.json as fallback
    const localSpecPath = path.join(process.cwd(), '..', 'backend', 'openapi.json');
    let specContent: string;

    if (fs.existsSync(localSpecPath)) {
      console.log('✅ Using local openapi.json file');
      specContent = fs.readFileSync(localSpecPath, 'utf-8');
    } else {
      // Fetch from remote
      const response = await fetch(specUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch OpenAPI spec: ${response.statusText}`);
      }
      specContent = await response.text();
    }

    // Save spec to generated directory
    const specPath = path.join(OUTPUT_DIR, 'openapi.json');
    fs.writeFileSync(specPath, specContent);
    console.log('✅ OpenAPI spec saved to lib/api/generated/openapi.json');

    // Generate TypeScript types using openapi-typescript
    console.log('🔧 Generating TypeScript types...');
    const typesPath = path.join(OUTPUT_DIR, 'types.gen.ts');

    await execAsync(`npx openapi-typescript ${specPath} --output ${typesPath} --immutable`);
    console.log('✅ TypeScript types generated at lib/api/generated/types.gen.ts');

    // Create client.ts with typed fetch wrapper
    console.log('🔧 Creating typed client...');
    const clientPath = path.join(OUTPUT_DIR, 'client.gen.ts');
    const clientCode = `import type { paths } from './types.gen';

// Create a typed API client using fetch
export type ApiPaths = paths;

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export class ApiClientError extends Error {
  public statusCode: number;
  public details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Base fetch wrapper that will be extended with auth middleware
export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new ApiClientError(
      error.message || \`HTTP error! status: \${response.status}\`,
      response.status,
      error
    );
  }

  return response.json();
}
`;
    fs.writeFileSync(clientPath, clientCode);
    console.log('✅ Typed client created at lib/api/generated/client.gen.ts');

    // Create index.ts barrel file
    const indexPath = path.join(OUTPUT_DIR, 'index.ts');
    const indexCode = `export type { paths, components } from './types.gen';
export * from './client.gen';
`;
    fs.writeFileSync(indexPath, indexCode);
    console.log('✅ Index file created at lib/api/generated/index.ts');

    console.log('🎉 Type generation complete!');
  } catch (error) {
    console.error('❌ Type generation failed:', error);
    process.exit(1);
  }
}

generateTypes();