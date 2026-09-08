interface ItemListItem {
  position: number;
  url: string;
  name: string;
  image?: string;
}

interface ItemListJsonLdProps {
  name: string;
  description?: string;
  items: ItemListItem[];
}

export function ItemListJsonLd({ name, description, items }: ItemListJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description: description || undefined,
    itemListElement: items.map(item => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      url: item.url,
      image: item.image || undefined,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
