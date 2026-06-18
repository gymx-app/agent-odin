const unsupported = (value: unknown): never => {
  throw new TypeError(`Unsupported canonical JSON value: ${typeof value}`);
};

export const canonicalizeJson = (value: unknown): string => {
  if (value === null) {
    return 'null';
  }

  if (typeof value === 'string' || typeof value === 'boolean') {
    return JSON.stringify(value);
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? JSON.stringify(value) : unsupported(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(canonicalizeJson).join(',')}]`;
  }

  if (typeof value === 'object') {
    const object = value as Record<string, unknown>;
    const entries = Object.keys(object)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalizeJson(object[key])}`);

    return `{${entries.join(',')}}`;
  }

  return unsupported(value);
};
