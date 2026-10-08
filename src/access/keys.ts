// Neighbourhood names repeat across comunas (e.g. Cerro Nutibara), so keys include the comuna
export const barrioKey = (comuna: number, name: string): string => `${comuna}|${name}`;
