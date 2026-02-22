export interface PluginResponse {
  pluginName: string;
  description: string;
  code: string;
  installationSteps: string[];
}

export async function generateWooCommercePlugin(prompt: string): Promise<PluginResponse> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to generate plugin code. Please try again.");
  }

  try {
    const result = await response.json();
    return result as PluginResponse;
  } catch (error) {
    console.error("Failed to parse response", error);
    throw new Error("Failed to generate plugin code. Please try again.");
  }
}

