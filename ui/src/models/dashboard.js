export default class Dashboard {
  constructor(id, name, description, slug, theme = '1', cards = []) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.slug = slug;
    this.theme = theme;
    // Ensure cards is always an array
    this.cards = Array.isArray(cards) ? cards : [];
  }
}