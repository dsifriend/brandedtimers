const fs = require("fs");
const path = require("path");

// Read the icon file
const iconPath = path.join(__dirname, "..", "assets", "icon.png");
const iconBuffer = fs.readFileSync(iconPath);
const base64Icon = iconBuffer.toString("base64");
const dataUri = `data:image/png;base64,${base64Icon}`;

// Create templates directory if it doesn't exist
const templatesDir = path.join(__dirname, "..", "assets", "templates");
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// Template definitions
const templates = {
  brandedTimers: {
    name: "Branded Timers",
    colorScheme: "dark",
    primaryHue: 220,
    secondaryHue: 200,
    useBWPrimary: false,
    useBWSecondary: false,
    fontFamily: "inter",
    header: {
      mainHeading: "Branded Timers",
      mainHeadingRight: "",
      subheading: "",
      splitHeading: false,
      imageBase64: dataUri,
    },
  },
  citrusIndustries: {
    name: "Citrus Industries",
    colorScheme: "dark",
    primaryHue: 120,
    secondaryHue: 50,
    useBWPrimary: false,
    useBWSecondary: false,
    fontFamily: "inter",
    header: {
      mainHeading: "Citrus",
      mainHeadingRight: "Industries",
      subheading: "Easy Peasy Lemon Squeaky",
      splitHeading: true,
      imageBase64: dataUri,
    },
  },
  nineties: {
    name: "90's Simulacrum",
    colorScheme: "dark",
    primaryHue: 270,
    secondaryHue: 120,
    useBWPrimary: false,
    useBWSecondary: false,
    fontFamily: "inter",
    header: {
      mainHeading: "90's Simulacrum",
      mainHeadingRight: "",
      subheading: "",
      splitHeading: false,
      imageBase64: null,
    },
  },
  tradeMarker: {
    name: "Trade Marker",
    colorScheme: "dark",
    primaryHue: 0,
    secondaryHue: 0,
    useBWPrimary: true,
    useBWSecondary: false,
    fontFamily: "merriweather",
    header: {
      mainHeading: "Trade Marker",
      mainHeadingRight: "",
      subheading: "Your time starts… now!",
      splitHeading: false,
      imageBase64: null,
    },
  },
};

// Write each template to its own file
Object.entries(templates).forEach(([key, template]) => {
  const filePath = path.join(templatesDir, `${key}.json`);
  fs.writeFileSync(filePath, JSON.stringify(template, null, 2));
  console.log(`Created ${key}.json`);
});

console.log("All templates generated successfully!");
