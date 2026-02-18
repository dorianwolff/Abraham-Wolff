export async function loadJson(path) {
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

export async function loadArtists() {
  return loadJson('./data/artists.json');
}

export async function loadArtistBio(slug) {
  return loadJson(`./data/artists/${slug}.json`);
}
