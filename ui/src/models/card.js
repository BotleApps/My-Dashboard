export default class Card {
  constructor(id, title, description, metricType, value, width = 3, height = 1, theme = '1') {
    this.id = id;
    this.title = title;
    this.description = description;
    this.metricType = metricType;
    this.value = value;
    this.width = width;
    this.height = height;
    this.theme = theme;
  }
}