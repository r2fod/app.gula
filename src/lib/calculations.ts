export const getBeverageType = (itemName: string): string => {
  const name = itemName.toLowerCase();

  // Vinos
  if (name.includes('verdejo') || name.includes('rioja') || name.includes('cava')) {
    return 'Vinos';
  }
  // Agua
  if (name.includes('agua') || name.includes('solán')) {
    return 'Agua';
  }
  // Cervezas
  if (name.includes('cerveza') || name.includes('botellín')) {
    return 'Cervezas';
  }
  // Vermut
  if (name.includes('vermut')) {
    return 'Vermut';
  }
  // Ginebra
  if (name.includes('ginebra') || name.includes('puerto de indias')) {
    return 'Ginebra';
  }
  // Ron
  if (name.includes('ron ')) {
    return 'Ron';
  }
  // Whisky
  if (name.includes('ballentines') || name.includes('whisky')) {
    return 'Whisky';
  }
  // Vodka
  if (name.includes('vodka')) {
    return 'Vodka';
  }
  // Tequila
  if (name.includes('tequila')) {
    return 'Tequila';
  }
  // Otros Licores
  if (name.includes('cazalla') || name.includes('baileys') || name.includes('mistela')) {
    return 'Otros Licores';
  }
  // Mixers
  if (name.includes('tónica') || name.includes('hielo')) {
    return 'Mixers';
  }
  // Refrescos
  if (name.includes('coca') || name.includes('fanta') || name.includes('aquarius') ||
    name.includes('nestea') || name.includes('seven') || name.includes('limones')) {
    return 'Refrescos';
  }

  return 'Otros';
};
