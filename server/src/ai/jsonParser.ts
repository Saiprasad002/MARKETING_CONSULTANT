export function safeParseJSON<T = any>(input: string, fallback: T): T {
  if (!input) return fallback;
  
  try {
    // 1. Direct parse
    return JSON.parse(input);
  } catch (e) {
    // 2. Extract ```json ... ``` block if present
    const markdownMatch = input.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
      try {
        return JSON.parse(markdownMatch[1].trim());
      } catch (err) {
        // continue
      }
    }

    // 3. Extract bracketed object/array
    const firstBrace = input.indexOf('{');
    const lastBrace = input.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        const candidate = input.substring(firstBrace, lastBrace + 1);
        return JSON.parse(candidate);
      } catch (err) {
        // continue
      }
    }

    const firstSquare = input.indexOf('[');
    const lastSquare = input.lastIndexOf(']');
    if (firstSquare !== -1 && lastSquare > firstSquare) {
      try {
        const candidate = input.substring(firstSquare, lastSquare + 1);
        return JSON.parse(candidate);
      } catch (err) {
        // continue
      }
    }

    console.warn('Failed to parse AI JSON response, using fallback state.');
    return fallback;
  }
}
