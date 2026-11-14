export const isEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v.trim());

/** A Nigerian number after +234 has 10 digits. */
export const isLocalPhone = (v: string) => v.replace(/\D/g, '').length === 10;

export const isFilled = (v: string | undefined | null) => !!v && v.trim().length > 0;
