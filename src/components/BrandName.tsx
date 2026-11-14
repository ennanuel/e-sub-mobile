/** A development's name with its last word in blue: "City" + "View". */
export function BrandName({ name }: { name: string }) {
  const [first, second] = splitName(name);
  return (
    <>
      {first}
      {second && <span style={{ color: 'var(--blue)' }}>{second}</span>}
    </>
  );
}

/** "CityView" -> ["City", "View"]; "Lekki Gardens" -> ["Lekki ", "Gardens"]. */
export function splitName(name: string): [string, string] {
  const m = name?.match(/^(.+?)([A-Z][a-z]+)$/);
  return m ? [m[1], m[2]] : [name, ''];
}
