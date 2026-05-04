import { renderTemplate } from "storybook-shopify"

import template from "../sections/welcome.liquid"

export default {
  title: "Sections/Welcome Page",

  // Setting component lets the schema enhancer read {% schema %} and
  // generate argTypes automatically from the section's settings.
  component: template,

  // Flat args map 1:1 to section.settings.* — render() wraps them.
  render: args =>
    renderTemplate(template, {
      section: { settings: args },
    }),
}

export const WelcomePage = {}
