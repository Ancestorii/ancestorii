/**
 * Structured data written into the page's HTML. (next/script with afterInteractive only adds it
 * after hydration, so crawlers that don't run JavaScript, including most AI search crawlers,
 * never see it.) `<` is escaped so no string in the data can close the tag.
 */
export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
