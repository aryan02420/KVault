import {
  deleteTextSecret,
  getStats,
  readTextSecret,
  writeTextSecret,
} from "./db.ts";
import {
  CreateTextSecretInputType,
  CreateTextSecretOutputType,
  FetchTextSecretInputType,
  TextSecretPayloadType,
} from "./schema.ts";

export async function createTextSecret(
  input: CreateTextSecretInputType,
): Promise<CreateTextSecretOutputType> {
  const payload = {
    type: "text" as const,
    data: input.data,
  };

  const id = await writeTextSecret(payload);
  return { id };
}

export async function fetchTextSecret(
  input: FetchTextSecretInputType,
): Promise<TextSecretPayloadType | null> {
  const secret = await readTextSecret(input);
  
  if (!secret) {
    return null;
  }
  
  deleteTextSecret(input);
  return secret;
}

export async function stats(): Promise<string> {
  return (await getStats()).toString();
}
