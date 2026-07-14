import slugPkg from 'slug';

export function generateSlug(text: string): string {
  return slugPkg(text, { lower: true, trim: true });
}

export async function uniqueSlug(
  text: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  let base = generateSlug(text);
  let candidate = base;
  let counter = 1;

  while (await checkExists(candidate)) {
    candidate = `${base}-${counter}`;
    counter++;
  }

  return candidate;
}
