// Pick colors from https://mui.com/material-ui/customization/color/#2014-material-design-color-palettes
const colors = [
  "#ef9a9a",
  "#ce93d8",
  "#9fa8da",
  "#81d4fa",
  "#80cbc4",
  "#c5e1a5",
  "#fff59d",
  "#ffcc80",
  "#ffab91",
  "#ffab91",
];

const gray = "#bdbdbd";

export class MemorizedColorSelector {
  private colorMap = new Map<string, string>();
  private colorIndex = 0;

  constructor() {}

  pickFor(name?: string): string {
    if (!name) {
      return gray;
    }

    const color = this.colorMap.get(name)
    if (color) {
      return color;
    }

    const newColor = colors[this.colorIndex]
    this.colorMap.set(name, newColor);
    this.colorIndex++;
    this.colorIndex = this.colorIndex % colors.length;
    return newColor;
  }
}
